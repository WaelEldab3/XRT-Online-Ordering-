/**
 * Authorize.Net Hosted Payment Page - IFrame Communicator
 * This file must be loaded by communicator.html on your domain.
 * Enables the Authorize.Net hosted form (in an iframe) to communicate
 * cross-domain with your website (the parent) via postMessage.
 * Externalized to avoid CSP "inline script" violations on the payment page.
 */
(function () {
  'use strict';

  function callParentFunction(str) {
    if (str && str.length > 0) {
      if (window.parent && window.parent.parent) {
        if (window.parent.parent.postMessage) {
          try {
            window.parent.parent.postMessage(str, '*');
          } catch (err) {
            console.error('communicator error:', err);
          }
        }
      }
    }
  }

  function receiveMessage(event) {
    if (event && event.data) {
      callParentFunction(event.data);
    }
  }

  if (window.addEventListener) {
    window.addEventListener('message', receiveMessage, false);
  } else if (window.attachEvent) {
    window.attachEvent('onmessage', receiveMessage);
  }

  if (window.location.hash && window.location.hash.length > 1) {
    callParentFunction(window.location.hash.substring(1));
  }
})();
