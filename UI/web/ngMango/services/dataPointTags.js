/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';

dataPointTagsFactory.$inject = ['$http', 'maRqlBuilder', 'maTemporaryRestResource'];
function dataPointTagsFactory($http, RqlBuilder, TemporaryRestResource) {

    class BulkTagsTemporaryResource extends TemporaryRestResource {
        static get baseUrl() {
            return '/rest/v2/data-point-tags/bulk';
        }
        static get resourceType() {
            return 'BULK_DATA_POINT_TAGS';
        }
    }

    class DataPointTags {
        static keys() {
            return $http.get('/rest/v2/data-point-tags/keys').then(response => response.data);
        }
        
        static values(key, restrictions) {
            const rqlBuilder = new RqlBuilder();
            Object.keys(restrictions).forEach(key => {
                let value = restrictions[key];
                if (value !== undefined) {
                    if (angular.isArray(value)) {
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
            const encodedKey = encodeURIComponent(key);
            return $http({
                url: `/rest/v2/data-point-tags/values/${encodedKey}`,
                params: {
                    rqlQuery: rqlBuilder.toString()
                }
            }).then(response => response.data);
        }
    }
    
    DataPointTags.bulk = BulkTagsTemporaryResource;

    return DataPointTags;
}

export default dataPointTagsFactory;


