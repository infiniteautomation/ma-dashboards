/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import moment from 'moment-timezone';

pointValuesFactory.$inject = ['$http', '$q', 'maUtil', 'MA_POINT_VALUES_CONFIG', '$injector'];
function pointValuesFactory($http, $q, Util, MA_POINT_VALUES_CONFIG, $injector) {
    const pointValuesUrl = '/rest/v2/point-values';
    let maDialogHelper, lastToast;
    
    if ($injector.has('maDialogHelper')) {
    	maDialogHelper = $injector.get('maDialogHelper');
    }
    
    const optionsToPostBody = (options, timePeriodObject = true) => {
        const body = {};
        
        if (options.dateTimeFormat ) {
            body.dateTimeFormat = options.dateTimeFormat ;
        }
        
        if (options.latest) {
            body.limit = options.latest;
        } else if (options.from !== undefined && options.to !== undefined) {
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

            if (rollup === 'SIMPLIFY') {
                if (isFinite(options.simplifyTolerance) && options.simplifyTolerance > 0) {
                    body.simplifyTolerance = options.simplifyTolerance;
                } else {
                    body.simplifyTarget = isFinite(options.simplifyTarget) && options.simplifyTarget > 0 ? options.simplifyTarget : 1000;
                }
            } else if (limit >= 0) {
                body.limit = limit;
            }

            const timezone = options.timezone || moment().tz();
            if (timezone) {
                body.timezone = timezone;
            }

            if (typeof rollup === 'string' && rollup !== 'NONE' && rollup !== 'SIMPLIFY') {
                delete body.bookend;
                
                let timePeriodType = 'DAYS';
                let timePeriods = 1;

                if (typeof options.rollupInterval === 'string') {
                    const parts = options.rollupInterval.split(' ');
                    if (parts.length === 2 && typeof parts[0] === 'string' && typeof parts[1] === 'string') {
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
                
                if (options.rollupIntervalType !== undefined) {
                    if (typeof options.rollupIntervalType !== 'string' || Util.isEmpty(options.rollupIntervalType)) {
                        throw new Error('Invalid options.rollupIntervalType');
                    }
                    timePeriodType = options.rollupIntervalType;
                }
                
                if (timePeriodObject) {
                    body.timePeriod = {
                        periods: timePeriods,
                        type: timePeriodType
                    };
                } else {
                    body.timePeriodType = timePeriodType;
                    body.timePeriods = timePeriods;
                }
                
                if (options.truncate || options.truncate == null) {
                    body.truncate = true;
                }
            }
        } else {
            throw new Error('Requires options.to and options.from or options.latest');
        }
        
        if (options.rendered) {
            body.fields = ['TIMESTAMP', 'VALUE', 'RENDERED'];
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
        
        if (Array.isArray(options.fields)) {
            body.fields = options.fields;
        }
        
        return body;
    };
    
    const pointValues = {
        getPointValuesForXid(xid, options) {
            try {
                if (typeof xid !== 'string') throw new Error('Requires xid parameter');
                if (!options || typeof options !== 'object') throw new Error('Requires options parameter');
    
                let url = pointValuesUrl;
                url += options.latest ? '/latest' : '/time-period';
                url += '/' + encodeURIComponent(xid);
                
                const rollup = options.rollup;
                if (typeof rollup === 'string' && rollup !== 'NONE' && rollup !== 'SIMPLIFY') {
                    url += '/' + encodeURIComponent(rollup);
                }
                
                const data = optionsToPostBody(options, false);
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
                    
                    if (!response || !Array.isArray(response.data)) {
                        throw new Error('Incorrect response from REST end point ' + url);
                    }
                    let values = response.data;
                    if (reverseData)
                        values.reverse();
    
                    if (!options.latest && maDialogHelper && values.length >= data.limit) {
                    	const now = (new Date()).valueOf();
                    	if (!lastToast || (now - lastToast) > 10000) {
                    		lastToast = now;
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
                if (!Array.isArray(xids)) throw new Error('Requires xids parameter');
                if (!options || typeof options !== 'object') throw new Error('Requires options parameter');
    
                let url = pointValuesUrl + '/multiple-arrays';
                url += options.latest ? '/latest' : '/time-period';

                const rollup = options.rollup;
                if (typeof rollup === 'string' && rollup !== 'NONE' && rollup !== 'SIMPLIFY') {
                    url += '/' + encodeURIComponent(rollup);
                }
                
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
                    
                    if (!response || !response.data || typeof response.data !== 'object') {
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
                if (!Array.isArray(xids)) throw new Error('Requires xids parameter');
                if (!options || typeof options !== 'object') throw new Error('Requires options parameter');
    
                let url = pointValuesUrl + '/single-array';
                url += options.latest ? '/latest' : '/time-period';

                const rollup = options.rollup;
                if (typeof rollup === 'string' && rollup !== 'NONE' && rollup !== 'SIMPLIFY') {
                    url += '/' + encodeURIComponent(rollup);
                }
                
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
                    
                    if (!response || !Array.isArray(response.data)) {
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

export default pointValuesFactory;

