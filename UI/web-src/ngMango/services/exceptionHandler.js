/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import StackTrace from 'stacktrace-js';
import moment from 'moment-timezone';

ExceptionHandlerProvider.$inject = ['$httpProvider'];
function ExceptionHandlerProvider($httpProvider) {
    this.$get = exceptionHandlerFactory;

    const xsrfHeaderName = $httpProvider.defaults.xsrfHeaderName;
    const xsrfCookieName = $httpProvider.defaults.xsrfCookieName;
    const messageTimeout = 10 * 60 * 1000; // 10 minutes

    exceptionHandlerFactory.$inject = ['MA_BASE_URL', 'MA_TIMEOUTS', '$log', '$cookies', '$window'];
    function exceptionHandlerFactory(MA_BASE_URL, MA_TIMEOUTS, $log, $cookies, $window) {

        const seenMessages = {};
        
        const logAndSendStackTrace = (exception, cause) => {
            $log.error(exception);
            
            // don't send these to the backend, Angular generates these messages whenever there is no error callback
            if (typeof exception === 'string' && exception.startsWith('Possibly unhandled rejection:')) {
                return;
            }
            
            const message = '' + exception;
            if (seenMessages[message]) return;
            
            seenMessages[message] = true;
            setTimeout(() => delete seenMessages[message], messageTimeout);

            Promise.resolve().then(() => {
                if (exception instanceof Error) {
                    try {
                        return StackTrace.fromError(exception, {offline: true});
                    } catch (e) {
                        $log.error('Failed to generate stack trace', e);
                    }
                }
            }).then(frames => {
                const body = JSON.stringify({
                    message: message,
                    stackTrace: frames || [],
                    cause: cause || '',
                    location: '' + $window.location,
                    userAgent: $window.navigator.userAgent,
                    language: $window.navigator.language,
                    date: moment().format('YYYY-MM-DD[T]HH:mm:ss.SSSZ'),
                    timezone: moment.tz.guess()
                });

                const xsrfValue = $cookies.get(xsrfCookieName);
                
                const xhr = new XMLHttpRequest();
                xhr.open('POST', MA_BASE_URL + '/rest/latest/server/client-error', true);
                xhr.timeout = MA_TIMEOUTS.xhr;
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                
                if (xsrfHeaderName && xsrfValue) {
                    xhr.setRequestHeader(xsrfHeaderName, xsrfValue);
                }
                
                xhr.send(body);
            }).catch(error => {
                $log.error('Failed to send stack trace', error);
            });
        };
        
        return function maExceptionHandler(exception, cause) {
            if (Array.isArray(exception)) {
                exception.forEach(e => logAndSendStackTrace(e, cause));
            } else {
                logAndSendStackTrace(exception, cause);
            }
        };
    }
}

export default ExceptionHandlerProvider;
