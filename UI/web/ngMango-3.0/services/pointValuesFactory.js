/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular', 'moment-timezone'], function(require, angular, moment) {
'use strict';

pointValuesFactory.$inject = ['$http', '$q', 'maUtil'];
function pointValuesFactory($http, $q, Util) {
    var pointValuesUrl = '/rest/v1/point-values/';

    function PointValues() {
    }
    
    PointValues.prototype.getPointValuesForXid = function getPointValuesForXid(xid, options) {
        try {
            if (!angular.isString(xid)) throw new Error('Requires xid parameter');
            if (!angular.isObject(options)) throw new Error('Requires options parameter');
            
            var url = pointValuesUrl + encodeURIComponent(xid);
            var params = optionsToParamArray(options);
            var reverseData = false;
            
            if (options.latest) {
                url += '/latest';
                reverseData = true;
            } else {
                if (params.from.valueOf() === params.to.valueOf()) {
                    return $q.when([]);
                }
            }

            url += '?' + params.join('&');
            
            var canceler = $q.defer();
            var cancelOrTimeout = Util.cancelOrTimeout(canceler.promise, options.timeout);

            return $http.get(url, {
                timeout: cancelOrTimeout,
                headers: {
                    'Accept': options.mimeType || 'application/json'
                },
                responseType: options.responseType
            }).then(function(response) {
                if (options.responseType) {
                    return response.data;
                }
                
                if (!response || !angular.isArray(response.data)) {
                    throw new Error('Incorrect response from REST end point ' + url);
                }
                var values = response.data;
                if (reverseData)
                    values.reverse();
                return values;
            }).setCancel(canceler.resolve);
        } catch (error) {
            return $q.reject(error);
        }
    };

    PointValues.prototype.getPointValuesForXids = function getPointValuesForXids(xids, options) {
        try {
            if (!angular.isArray(xids)) throw new Error('Requires xids parameter');
            if (!angular.isObject(options)) throw new Error('Requires options parameter');
            
            var emptyResponse = {};
            for (var i = 0; i < xids.length; i++) {
                xids[i] = encodeURIComponent(xids[i]);
                emptyResponse[xids[i]] = [];
            }
            
            var url = pointValuesUrl + xids.join(',');
            var params = optionsToParamArray(options);
            var reverseData = false;

            if (options.latest) {
                url += '/latest-multiple-points-multiple-arrays';
                reverseData = true;
            } else {
                url += '/multiple-points-multiple-arrays';
                if (params.from.valueOf() === params.to.valueOf()) {
                    return $q.when(emptyResponse);
                }
            }

            url += '?' + params.join('&');
            
            var canceler = $q.defer();
            var cancelOrTimeout = Util.cancelOrTimeout(canceler.promise, options.timeout);

            return $http.get(url, {
                timeout: cancelOrTimeout,
                headers: {
                    'Accept': options.mimeType || 'application/json'
                },
                responseType: options.responseType
            }).then(function(response) {
                if (options.responseType) {
                    return response.data;
                }
                
                if (!response || !angular.isObject(response.data)) {
                    throw new Error('Incorrect response from REST end point ' + url);
                }
                
                var dataByXid = response.data;
                if (reverseData) {
                    for (var xid in dataByXid) {
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

            for (var i = 0; i < xids.length; i++) {
                xids[i] = encodeURIComponent(xids[i]);
            }
            
            var url = pointValuesUrl + xids.join(',');
            var params = optionsToParamArray(options);
            var reverseData = false;

            if (options.latest) {
                url += '/latest-multiple-points-single-array';
                reverseData = true;
            } else {
                url += '/multiple-points-single-array';
                if (params.from.valueOf() === params.to.valueOf()) {
                    return $q.when([]);
                }
            }

            url += '?' + params.join('&');
            
            var canceler = $q.defer();
            var cancelOrTimeout = Util.cancelOrTimeout(canceler.promise, options.timeout);

            return $http.get(url, {
                timeout: cancelOrTimeout,
                headers: {
                    'Accept': options.mimeType || 'application/json'
                },
                responseType: options.responseType
            }).then(function(response) {
                if (options.responseType) {
                    return response.data;
                }
                
                if (!response || !angular.isArray(response.data)) {
                    throw new Error('Incorrect response from REST end point ' + url);
                }
                var values = response.data;
                if (reverseData) {
                    values.reverse();
                }
                return values;
            }).setCancel(canceler.resolve);
        } catch (error) {
            return $q.reject(error);
        }
    };
    
    function optionsToParamArray(options) {
        var params = [];
        
        if (options.latest) {
            params.push('limit=' + encodeURIComponent(options.latest));
        } else if (!angular.isUndefined(options.from) && !angular.isUndefined(options.to)) {
            var now = new Date();
            var from = params.from = Util.toMoment(options.from, now, options.dateFormat);
            var to = params.to = Util.toMoment(options.to, now, options.dateFormat);

            params.push('from=' + encodeURIComponent(from.toISOString()));
            params.push('to=' + encodeURIComponent(to.toISOString()));
            var timezone = options.timezone || moment().tz();
            if (timezone)
                params.push('timezone=' + encodeURIComponent(timezone));
            
            if (angular.isString(options.rollup) && options.rollup !== 'NONE') {
                params.push('rollup=' + encodeURIComponent(options.rollup));

                var timePeriodType = 'DAYS';
                var timePeriods = 1;

                if (angular.isString(options.rollupInterval)) {
                    var parts = options.rollupInterval.split(' ');
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

                params.push('timePeriodType=' + encodeURIComponent(timePeriodType));
                params.push('timePeriods=' + encodeURIComponent(timePeriods));
            }
        } else {
            throw new Error('Requires options.to and options.from or options.latest');
        }
        
        if (options.rendered) {
            params.push('useRendered=true');
        } else if (options.converted) {
            params.push('unitConversion=true');
        }

        if (options.useCache != null) {
            params.push('useCache=' + !!options.useCache);
        }
        
        return params;
    }

    return new PointValues();
}

return pointValuesFactory;
});
