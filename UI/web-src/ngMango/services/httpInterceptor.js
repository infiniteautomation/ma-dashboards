/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
* @ngdoc service
* @name ngMangoServices.maHttpInterceptor
*
* @description Automatically prepends the base url onto the http request's url. Formats a human readable error message for error responses.
*/

mangoHttpInterceptorFactory.$inject = ['MA_BASE_URL', 'MA_TIMEOUT', '$q', '$injector'];
function mangoHttpInterceptorFactory(mangoBaseUrl, mangoTimeout, $q, $injector) {

    const isApiCall = function isApiCall(config) {
        if (('' + config.url).indexOf('/') === 0) {
            return true;
        }
    };
    
    let maTranslate = null;
    const safeTranslate = function safeTranslate(key, fallback) {
        if (!maTranslate) {
            if ($injector.has('maTranslate')) {
                maTranslate = $injector.get('maTranslate');
            } else {
                return fallback;
            }
        }
        
        try {
            return maTranslate.trSync(key);
        } catch (e) {
            return fallback;
        }
    };
    
    return {
    	request: function(config) {
    		if (isApiCall(config)) {
    			config.url = mangoBaseUrl + config.url;
    		}
    		if (!config.timeout) {
    			config.timeout = mangoTimeout;
    		}
    		return config;
    	},
    	responseError: function(error) {
    	    let message = error.data && typeof error.data === 'object' && (error.data.message || error.data.localizedMessage);
    	    
    	    // try the 'errors' header
    	    if (!message) {
                message = error.headers('errors');
            }
            
    	    // try the status text
            if (!message) {
                message = error.statusText;
            }
            
    	    // error.statusText is empty if its an XHR error
    	    if (!message && error.xhrStatus !== 'complete') {
    	        message = error.xhrStatus === 'abort' && safeTranslate('ui.app.xhrAborted', 'Request aborted') ||
                    error.xhrStatus === 'timeout' && safeTranslate('ui.app.xhrTimeout', 'Request timed out') ||
                    error.xhrStatus === 'error' && safeTranslate('ui.app.xhrError', 'Connection error');
    	    }

            // fallback to generic description of HTTP error code
            if (!message) {
                message = safeTranslate(`rest.httpStatus.${error.status}`, `HTTP error ${error.status}`);
            }

    	    if (error.status === 422) {
    	        let messages = [];
    	        if (error.data.result && Array.isArray(error.data.result.messages)) {
    	            messages = error.data.result.messages;
    	        } else if (Array.isArray(error.data.validationMessages)) {
    	            messages = error.data.validationMessages;
    	        }
    	        
    	        if (messages.length) {
    	            const firstMsg = messages[0];
    	            let trKeyArgs;
    	            if (firstMsg.property) {
    	                trKeyArgs = ['ui.app.errorFirstValidationMsgWithProp', message, firstMsg.property, firstMsg.message];
    	            } else {
    	                trKeyArgs = ['ui.app.errorFirstValidationMsg', message, firstMsg.message];
    	            }
                    error.mangoStatusText = safeTranslate(trKeyArgs, message);
    	        }
    	    } else {
    	        error.mangoStatusText = message;
    	    }

            return $q.reject(error);    
        }
    };
}

export default mangoHttpInterceptorFactory;


