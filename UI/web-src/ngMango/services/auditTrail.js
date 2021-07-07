/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

auditTrailFactory.$inject = ['$http', 'maRqlBuilder'];
function auditTrailFactory($http, RqlBuilder) {
    
    const auditTrailUrl = '/rest/latest/audit';
    
    const auditTrail = {
        query(queryObject, opts) {
            const params = {};
            
            if (queryObject) {
                const rqlQuery = queryObject.toString();
                if (rqlQuery) {
                    params.rqlQuery = rqlQuery;
                }
            }
            
            return $http({
                url: auditTrailUrl,
                method: 'GET',
                params: params
            }, opts).then(response => {
                response.data.items.$total = response.data.total;
                return response.data.items;
            });
        },
        
        buildQuery() {
            const builder = new RqlBuilder();
            builder.queryFunction = (queryObj, opts) => {
                return this.query(queryObj, opts);
            };
            return builder;
        }
    };
    
    return Object.freeze(auditTrail);
}

export default auditTrailFactory;


