/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

statisticsFactory.$inject = ['$http', '$q', 'maUtil'];
function statisticsFactory($http, $q, Util) {
    const pointValuesUrl = '/rest/latest/point-values';

    class Statistics {
        static getStatisticsForXid(xid, options) {
            try {
                if (typeof xid !== 'string') throw new Error('Requires xid parameter');
                if (!options || typeof options !== 'object') throw new Error('Requires options parameter');
                
                const url = `${pointValuesUrl}/statistics/${encodeURIComponent(xid)}`;
                const params = {
                    fields: ['VALUE', 'RENDERED', 'TIMESTAMP', 'ANNOTATION']
                };
                
                if (options.from !== undefined && options.to !== undefined) {
                    const now = new Date();
                    const from = Util.toMoment(options.from, now, options.dateFormat);
                    const to = Util.toMoment(options.to, now, options.dateFormat);
                    
                    if (from.valueOf() === to.valueOf()) {
                        return $q.when({});
                    }
                    
                    params.from = from.toISOString();
                    params.to = to.toISOString();
                } else {
                    throw new Error('Requires options.to and options.from');
                }

                const canceler = $q.defer();
                const cancelOrTimeout = Util.cancelOrTimeout(canceler.promise, options.timeout);
    
                return $http({
                    url,
                    timeout: cancelOrTimeout,
                    params
                }).then(response => {
                    if (!response || !response.data) {
                        throw new Error('Incorrect response from REST end point ' + url);
                    }

                    const stats = response.data[xid];
                    stats.hasData = !!stats.count; // for legacy purposes
                    
                    // convert to legacy output format by default, move rendered property to value property
                    if (options.rendered || options.rendered === undefined) {
                        Object.keys(stats).forEach(key => {
                            const stat = stats[key];
                            if (stat != null && typeof stat === 'object' && typeof stat.rendered === 'string') {
                                stat.value = stat.rendered;
                                delete stat.rendered;
                            }
                        });
                    }
                    
                    if (options.firstLast) {
                        return [stats.first, stats.last];
                    }
                    
                    return stats;
                }).setCancel(canceler.resolve);
                
            } catch (error) {
                return $q.reject(error);
            }
        }
    }

    return Statistics;
}

export default statisticsFactory;
