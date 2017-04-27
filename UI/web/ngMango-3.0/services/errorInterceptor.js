/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
* @ngdoc service
* @name ngMangoServices.errorInterceptor
*
* @description
* Provides the error interceptor to show REST errors on the error page.
- Used in `app.js` and pushed to `$httpProvider.interceptors` array.
- Adds `errors` array and `clearErrors()` method to the rootScope of the app.
- See `/web/ui/views/dashboard/errors.html` to see how these are used in a view to display errors.
*
* # Usage
*
* <pre prettyprint-mode="javascript">
    $httpProvider.interceptors.push('errorInterceptor');
* </pre>
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.errorInterceptor
* @name clearErrors
*
* @description
* Clears the errors array by setting `$rootScope.errors = [];`
*
*/

/**
* @ngdoc object
* @propertyOf ngMangoServices.errorInterceptor
* @name $rootScope.errors
*
* @description
* An array of error objects intercepted by this service.
* Each error object will have the following properties:
<pre>
<span flex="15">{{error.time | maMoment:'format':'lll'}}</span>
<span flex="15">{{error.status}} {{error.msg}}</span>
<span flex="45">{{error.config.method}} {{error.config.url}}</span>
<span flex="25">{{error.data.message}}</span>
</pre>
* @returns {array} Array of error objects
*/

ErrorInterceptorProvider.$inject = [];
function ErrorInterceptorProvider() {
    this.ignore = function() {
        return false;
    };
    
    this.$get = ['$q', '$rootScope', function($q, $rootScope) {
        $rootScope.errors = [];
        $rootScope.clearErrors = function() {
            $rootScope.errors = [];
        };
        
        return {
            responseError: function(rejection) {
                var result = $q.reject(rejection);
                try {
                    if (this.ignore(rejection)) return result;
                    
                    var errorObj = angular.copy(rejection);
                    errorObj.msg = rejection.status < 0 ? 'Connection Refused' : rejection.statusText;
                    errorObj.time = new Date();
    
                    if ($rootScope.errors.length >= 10)
                        $rootScope.errors.pop();
                    $rootScope.errors.unshift(errorObj);

                } catch(error) {}
                
                return result;
            }.bind(this)
        };
    }.bind(this)];
}

return ErrorInterceptorProvider;

}); // define
