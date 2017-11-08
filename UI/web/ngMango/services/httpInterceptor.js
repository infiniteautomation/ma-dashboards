/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';
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
    	    let message = error.data && angular.isObject(error.data) && (error.data.message || error.data.localizedMessage);
    	    
    	    // try the 'errors' header
    	    if (!message) {
                message = error.headers('errors');
            }
    	    
    	    // if no message in the response body use the HTTP status text
    	    if (!message) {
    	        message = safeTranslate(`rest.httpStatus.${error.status}`, error.statusText);
    	    }
    	    
    	    // error.statusText is empty if its an XHR error
    	    if (!message) {
    	        message = error.xhrStatus === 'abort' && safeTranslate('ui.app.xhrAborted', 'Request aborted') ||
                    error.xhrStatus === 'timeout' && safeTranslate('ui.app.xhrTimeout', 'Request timed out') ||
                    error.xhrStatus === 'error' && safeTranslate('ui.app.xhrError', 'Connection error');
    	    }

    	    if (error.status === 422) {
    	        const validationError = safeTranslate('ui.app.validationError', 'Validation error');
    	        error.mangoStatusText = `${validationError} \u2014 ${message}`;
    	    } else {
    	        error.mangoStatusText = message;
    	    }

            return $q.reject(error);    
        }
    };
}

return mangoHttpInterceptorFactory;

}); // define
