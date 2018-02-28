/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'stacktrace'], function(angular, StackTrace) {
'use strict';

ExceptionHandlerProvider.$inject = ['$httpProvider'];
function ExceptionHandlerProvider($httpProvider) {
    this.$get = exceptionHandlerFactory;

    const xsrfHeaderName = $httpProvider.defaults.xsrfHeaderName;
    const xsrfCookieName = $httpProvider.defaults.xsrfCookieName;

    exceptionHandlerFactory.$inject = ['MA_BASE_URL', 'MA_TIMEOUT', '$log', '$cookies', '$window'];
    function exceptionHandlerFactory(MA_BASE_URL, MA_TIMEOUT, $log, $cookies, $window) {

        return function maExceptionHandler(exception, cause) {
            $log.error(exception, cause);
    
            StackTrace.fromError(exception, {offline: true}).then(frames => {
                const body = JSON.stringify({
                    message: '' + exception,
                    stackTrace: frames,
                    cause: cause || '',
                    userAgent: $window.navigator.userAgent,
                    language: $window.navigator.language
                });

                const xsrfValue = $cookies.get(xsrfCookieName);
                
                const xhr = new XMLHttpRequest();
                xhr.open('POST', MA_BASE_URL + '/rest/v2/client-errors', true);
                xhr.timeout = MA_TIMEOUT;
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                
                if (xsrfHeaderName && xsrfValue) {
                    xhr.setRequestHeader(xsrfHeaderName, xsrfValue);
                }
                
                xhr.send(body);
            }).catch(error => {
                $log.error('Failed to generate/send stack trace', error);
            });
    
        };
    }
}

return ExceptionHandlerProvider;

});
