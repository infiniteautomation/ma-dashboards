/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
* @ngdoc service
* @name maServices.errorInterceptor
*
* @description
* Provides the error interceptor to show REST errors on the error page.
- Used in `app.js` and pushed to `$httpProvider.interceptors` array.
- Adds errors `array` and `clearErrors()` method to the rootScope of the app.
- See `/web/mdAdmin/views/dashboard/errors.html` to see how these are used in a view to display errors.
*
* ### Example
*
* <pre>
    $httpProvider.interceptors.push('errorInterceptor');
* </pre>
*/

/**
* @ngdoc method
* @methodOf maServices.errorInterceptor
* @name clearErrors
*
* @description
* Clears the errors array by setting `$rootScope.errors = [];`
*
*/

/**
* @ngdoc object
* @propertyOf maServices.errorInterceptor
* @name errors
*
* @description
* An array of error objects intercepted by this service.
* Each error object will have the following properties:
<pre>
<span flex="15">{{error.time | moment:'format':'lll'}}</span>
<span flex="15">{{error.status}} {{error.msg}}</span>
<span flex="45">{{error.config.method}} {{error.config.url}}</span>
<span flex="25">{{error.data.message}}</span>
</pre>
* @returns {array} Array of error objects
*/

function errorInterceptorFactory($q, $rootScope) {
	
	$rootScope.errors = [];
	$rootScope.clearErrors = function() {
		$rootScope.errors = [];
	};
	
	return {
		responseError: function(rejection) {
    		var errorObj = angular.merge({}, rejection);
    		errorObj.msg = rejection.status < 0 ? 'Connection Refused' : rejection.statusText;
    		errorObj.time = new Date();
    		
    		if ($rootScope.errors.length >= 10)
    			$rootScope.errors.pop();
    		$rootScope.errors.unshift(errorObj);
    		
    		return $q.reject(rejection);
    	}
    };
}

errorInterceptorFactory.$inject = ['$q', '$rootScope'];

return errorInterceptorFactory;

}); // define
