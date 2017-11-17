/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular', 'moment-timezone', 'simplify-js'], function(require, angular, moment, simplify) {
'use strict';

pointValuesFactory.$inject = ['$http', '$q', 'maUtil', 'MA_POINT_VALUES_CONFIG', '$injector'];
function pointValuesFactory($http, $q, Util, MA_POINT_VALUES_CONFIG, $injector) {
    const pointValuesUrl = '/rest/v1/point-values/';
    let maDialogHelper;
    
    if ($injector.has('maDialogHelper')) {
    	maDialogHelper = $injector.get('maDialogHelper');
    }
    
    function PointValues() {
    }
    
    PointValues.prototype.getPointValuesForXid = function getPointValuesForXid(xid, options) {
        try {
            if (!angular.isString(xid)) throw new Error('Requires xid parameter');
            if (!angular.isObject(options)) throw new Error('Requires options parameter');
            
            let url = pointValuesUrl + encodeURIComponent(xid);
            const data = optionsToPostBody(options);
            let reverseData = false;
            
            if (options.latest) {
                url += '/latest';
                reverseData = true;
            } else {
                if (data.from === data.to) {
                    return $q.when([]);
                }
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
                
                let simplifyLimited = false;
                if (options.rollup === 'SIMPLIFY' && !options.rendered) {
                    values = simplifyValues(values, options.simplifyTolerance || 0, options.simplifyHighQuality);
                    if (values.length > MA_POINT_VALUES_CONFIG.limit) {
                        values = values.slice(0, MA_POINT_VALUES_CONFIG.limit);
                        simplifyLimited = true;
                    }
                }
                
                if ((!options.latest && maDialogHelper && values.length === data.limit) || simplifyLimited) {
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
    };

    PointValues.prototype.getPointValuesForXids = function getPointValuesForXids(xids, options) {
        try {
            if (!angular.isArray(xids)) throw new Error('Requires xids parameter');
            if (!angular.isObject(options)) throw new Error('Requires options parameter');
            
            const emptyResponse = {};
            for (let i = 0; i < xids.length; i++) {
                emptyResponse[xids[i]] = [];
            }
            
            let url = pointValuesUrl;
            const data = optionsToPostBody(options);
            data.xids = xids;
            let reverseData = false;

            if (options.latest) {
                url += 'latest-multiple-points-multiple-arrays';
                reverseData = true;
            } else {
                url += 'multiple-points-multiple-arrays';
                if (data.from === data.to) {
                    return $q.when(emptyResponse);
                }
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
    };
    
    PointValues.prototype.getPointValuesForXidsCombined = function getPointValuesForXidsCombined(xids, options) {
        try {
            if (!angular.isArray(xids)) throw new Error('Requires xids parameter');
            if (!angular.isObject(options)) throw new Error('Requires options parameter');

            let url = pointValuesUrl;
            const data = optionsToPostBody(options);
            data.xids = xids;
            let reverseData = false;

            if (options.latest) {
                url += 'latest-multiple-points-single-array';
                reverseData = true;
            } else {
                url += 'multiple-points-single-array';
                if (data.from === data.to) {
                    return $q.when([]);
                }
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
    };

    function optionsToPostBody(options) {
        const body = {};
        
        if (options.latest) {
            body.limit = options.latest;
        } else if (!angular.isUndefined(options.from) && !angular.isUndefined(options.to)) {
            const now = new Date();
            const from = Util.toMoment(options.from, now, options.dateFormat);
            const to = Util.toMoment(options.to, now, options.dateFormat);
            const limit = isFinite(options.limit) ? options.limit : MA_POINT_VALUES_CONFIG.limit;

            body.from = from.toISOString();
            body.to = to.toISOString();

            let rollup = options.rollup;
            if (rollup === 'SIMPLIFY') {
                rollup = 'NONE';
            } else if (limit >= 0) {
                body.limit = limit;
            }
            
            const timezone = options.timezone || moment().tz();
            if (timezone) {
                body.timezone = timezone;
            }

            if (angular.isString(rollup) && rollup !== 'NONE') {
                body.rollup = rollup;
                
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
            body.useCache = !!options.useCache;
        }
        
        return body;
    }
    
    function simplifyValues(values, tolerance = -1, highQuality = true) {
        if (tolerance === -1) {
            return simplifyValuesAuto(values, highQuality);
        }

        //console.time('Simplify time');
        const simplified = simplify(values, tolerance, highQuality);
        const percent = (simplified.length / values.length * 100).toFixed(2);
        console.log(`Simplify - before: ${values.length}, after: ${simplified.length}, percent: ${percent}% (tolerance ${tolerance.toPrecision(3)})`);
        //console.timeEnd('Simplify time');
        
        return simplified;
    }
    
    function simplifyValuesAuto(values, highQuality = true, target = 1000, plusMinus = 100) {
        const upperTarget = target + plusMinus;
        const lowerTarget = target - plusMinus;
        
        if (values.length < upperTarget) return values;
        
        const min = values.reduce((prevMin, value) => {
            return value.value < prevMin ? value.value : prevMin;
        }, Number.POSITIVE_INFINITY);
        
        const max = values.reduce((prevMax, value) => {
            return value.value > prevMax ? value.value : prevMax;
        }, Number.NEGATIVE_INFINITY);

        const difference = max - min;
        
        let iterations = 1;
        let tolerance = difference / 20;
        let topBound = difference;
        let bottomBound = 0;
        
        //console.time('Simplify auto time');
        let simplified = simplify(values, tolerance, highQuality);
        
        while(simplified.length < lowerTarget || simplified.length > upperTarget) {
            //console.log(`length ${simplified.length}, tolerance: ${tolerance}, topBound ${topBound}, bottomBound: ${bottomBound}`);
            
            if (simplified.length > target) {
                bottomBound = tolerance;
            } else {
                topBound = tolerance;
            }
            
            tolerance = bottomBound + (topBound - bottomBound) / 2;
            simplified = simplify(values, tolerance, highQuality);
            
            iterations++;
            if (iterations > 100) {
                break;
            }
        }

        const percent = (simplified.length / values.length * 100).toFixed(2);
        console.log(`Simplify - before: ${values.length}, after: ${simplified.length}, percent: ${percent}%` +
            ` (tolerance ${tolerance.toPrecision(3)}, iterations ${iterations})`);
        //console.timeEnd('Simplify auto time');
        
        return simplified;
    }

    return new PointValues();
}

return pointValuesFactory;
});
