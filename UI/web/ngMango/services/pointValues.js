/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular', 'moment-timezone'], function(require, angular, moment) {
'use strict';

pointValuesFactory.$inject = ['$http', '$q', 'maUtil', 'MA_POINT_VALUES_CONFIG', '$injector'];
function pointValuesFactory($http, $q, Util, MA_POINT_VALUES_CONFIG, $injector) {
    const pointValuesUrl = '/rest/v2/point-values';
    let maDialogHelper;
    
    if ($injector.has('maDialogHelper')) {
    	maDialogHelper = $injector.get('maDialogHelper');
    }
    
    const optionsToPostBody = (options) => {
        const body = {};
        
        if (options.dateTimeFormat ) {
            body.dateTimeFormat = options.dateTimeFormat ;
        }
        
        if (options.latest) {
            body.limit = options.latest;
        } else if (!angular.isUndefined(options.from) && !angular.isUndefined(options.to)) {
            const now = new Date();
            const from = Util.toMoment(options.from, now, options.dateFormat);
            const to = Util.toMoment(options.to, now, options.dateFormat);
            const limit = isFinite(options.limit) ? options.limit : MA_POINT_VALUES_CONFIG.limit;

            body.from = from.toISOString();
            body.to = to.toISOString();
            
            const rollup = options.rollup;
            
            if (options.bookend || options.bookend == null) {
                body.bookend = true;
            }
            
            if (limit >= 0) {
                body.limit = limit;
            }
            
            if (rollup === 'SIMPLIFY') {
                if (isFinite(options.simplifyTolerance) && options.simplifyTolerance > 0) {
                    body.simplifyTolerance = options.simplifyTolerance;
                } else {
                    body.simplifyTarget = isFinite(options.simplifyTarget) && options.simplifyTarget > 0 ? options.simplifyTarget : 1000;
                }
            }

            const timezone = options.timezone || moment().tz();
            if (timezone) {
                body.timezone = timezone;
            }

            if (typeof rollup === 'string' && rollup !== 'NONE' && rollup !== 'SIMPLIFY') {
                body.rollup = rollup;
                delete body.bookend;
                
                let timePeriodType = 'DAYS';
                let timePeriods = 1;

                if (angular.isString(options.rollupInterval)) {
                    const parts = options.rollupInterval.split(' ');
                    if (parts.length === 2 && angular.isString(parts[0]) && angular.isString(parts[1])) {
                        timePeriods = parseInt(parts[0], 10);
                        if (!isFinite(timePeriods) || timePeriods <= 0) {
                            throw new Error('options.rollupInterval must be a finite number > 0');
                        }
                        timePeriodType = parts[1].toUpperCase();
                    } else {
                        throw new Error('Error parsing options.rollupInterval');
                    }
                } else if (isFinite(options.rollupInterval) && options.rollupInterval > 0) {
                    timePeriods = options.rollupInterval;
                } else {
                    throw new Error('options.rollupInterval must be a string or finite number > 0');
                }
                
                if (!angular.isUndefined(options.rollupIntervalType)) {
                    if (!angular.isString(options.rollupIntervalType) || Util.isEmpty(options.rollupIntervalType)) {
                        throw new Error('Invalid options.rollupIntervalType');
                    }
                    timePeriodType = options.rollupIntervalType;
                }
                
                body.timePeriodType = timePeriodType;
                body.timePeriods = timePeriods;
                
                if (options.truncate || options.truncate == null) {
                    body.truncate = true;
                }
            }
        } else {
            throw new Error('Requires options.to and options.from or options.latest');
        }
        
        if (options.rendered) {
            body.useRendered = true;
        } else if (options.converted) {
            body.unitConversion = true;
        }

        if (options.useCache != null) {
            if (typeof options.useCache === 'string') {
                body.useCache = options.useCache;
            } else {
                body.useCache = options.useCache ? 'BOTH' : 'NONE';
            }
        }
        
        return body;
    };
    
    const pointValues = {
        getPointValuesForXid(xid, options) {
            try {
                if (!angular.isString(xid)) throw new Error('Requires xid parameter');
                if (!angular.isObject(options)) throw new Error('Requires options parameter');
    
                let url = pointValuesUrl;
                url += options.latest ? '/latest' : '/time-period';
                url += '/' + encodeURIComponent(xid);
                
                const rollup = options.rollup;
                if (typeof rollup === 'string' && rollup !== 'NONE' && rollup !== 'SIMPLIFY') {
                    url += '/' + encodeURIComponent(rollup);
                }
                
                const data = optionsToPostBody(options);
                delete data.rollup;
                let reverseData = false;
                
                if (options.latest) {
                    reverseData = true;
                } else if (data.from === data.to) {
                    return $q.when([]);
                }
    
                const canceler = $q.defer();
                const cancelOrTimeout = Util.cancelOrTimeout(canceler.promise, options.timeout);
    
                return $http.get(url, {
                    timeout: cancelOrTimeout,
                    headers: {
                        'Accept': options.mimeType || 'application/json'
                    },
                    responseType: options.responseType,
                    cache: !options.latest,
                    params: data
                }).then(function(response) {
                    if (options.responseType) {
                        return response.data;
                    }
                    
                    if (!response || !angular.isArray(response.data)) {
                        throw new Error('Incorrect response from REST end point ' + url);
                    }
                    let values = response.data;
                    if (reverseData)
                        values.reverse();
    
                    if (!options.latest && maDialogHelper && values.length === data.limit) {
                    	const now = (new Date()).valueOf();
                    	if (!this.lastToast || (now - this.lastToast) > 10000) {
                    		this.lastToast = now;
                    		maDialogHelper.toastOptions({
                    			textTr: ['ui.app.pointValuesLimited', [data.limit || MA_POINT_VALUES_CONFIG.limit]],
                    			hideDelay: 10000,
                    			classes: 'md-warn'
                    		});
                    	}
                    }
                    
                    return values;
                }.bind(this)).setCancel(canceler.resolve);
            } catch (error) {
                return $q.reject(error);
            }
        },
    
        getPointValuesForXids(xids, options) {
            try {
                if (!angular.isArray(xids)) throw new Error('Requires xids parameter');
                if (!angular.isObject(options)) throw new Error('Requires options parameter');
    
                let url = pointValuesUrl + '/multiple-arrays';
                url += options.latest ? '/latest' : '/time-period';
    
                const data = optionsToPostBody(options);
                data.xids = xids;
                let reverseData = false;
                
                if (options.latest) {
                    reverseData = true;
                } else if (data.from === data.to) {
                    const emptyResponse = xids.reduce((resp, xid) => (resp[xid] = [], resp), {});
                    return $q.when(emptyResponse);
                }
    
                const canceler = $q.defer();
                const cancelOrTimeout = Util.cancelOrTimeout(canceler.promise, options.timeout);
    
                return $http({
                    method: 'POST',
                    url: url,
                    timeout: cancelOrTimeout,
                    headers: {
                        'Accept': options.mimeType || 'application/json'
                    },
                    data: data,
                    responseType: options.responseType
                }).then(function(response) {
                    if (options.responseType) {
                        return response.data;
                    }
                    
                    if (!response || !angular.isObject(response.data)) {
                        throw new Error('Incorrect response from REST end point ' + url);
                    }
                    
                    const dataByXid = response.data;
                    if (reverseData) {
                        for (const xid in dataByXid) {
                            dataByXid[xid].reverse();
                        }
                    }
                    return dataByXid;
                }).setCancel(canceler.resolve);
            } catch (error) {
                return $q.reject(error);
            }
        },
        
        getPointValuesForXidsCombined(xids, options) {
            try {
                if (!angular.isArray(xids)) throw new Error('Requires xids parameter');
                if (!angular.isObject(options)) throw new Error('Requires options parameter');
    
                let url = pointValuesUrl + '/single-array';
                url += options.latest ? '/latest' : '/time-period';
    
                const data = optionsToPostBody(options);
                data.xids = xids;
                let reverseData = false;
                
                if (options.latest) {
                    reverseData = true;
                } else if (data.from === data.to) {
                    return $q.when([]);
                }
    
                const canceler = $q.defer();
                const cancelOrTimeout = Util.cancelOrTimeout(canceler.promise, options.timeout);
    
                return $http({
                    method: 'POST',
                    url: url,
                    timeout: cancelOrTimeout,
                    headers: {
                        'Accept': options.mimeType || 'application/json'
                    },
                    data: data,
                    responseType: options.responseType
                }).then(function(response) {
                    if (options.responseType) {
                        return response.data;
                    }
                    
                    if (!response || !angular.isArray(response.data)) {
                        throw new Error('Incorrect response from REST end point ' + url);
                    }
                    const values = response.data;
                    if (reverseData) {
                        values.reverse();
                    }
                    return values;
                }).setCancel(canceler.resolve);
            } catch (error) {
                return $q.reject(error);
            }
        }
    };

    return Object.freeze(pointValues);
}

return pointValuesFactory;
});
