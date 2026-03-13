import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';
import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';
import * as AuthorizeNet from 'authorizenet';

export class AuthorizeNetController {
  getIframeToken = asyncHandler(async (req: Request, res: Response) => {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    // 1. Get business & config
    const businessRepository = new BusinessRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();
    const business = await businessRepository.findOne();
    if (!business) {
      return res.status(500).json({ success: false, message: 'Business not configured' });
    }

    const settings = await businessSettingsRepository.findByBusinessId(business.id);
    const authNetApiLoginId = settings?.authorizeNetApiLoginId;
    const authNetTransactionKey = settings?.authorizeNetTransactionKey;

    if (!authNetApiLoginId || !authNetTransactionKey) {
      return res
        .status(500)
        .json({ success: false, message: 'Authorize.Net payment gateway is not configured' });
    }

    try {
      const merchantAuthenticationType = new AuthorizeNet.APIContracts.MerchantAuthenticationType();
      merchantAuthenticationType.setName(authNetApiLoginId);
      merchantAuthenticationType.setTransactionKey(authNetTransactionKey);

      const transactionRequestType = new AuthorizeNet.APIContracts.TransactionRequestType();
      transactionRequestType.setTransactionType(
        AuthorizeNet.APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
      );
      
      // Authorize.Net expects a string with exactly 2 decimal places in some cases
      const rawAmount = parseFloat(String(amount || 0));
      const formattedAmount = (isNaN(rawAmount) ? 0 : rawAmount).toFixed(2);

      if (Number(formattedAmount) <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid amount: A positive value is required.' });
      }

      transactionRequestType.setAmount(formattedAmount);

      const { customer, delivery } = req.body;
      if (customer && customer.email) {
        const customerData = new AuthorizeNet.APIContracts.CustomerDataType();
        customerData.setEmail(customer.email);
        transactionRequestType.setCustomer(customerData);
      }

      if (delivery) {
        const shippingAddress = new AuthorizeNet.APIContracts.NameAndAddressType();
        
        const firstName = (delivery.name?.split(' ')[0] || customer?.name?.split(' ')[0] || 'Guest').trim() || 'Guest';
        const lastName = (delivery.name?.split(' ').slice(1).join(' ') || customer?.name?.split(' ').slice(1).join(' ') || 'Customer').trim() || 'Customer';
        
        shippingAddress.setFirstName(firstName);
        shippingAddress.setLastName(lastName);
        
        if (delivery.address) {
          const street = (delivery.address.address1 || delivery.address.street || '').trim();
          const city = (delivery.address.city || '').trim();
          const state = (delivery.address.state || '').trim();
          const zip = (delivery.address.zipcode || delivery.address.zipCode || '').trim();
          
          if (street) shippingAddress.setAddress(street);
          if (city) shippingAddress.setCity(city);
          if (state) shippingAddress.setState(state);
          if (zip) shippingAddress.setZip(zip);
          shippingAddress.setCountry(delivery.address.country || 'USA');
        }
        transactionRequestType.setShipTo(shippingAddress);
      }

      // Setup Hosted Payment Settings
      const setting1 = new AuthorizeNet.APIContracts.SettingType();
      setting1.setSettingName('hostedPaymentButtonOptions');
      setting1.setSettingValue('{"text": "Pay"}');

      const setting2 = new AuthorizeNet.APIContracts.SettingType();
      setting2.setSettingName('hostedPaymentOrderOptions');
      setting2.setSettingValue('{"show": false}');

      const setting3 = new AuthorizeNet.APIContracts.SettingType();
      setting3.setSettingName('hostedPaymentPaymentOptions');
      setting3.setSettingValue(
        '{"cardCodeRequired": true, "showCreditCard": true, "showBankAccount": true}'
      );

      const setting4 = new AuthorizeNet.APIContracts.SettingType();
      setting4.setSettingName('hostedPaymentIFrameCommunicatorUrl');
      // The frontend must host this HTML file to receive iframe resize/success messages
      const originUrl = req.get('origin') || `${req.protocol}://${req.get('host')}`;
      let secureOriginUrl = originUrl.replace(/^http:/, 'https:');

      // Authorize.Net strictly validates the hostedPaymentIFrameCommunicatorUrl and rejects localhost or IPs with ports.
      // During local development, we use lvh.me which resolves to 127.0.0.1 and is a valid domain.
      if (originUrl.includes('localhost') || originUrl.includes('127.0.0.1')) {
        try {
          const url = new URL(originUrl);
          const port = url.port;
          secureOriginUrl = `https://lvh.me${port ? `:${port}` : ''}`;
        } catch (e) {
          console.warn('Failed to parse origin URL for lvh.me fallback:', originUrl);
          // Fallback to a valid-looking domain if parsing fails
          secureOriginUrl = 'https://lvh.me';
        }
      }

      // Use the secure origin (lvh.me for local dev) for all settings
      setting4.setSettingValue('{"url": "' + secureOriginUrl + '/communicator.html"}');

      // Add Return Options as a fallback
      const setting5 = new AuthorizeNet.APIContracts.SettingType();
      setting5.setSettingName('hostedPaymentReturnOptions');
      setting5.setSettingValue(
        JSON.stringify({
          showReceipt: true,
          url: `${secureOriginUrl}/order-success`,
          urlText: 'Continue to Order Confirmation',
          cancelUrl: `${secureOriginUrl}/checkout`,
          cancelUrlText: 'Back to Checkout',
        })
      );

      const settingList = [setting1, setting2, setting3, setting4, setting5];
      const alist = new AuthorizeNet.APIContracts.ArrayOfSetting();
      alist.setSetting(settingList);

      const getRequest = new AuthorizeNet.APIContracts.GetHostedPaymentPageRequest();
      getRequest.setMerchantAuthentication(merchantAuthenticationType);
      getRequest.setTransactionRequest(transactionRequestType);
      getRequest.setHostedPaymentSettings(alist);


      const generateToken = async (envPath: string): Promise<string> => {
        const ctrl = new AuthorizeNet.APIControllers.GetHostedPaymentPageController(getRequest.getJSON());
        ctrl.setEnvironment(envPath);

        return new Promise((resolve, reject) => {
          ctrl.execute(() => {
            const apiResponse = ctrl.getResponse();
            if (!apiResponse) {
              console.error(`Authorize.Net Error: No response received from ${envPath}`);
              return reject(new Error('No response from Authorize.Net'));
            }
            const response = new AuthorizeNet.APIContracts.GetHostedPaymentPageResponse(apiResponse);

            if (
              response != null &&
              response.getMessages() != null &&
              response.getMessages().getResultCode() == AuthorizeNet.APIContracts.MessageTypeEnum.OK
            ) {
              resolve(response.getToken());
            } else {
              let errorMsg = 'Failed to generate payment token.';
              if (response && response.getMessages() != null) {
                errorMsg = response.getMessages().getMessage()[0].getText();
                console.error(`Authorize.Net Error from ${envPath}:`, JSON.stringify(response.getMessages(), null, 2));
              }
              reject(new Error(errorMsg));
            }
          });
        });
      };

      const environment = settings?.authorizeNetEnvironment || 'sandbox';
      const endpoint = environment === 'production' 
        ? AuthorizeNet.Constants.endpoint.production 
        : AuthorizeNet.Constants.endpoint.sandbox;
      
      const token = await generateToken(endpoint);

      return sendSuccess(res, 'Payment token generated', { token, environment });
    } catch (err: any) {
      console.error('Final Payment Gateway Error:', err);
      return res
        .status(500)
        .json({ success: false, message: 'Payment gateway error', error: err.message });
    }
  });
}
