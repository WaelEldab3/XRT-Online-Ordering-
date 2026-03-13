import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import { getIframeToken } from '../../api/orders';

const AuthorizeNetIframe = ({
  amount,
  customer,
  delivery,
  onSuccess,
  onError,
  primaryColor = '#3D6642'
}) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const formRef = useRef(null);
  
  // We determine the secure hosted form URL dynamically based on the backend environment
  const [actionUrl, setActionUrl] = useState("https://accept.authorize.net/payment/payment");

  useEffect(() => {
    let isMounted = true;
    
    // Fetch the token from our backend
    const fetchToken = async () => {
      try {
        const response = await getIframeToken({ amount, customer, delivery });
        if (isMounted) {
          if (response?.data?.token) {
            setToken(response.data.token);
            if (response.data.environment === 'sandbox') {
              setActionUrl("https://test.authorize.net/payment/payment");
            } else {
              setActionUrl("https://accept.authorize.net/payment/payment");
            }
          } else {
            setIframeError("Failed to initialize secure payment session.");
            onError("Payment initialization failed.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setIframeError(err?.response?.data?.message || "Could not connect to payment gateway.");
          onError("Could not connect to payment gateway.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchToken();
    
    return () => {
      isMounted = false;
    };
  }, [amount, customer, delivery, onError]);

  // Once token is established, submit the hidden form into the iframe only ONCE.
  // If the component re-renders (e.g., due to parent state changes), we do not want to
  // re-submit because it will reload the iframe and erase user input.
  const hasSubmittedRef = useRef(false);
  useEffect(() => {
    if (token && formRef.current && !hasSubmittedRef.current && !formSubmitted) {
        hasSubmittedRef.current = true;
        formRef.current.submit();
        setFormSubmitted(true);
    }
  }, [token, formSubmitted]);

  // Listen for messages from Authorize.net communicator HTML
  useEffect(() => {
      const handleMessage = (event) => {
          if (!event.data) return;
          
          let eventData = event.data;
          
          // Some messages strings, others already parsed
          if (typeof eventData === "string") {
              // Ignore extraneous messages (vite, react devtools, etc)
              if (eventData.includes("vite") || eventData.includes("react-devtools")) return;
              

              // Standard communicator.html payload is query string style: action=...&transId=...
              try {
                  const urlParams = new URLSearchParams(eventData);
                  const action = urlParams.get('action');
                  const transId = urlParams.get('transId');
                  
                  if (action === 'transactResponse') {
                      const responseStr = urlParams.get('response');
                      let response = {};
                      try {
                          response = responseStr ? JSON.parse(responseStr) : {};
                      } catch (e) {
                          // ignore parsing errors for transaction response JSON
                      }
                      

                      if (transId && transId !== '0') {
                          onSuccess({ 
                              token: transId, 
                              method: 'authorize_net_iframe',
                              cardType: response.accountType,
                              last4: response.accountNumber ? response.accountNumber.slice(-4) : undefined
                          });
                      } else {
                          // The transaction failed or was cancelled
                          let msg = "Transaction did not complete.";
                          if (response && response.messages && response.messages.message && response.messages.message.length > 0) {
                              msg = response.messages.message[0].text;
                          }
                          setIframeError(msg);
                          onError(msg);
                      }
                  } else if (action === 'cancel') {
                      const msg = "Payment was cancelled.";
                      setIframeError(msg);
                      onError(msg);
                  } else if (action === 'successfulSave') {
                      // Handle if needed
                  }
              } catch (e) {
                  // ignore parsing errors for extraneous messages
              }
          } else if (typeof eventData === "object") {
              // Handle potential object payload if communicator is bypassed or modern
              if (eventData.action === 'transactResponse') {
                 if (eventData.transId && eventData.transId !== '0') {
                    onSuccess({ 
                        token: eventData.transId, 
                        method: 'authorize_net_iframe',
                        cardType: eventData.accountType,
                        last4: eventData.accountNumber ? eventData.accountNumber.slice(-4) : undefined
                    });
                 }
              }
          }
      };

      window.addEventListener('message', handleMessage, false);
      return () => {
          window.removeEventListener('message', handleMessage, false);
      };
  }, [onSuccess, onError]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 font-medium">Securing payment connection...</p>
      </div>
    );
  }

  if (iframeError) {
    return (
      <div className="flex flex-col items-center py-8 text-center px-4">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
          <ShieldCheck size={24} />
        </div>
        <p className="text-sm font-bold text-red-600 uppercase tracking-widest">Connection Failed</p>
        <p className="text-xs text-red-500 mt-1">{iframeError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
        >
            Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-700">
      <div className="w-full flex items-center justify-center gap-2 mb-4">
          <Lock size={16} className="text-green-600" />
          <span className="text-[10px] uppercase tracking-widest font-black text-green-700 font-['Poppins']">Secure Hosted Form</span>
      </div>
      
      {/* Hidden form to POST the token to the iframe */}
      {token && !formSubmitted && (
        <form 
          method="post" 
          action={actionUrl} 
          target="add_payment" 
          ref={formRef}
          className="hidden"
        >
          <input type="hidden" name="token" value={token} />
        </form>
      )}

      {/* The iframe where the Authorize.net secure form will load */}
      <div className="w-full max-w-md mx-auto h-[600px] border border-gray-100 rounded-[2rem] overflow-hidden bg-gray-50 shadow-inner">
          <iframe 
            id="add_payment" 
            name="add_payment" 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="yes"
            title="Secure Payment Form"
            className="w-full h-full"
          >
              <p className="text-center mt-10 text-gray-500 text-sm">Your browser does not support iframes.</p>
          </iframe>
      </div>
      
      <p className="text-center mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-sm">
          Please complete your payment securely within the frame above.
      </p>
    </div>
  );
};

export default AuthorizeNetIframe;
