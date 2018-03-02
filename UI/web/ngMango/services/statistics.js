/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import requirejs from 'requirejs/require';
import angular from 'angular';


statisticsFactory.$inject = ['$http', '$q', 'maUtil'];
function statisticsFactory($http, $q, Util) {
    var pointValuesUrl = '/rest/v1/point-values/';

    function Statistics() {
    }
    
    Statistics.prototype.getStatisticsForXid = function getStatisticsForXid(xid, options) {
        try {
            if (!angular.isString(xid)) throw new Error('Requires xid parameter');
            if (!angular.isObject(options)) throw new Error('Requires options parameter');
            
            var url = pointValuesUrl + encodeURIComponent(xid) + (options.firstLast ? '/first-last' : '/statistics');
            var params = [];
            
            if (!angular.isUndefined(options.from) && !angular.isUndefined(options.to)) {
                var now = new Date();
                var from = Util.toMoment(options.from, now, options.dateFormat);
                var to = Util.toMoment(options.to, now, options.dateFormat);
                
                if (from.valueOf() === to.valueOf()) {
                    return $q.when({});
                }
                
                params.push('from=' + encodeURIComponent(from.toISOString()));
                params.push('to=' + encodeURIComponent(to.toISOString()));
            } else {
                throw new Error('Requires options.to and options.from');
            }
            
            if (options.rendered || angular.isUndefined(options.rendered)) {
                params.push('useRendered=true');
            }
            
            url += '?' + params.join('&');
            
            var canceler = $q.defer();
            var cancelOrTimeout = Util.cancelOrTimeout(canceler.promise, options.timeout);

            return $http.get(url, {
                timeout: cancelOrTimeout,
                headers: {
                    'Accept': 'application/json'
                },
                cache: true
            }).then(function(response) {
                if (!response || !response.data) {
                    throw new Error('Incorrect response from REST end point ' + url);
                }
                return response.data;
            }).setCancel(canceler.resolve);
        } catch (error) {
            return $q.reject(error);
        }
    };

    return new Statistics();
}

export default statisticsFactory;

