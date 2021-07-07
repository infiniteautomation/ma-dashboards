/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

mangoHttpInterceptorFactory.$inject = ['MA_BASE_URL', 'MA_TIMEOUTS', '$q', '$injector'];
function mangoHttpInterceptorFactory(mangoBaseUrl, MA_TIMEOUTS, $q, $injector) {

    /**
     * @ngdoc service
     * @name ngMangoServices.maHttpInterceptor
     *
     * @description Automatically prepends the base url onto the HTTP request's url, also augments HTTP error
     * responses with a human readable error message extracted from the response body, headers or generic status.
     */
    class MangoHttpInterceptor {
        request(config) {
            if (this.isApiCall(config)) {
                config.url = mangoBaseUrl + config.url;
            }
            if (config.timeout == null) {
                config.timeout = MA_TIMEOUTS.xhr;
            }
            return config;
        }

        responseError(error) {
            // TODO error.xhrStatus abort might be a cancel, but could also be a timeout
            if (error.config && this.isApiCall(error.config) &&
                !error.config.ignoreError && // ignoreError is set true by maWatchdog service
                (error.status < 0 && ['timeout', 'error'].includes(error.xhrStatus) || error.status === 401)) {

                $injector.get('maWatchdog').checkStatus();
            }

            if (error.data instanceof Blob && error.data.type === 'application/json') {
                return $injector.get('maUtil').blobToJson(error.data).then(parsedData => {
                    error.data = parsedData;
                    return this.augmentError(error);
                }).catch(e => {
                    return this.augmentError(error);
                });
            }

            return this.augmentError(error);
        }

        augmentError(error) {
            let message = error.data && typeof error.data === 'object' && (error.data.message || error.data.localizedMessage);
            // TODO error.data.cause is now the only place containing the exception message, display this if it is available

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
                message = error.xhrStatus === 'abort' && this.safeTranslate('ui.app.xhrAborted', 'Request aborted') ||
                    error.xhrStatus === 'timeout' && this.safeTranslate('ui.app.xhrTimeout', 'Request timed out') ||
                    error.xhrStatus === 'error' && this.safeTranslate('ui.app.xhrError', 'Connection error');
            }

            // fallback to generic description of HTTP error code
            if (!message) {
                message = this.safeTranslate(`rest.httpStatus.${error.status}`, `HTTP error ${error.status}`);
            }

            error.mangoStatusText = message;
            error.mangoStatusTextShort = message;

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
                    error.mangoStatusTextFirstValidationMsg = firstMsg.message;
                    error.mangoStatusText = this.safeTranslate(trKeyArgs, message);
                }
            }

            return $q.reject(error);
        }

        safeTranslate(key, fallback) {
            try {
                return $injector.get('maTranslate').trSync(key);
            } catch (e) {
                return fallback;
            }
        }

        isApiCall(config) {
            return String(config.url).startsWith('/');
        }
    }

    const interceptor = new MangoHttpInterceptor();

    return {
        request: interceptor.request.bind(interceptor),
        responseError: interceptor.responseError.bind(interceptor)
    };
}

export default mangoHttpInterceptorFactory;
