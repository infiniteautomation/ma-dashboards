/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
* @ngdoc service
* @name ngMangoServices.mangoHttpInterceptor
*
* @description
* Factory provides intercepting of HTTP messages.
*/

function isApiCall(config) {
	if (config.url.indexOf('/') === 0) {
		return true;
	}
}

function mangoHttpInterceptorFactory(mangoBaseUrl, mangoTimeout, $q) {
    return {
    	request: function(config) {
    		if (isApiCall(config)) {
    			config.url = mangoBaseUrl + config.url;
    		}
    		if (!config.timeout) {
    			config.timeout = mangoTimeout;
    		}
    		return config;
    	}
    };
}

mangoHttpInterceptorFactory.$inject = ['MA_BASE_URL', 'MA_TIMEOUT', '$q'];

return mangoHttpInterceptorFactory;

}); // define
