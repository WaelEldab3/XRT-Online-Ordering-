import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { CreateOrderUseCase } from '../../domain/usecases/order/CreateOrderUseCase';
import { GetOrderUseCase } from '../../domain/usecases/order/GetOrderUseCase';
import { GetOrdersUseCase } from '../../domain/usecases/order/GetOrdersUseCase';
import { UpdateOrderStatusUseCase } from '../../domain/usecases/order/UpdateOrderStatusUseCase';
import { DeleteOrderUseCase } from '../../domain/usecases/order/DeleteOrderUseCase';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError, NotFoundError } from '../../shared/errors/AppError';
import { emitNewOrder } from '../../services/printer/orderPrintEvents';
import { routeOrderToPrinters } from '../../services/printer/printRoutingService';
import { PrintLogRepository } from '../../infrastructure/repositories/PrintLogRepository';
import { Server as SocketIOServer } from 'socket.io';

import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';
import * as AuthorizeNet from 'authorizenet';

export class OrderController {
  private createOrderUseCase: CreateOrderUseCase;
  private getOrderUseCase: GetOrderUseCase;
  private getOrdersUseCase: GetOrdersUseCase;
  private updateOrderStatusUseCase: UpdateOrderStatusUseCase;
  private deleteOrderUseCase: DeleteOrderUseCase;

