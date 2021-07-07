/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

dataPointTagsFactory.$inject = ['$http', 'maRqlBuilder', 'maTemporaryRestResource'];
function dataPointTagsFactory($http, RqlBuilder, TemporaryRestResource) {

    class BulkTagsTemporaryResource extends TemporaryRestResource {
        static get baseUrl() {
            return '/rest/latest/data-point-tags/bulk';
        }
        static get resourceType() {
            return 'BULK_DATA_POINT_TAGS';
        }
    }

    class DataPointTags {
        static keys() {
            return $http.get('/rest/latest/data-point-tags/keys').then(response => response.data);
        }
        
        static queryValues(key, query) {
            const encodedKey = encodeURIComponent(key);
            return $http({
                url: `/rest/latest/data-point-tags/values/${encodedKey}`,
                params: {
                    rqlQuery: query.toString()
                }
            }).then(response => response.data);
        }
        
        static values(key, restrictions = {}) {
            const rqlBuilder = new RqlBuilder();
            Object.keys(restrictions).forEach(key => {
                let value = restrictions[key];
                if (value !== undefined) {
                    if (Array.isArray(value)) {
                        let orNull = false;
                        value = value.filter(val => {
                            if (val === null) {
                                orNull = true;
                                return false;
                            }
                            return true;
                        });
                        if (orNull) {
                            rqlBuilder.or().eq(key, null);
                        }
                        if (value.length) {
                            rqlBuilder.in(key, ...value);
                        }
                        if (orNull) {
                            rqlBuilder.up();
                        }
                    } else {
                        rqlBuilder.eq(key, value);
                    }
                }
            });
            
            return this.queryValues(key, rqlBuilder);
        }
        
        static buildQuery(key) {
            const builder = new RqlBuilder();
            builder.queryFunction = (queryObj) => {
                return this.queryValues(key, queryObj);
            };
            return builder;
        }
    }
    
    DataPointTags.bulk = BulkTagsTemporaryResource;

    return DataPointTags;
}

export default dataPointTagsFactory;


