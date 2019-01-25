/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

eventTypeProvider.$inject = [];
function eventTypeProvider() {
    
    const eventTypeOptions = {};
    this.registerEventTypeOptions = function(options, fn) {
        if (typeof options === 'string') {
            eventTypeOptions[options] = fn;
        } else if (typeof options === 'object') {
            eventTypeOptions[options.typeName] = Object.freeze(options);
        }
    };
    
    this.registerEventTypeOptions('DATA_POINT', ['maPoint', function(Point) {
        return {
            typeName: 'DATA_POINT',
            orderBy: ['type.dataPoint.deviceName', 'type.dataPoint.name'],
            icon: 'label',
            group(eventTypes) {
                const groups = new Map();
                eventTypes.forEach(et => {
                    const point = new Point(et.type.dataPoint);
                    if (groups.has(point.id)) {
                        const group = groups.get(point.id);
                        group.types.push(et);
                    } else {
                        groups.set(point.id, {
                            description: point.formatLabel(),
                            types: [et],
                            icon: this.icon
                        });
                    }
                });
                return Array.from(groups.values());
            }
        };
    }]);

    this.$get = eventTypeFactory;

    eventTypeFactory.$inject = ['maRestResource', 'maRqlBuilder', '$injector'];
    function eventTypeFactory(RestResource, RqlBuilder, $injector) {

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
        
        Object.assign(EventType, {
            eventTypeOptions(name) {
                const options = eventTypeOptions[name];
                if (typeof options === 'function' || Array.isArray(options)) {
                    return $injector.invoke(options);
                }
                return options;
            }
        });
        
        return EventType;
    }
}

export default eventTypeProvider;