  constructor() {
    const orderRepository = new OrderRepository();
    const itemRepository = new ItemRepository();
    const categoryRepository = new CategoryRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();
    this.createOrderUseCase = new CreateOrderUseCase(
      orderRepository,
      itemRepository,
      categoryRepository,
      businessSettingsRepository
    );
    this.getOrderUseCase = new GetOrderUseCase(orderRepository);
    this.getOrdersUseCase = new GetOrdersUseCase(orderRepository);
    this.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);
    this.deleteOrderUseCase = new DeleteOrderUseCase(orderRepository);
  }

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    // In a real scenario, customer_id might come from req.user if customer is logging in
    const customer_id = req.user?.id || req.body.customer_id;

    if (!customer_id) {
      throw new ValidationError('customer_id is required');
    }

    const orderData = {
      ...req.body,
      customer_id,
    };

    const order = await this.createOrderUseCase.execute(orderData);
    const payload = { orderId: order.id, orderNumber: order.order_number };
    emitNewOrder(payload);
    const socketIo = req.app.get('io') as SocketIOServer | undefined;
    if (socketIo) socketIo.emit('new-order', order);
    return sendSuccess(res, 'Order created successfully', order, 201);
  });

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const statusParam = req.query.status as string | undefined;
    const status = statusParam
      ? statusParam.includes(',')
        ? statusParam
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : statusParam
      : undefined;
    const filters: any = {
      status,
      order_type: req.query.order_type as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };

    // If a customer is querying their own orders
    if (req.user?.role === 'customer') {
      filters.customer_id = req.user.id;
    } else if (req.query.customer_id) {
      filters.customer_id = req.query.customer_id as string;
    }

    const orders = await this.getOrdersUseCase.execute(filters);
    return sendSuccess(res, 'Orders retrieved successfully', orders);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const order = await this.getOrderUseCase.execute(id);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Optional: authorization check to ensure customer owns the order
    if (req.user?.role === 'customer' && order.customer_id !== req.user.id) {
      throw new NotFoundError('Order not found'); // Hide existence to unauthorized users
    }

    return sendSuccess(res, 'Order retrieved successfully', order);
  });

  updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, cancelled_reason, cancelled_by, ready_time, clear_schedule } = req.body;

    if (!status) {
      throw new ValidationError('Status is required');
    }

    const order = await this.updateOrderStatusUseCase.execute(id, {
      status,
      ready_time: ready_time ? new Date(ready_time) : undefined,
      clear_schedule: !!clear_schedule,
      cancelled_reason,
      cancelled_by: cancelled_by || req.user?.role || 'system',
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return sendSuccess(res, 'Order status updated successfully', order);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const success = await this.deleteOrderUseCase.execute(id);

    if (!success) {
      throw new NotFoundError('Order not found or already deleted');
    }

    return sendSuccess(res, 'Order deleted successfully', { deleted: true });
  });

  /** POST /orders/:id/reprint — clear print status and trigger routing again (manual reprint). */
  reprint = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const printerId = req.body.printerId as string | undefined;

    const order = await this.getOrderUseCase.execute(orderId);
    if (!order) throw new NotFoundError('Order not found');

    const orderRepository = new OrderRepository();
    await orderRepository.clearPrintStatus(orderId, printerId);
    setImmediate(() => {
      routeOrderToPrinters(orderId).catch(() => {});
    });
    return sendSuccess(res, 'Reprint triggered', { orderId, printerId: printerId ?? 'all' });
  });

  /** GET /orders/:id/print-logs — list print attempt logs for an order. */
  getPrintLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const order = await this.getOrderUseCase.execute(orderId);
    if (!order) throw new NotFoundError('Order not found');
    const printLogRepo = new PrintLogRepository();
    const logs = await printLogRepo.findByOrderId(orderId);
    return sendSuccess(res, 'Print logs retrieved', logs);
  });

  /** POST /orders/:id/refund — Process a full or partial refund for an order. */
  refundOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const { amount } = req.body; // If empty, it means a full refund

    console.log('Refund Request Received:', { orderId, amount, body: req.body });

    const orderRepository = new OrderRepository();
    const order = await orderRepository.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.money.payment_id) {
      console.error('Refund Error: Order has no associated payment ID', { orderId });
      return res.status(400).json({ success: false, message: 'Order has no associated payment ID to refund' });
    }

    // Determine refund amount
    const rawTotalAmount = parseFloat(String(order.money.total_amount || 0));
    const refundAmountRaw = amount !== undefined ? parseFloat(String(amount)) : rawTotalAmount;
    
    if (isNaN(refundAmountRaw) || refundAmountRaw <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid refund amount.' });
    }

    if (refundAmountRaw > rawTotalAmount) {
      console.error('Refund Error: Amount exceeds original total', { refundAmountRaw, rawTotalAmount });
      return res.status(400).json({ success: false, message: 'Refund amount cannot exceed the original order total.' });
    }

    const formattedAmount = refundAmountRaw.toFixed(2);

    // Get gateway credentials
    const businessSettingsRepository = new BusinessSettingsRepository();
    const settings = await businessSettingsRepository.findByBusinessId(order.business_id);

    // If payment was NMI (just failing gracefully to focus on AuthNet)
    if (order.money.payment === 'nmi') {
      return res.status(400).json({ success: false, message: 'Refunds for NMI are currently not implemented via this endpoint.' });
    }

    const authNetApiLoginId = settings?.authorizeNetApiLoginId;
    const authNetTransactionKey = settings?.authorizeNetTransactionKey;

    if (!authNetApiLoginId || !authNetTransactionKey) {
      console.error('Refund Error: Authorize.Net is not configured', { businessId: order.business_id });
      return res.status(500).json({ success: false, message: 'Authorize.Net payment gateway is not configured' });
    }

    const merchantAuthenticationType = new AuthorizeNet.APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(authNetApiLoginId);
    merchantAuthenticationType.setTransactionKey(authNetTransactionKey);

    // Attempt Refund Transaction
    const transactionRequestType = new AuthorizeNet.APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(AuthorizeNet.APIContracts.TransactionTypeEnum.REFUNDTRANSACTION);
    transactionRequestType.setAmount(formattedAmount);
    transactionRequestType.setRefTransId(order.money.payment_id);
    
    // AuthNet Refunds require the last 4 digits of the card
    const last4 = order.money.last_4 || '0000'; // Fallback so it doesn't crash if mysteriously missing
    const paymentType = new AuthorizeNet.APIContracts.PaymentType();
    const creditCard = new AuthorizeNet.APIContracts.CreditCardType();
    creditCard.setCardNumber(last4);
    creditCard.setExpirationDate('XXXX');
    paymentType.setCreditCard(creditCard);
    transactionRequestType.setPayment(paymentType);

    const createRequest = new AuthorizeNet.APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    const environment = settings?.authorizeNetEnvironment || 'sandbox';
    const endpoint = environment === 'production' 
      ? AuthorizeNet.Constants.endpoint.production 
      : AuthorizeNet.Constants.endpoint.sandbox;

    const executeTransaction = async (requestToExecute: any): Promise<any> => {
      const ctrl = new AuthorizeNet.APIControllers.CreateTransactionController(requestToExecute.getJSON());
      ctrl.setEnvironment(endpoint);

      return new Promise((resolve, reject) => {
        ctrl.execute(() => {
          const apiResponse = ctrl.getResponse();
          const response = new AuthorizeNet.APIContracts.CreateTransactionResponse(apiResponse);

          if (response != null && response.getMessages().getResultCode() == AuthorizeNet.APIContracts.MessageTypeEnum.OK) {
            const tr = response.getTransactionResponse();
            if (tr && tr.getMessages() != null) {
              resolve(tr);
            } else {
              let errorMsg = 'Transaction Failed.';
              if (tr && tr.getErrors() != null) {
                errorMsg = tr.getErrors().getError()[0].getErrorText();
              }
              reject(new Error(errorMsg));
            }
          } else {
            let errorMsg = 'Transaction Failed.';
            const tr = response?.getTransactionResponse();
            if (tr && tr.getErrors() != null) {
              errorMsg = tr.getErrors().getError()[0].getErrorText();
            } else if (response && response.getMessages() != null) {
              errorMsg = response.getMessages().getMessage()[0].getText();
            }
            reject(new Error(errorMsg));
          }
        });
      });
    };

    let finalAuthNetTransId = '';

    try {
      const response = await executeTransaction(createRequest);
      finalAuthNetTransId = response.getTransId?.() || `refund_${Date.now()}`;
    } catch (refundError: any) {
      console.error('Refund Error: Authorize.Net Refund processing failed', { refundError: refundError.message || refundError });
      // If refund fails, it might be because the transaction is unsettled. Attempt VOID as fallback if it's a full refund.
      if (refundError.message.toLowerCase().includes('settled') || refundError.message.toLowerCase().includes('cannot issue a credit')) {
        if (refundAmountRaw === rawTotalAmount) {
          console.log('Refund Error Fallback: Attempting Void Transaction...');
          // Attempt VOID
          const voidTransactionRequestType = new AuthorizeNet.APIContracts.TransactionRequestType();
          voidTransactionRequestType.setTransactionType(AuthorizeNet.APIContracts.TransactionTypeEnum.VOIDTRANSACTION);
          voidTransactionRequestType.setRefTransId(order.money.payment_id);
          
          const voidRequest = new AuthorizeNet.APIContracts.CreateTransactionRequest();
          voidRequest.setMerchantAuthentication(merchantAuthenticationType);
          voidRequest.setTransactionRequest(voidTransactionRequestType);

          try {
            const voidResponse = await executeTransaction(voidRequest);
            finalAuthNetTransId = voidResponse.getTransId?.() || `void_${Date.now()}`;
          } catch (voidError: any) {
             console.error('Refund Error Fallback: Void failed', { voidError: voidError.message || voidError });
             return res.status(400).json({ success: false, message: `Refund failed (Unsettled). Void attempt also failed: ${voidError.message}` });
          }
        } else {
          return res.status(400).json({ success: false, message: `Partial refunds can only be processed after the original transaction has settled (usually overnight).` });
        }
      } else {
        return res.status(400).json({ success: false, message: `Payment Gateway Error: ${refundError.message}` });
      }
    }

    // 2. Update Order Status
    const newStatus = refundAmountRaw === rawTotalAmount ? 'refunded' : 'partially_refunded';
    
    // We can use the existing OrderModel or import it directly if it wasn't at the top.
    // However, we imported OrderRepository, but OrderModel is used directly.
    const { OrderModel } = await import('../../infrastructure/database/models/OrderModel');
    const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, {
      $set: {
        'money.payment_status': newStatus,
        'payment_status': newStatus,
        status: newStatus === 'refunded' ? 'canceled' : order.status,
      }
    }, { new: true });

    // 3. Create a Refund Transaction log so the front-end sees it
    const { TransactionModel } = await import('../../infrastructure/database/models/TransactionModel');
    await TransactionModel.create({
      order_id: orderId,
      customer_id: order.customer_id,
      transaction_id: finalAuthNetTransId,
      amount: -refundAmountRaw, // Negative for refund
      currency: 'USD',
      gateway: 'authorize_net',
      status: 'refunded',
      payment_method: 'credit_card',
      card_type: order.money.card_type || 'Unknown',
      last_4: last4,
    });
    
    return sendSuccess(res, `Order successfully ${newStatus}`, updatedOrder);
  });
}
