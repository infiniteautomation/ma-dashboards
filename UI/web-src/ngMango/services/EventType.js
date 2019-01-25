/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

eventTypeProvider.$inject = [];
function eventTypeProvider() {
    
    

    this.$get = eventTypeFactory;

    eventTypeFactory.$inject = ['maRestResource', 'maRqlBuilder'];
    function eventTypeFactory(RestResource, RqlBuilder) {

        const eventTypeBaseUrl = '/rest/v2/event-types';
        
        class EventType extends RestResource {
            static get baseUrl() {
                return eventTypeBaseUrl;
            }
            
            static get idProperty() {
                return null;
            }

            static typeNames(opts = {}) {
                return this.http({
                    method: 'GET',
                    url: `${eventTypeBaseUrl}/type-names`
                }, opts).then(response => response.data);
            }
            
            get uniqueId() {
                return this.constructor.uniqueId(this.type);
            }
            
            static uniqueId(type) {
                return `${type.eventType}_${type.subType}_${type.referenceId1}_${type.referenceId2}`;
            }
            
            static list(name, opts = {}) {
                return this.query(name, null, opts);
            }
            
            static buildQuery(name) {
                const builder = new RqlBuilder();
                builder.queryFunction = (queryObj, opts) => {
                    return this.query(name, queryObj, opts);
                };
                return builder;
            }

            static query(name, queryObject, opts = {}) {
                const params = {};
                
                if (queryObject) {
                    const rqlQuery = queryObject.toString();
                    if (rqlQuery) {
                        params.rqlQuery = rqlQuery;
                    }
                }
                
                const nameEncoded = this.encodeUriSegment(name);
                
                return this.http({
                    url: `${this.baseUrl}/${nameEncoded}`,
                    method: 'GET',
                    params: params
                }, opts).then(response => {
                    if (opts.responseType != null) {
                        return response.data;
                    }
                    
                    const items = response.data.items.map(item => {
                        return new this(item);
                    });
                    items.$total = response.data.total;
                    return items;
                });
            }
        }
        
        return EventType;
    }
}

export default eventTypeProvider;