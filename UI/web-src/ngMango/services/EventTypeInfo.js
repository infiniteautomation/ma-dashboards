/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

eventTypeProvider.$inject = [];
function eventTypeProvider() {

    const eventTypeOptions = [];
    this.registerEventTypeOptions = function(options) {
        eventTypeOptions.push(options);
    };
    
    class EventTypeOptions {
        constructor(options) {
            Object.assign(this, options);
        }

        groupDescription(eventType) {
            return '' + eventType;
        }
        
        getSource(eventType) {
            return eventType.type.source;
        }
        
        group(eventTypes) {
            if (typeof this.groupBy !== 'function') {
                return;
            }
            
            return Array.from(eventTypes.reduce((groups, et) => {
                const source = this.getSource(et);
                const id = this.groupBy(source);
                
                if (groups.has(id)) {
                    const group = groups.get(id);
                    group.types.push(et);
                } else {
                    groups.set(id, {
                        source,
                        description: this.groupDescription(source),
                        types: [et],
                        icon: this.icon
                    });
                }
                
                return groups;
            }, new Map()).values());
        }
        
        stateParams(eventType) {
            return null;
        }
    }
    
    Object.assign(EventTypeOptions.prototype, {
        orderBy: 'description'
    });

    this.registerEventTypeOptions(['maPoint', function(Point) {
        return {
            typeName: 'DATA_POINT',
            orderBy: ['type.source.deviceName', 'type.source.name', 'description'],
            icon: 'label',
            getSource(eventType) {
                return Object.assign(Object.create(Point.prototype), eventType.type.source);
            },
            groupBy(source) {
                return source.id;
            },
            groupDescription(source) {
                return source.formatLabel();
            },
            stateName: 'ui.dataPointDetails',
            stateParams(source) {
                return {
                    pointXid: source.xid
                };
            }
        };
    }]);

    this.registerEventTypeOptions({
        typeName: 'DATA_SOURCE',
        orderBy: ['type.source.name', 'description'],
        icon: 'device_hub',
        groupBy(source) {
            return source.id;
        },
        groupDescription(source) {
            return source.name;
        },
        stateName: 'ui.settings.dataSources',
        stateParams(source) {
            return {
                xid: source.xid
            };
        }
    });

    this.registerEventTypeOptions({
        typeName: 'PUBLISHER',
        orderBy: ['type.source.name', 'description'],
        icon: 'cloud_upload',
        groupBy(source) {
            return source.id;
        },
        groupDescription(source) {
            return source.name;
        }
    });

    this.$get = eventTypeFactory;

    eventTypeFactory.$inject = ['maRestResource', 'maRqlBuilder', 'maUtil'];
    function eventTypeFactory(RestResource, RqlBuilder, Util) {

        const eventTypeOptionsMap = {};
        
        /**
         * Injects options, freezes the result so it cant be modified and creates a map of type name to options
         */
        eventTypeOptions.forEach(options => {
            try {
                const injected = Util.inject(options);
                eventTypeOptionsMap[injected.typeName] = Object.freeze(injected);
            } catch (e) {
                console.error(e);
            }
        });

        const eventTypeBaseUrl = '/rest/v2/event-types';
        
        class EventType {
            constructor(data) {
                Object.assign(this, data);
                if (!this.subType) {
                    this.subType = this.eventSubtype || null;
                }
                delete this.eventSubtype;
                
                this.typeId = this.constructor.typeId(this);
            }
            
            static typeId(type) {
                return `${type.eventType}_${type.subType || type.eventSubtype || null}_${type.referenceId1}_${type.referenceId2}`;
            }
        }
        
        class EventTypeInfo extends RestResource {
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
                }, opts).then(response => response.data.map(eventType => {
                    const options = new EventTypeOptions(eventTypeOptionsMap[eventType.typeName]);
                    return Object.assign(options, eventType);
                }));
            }
            
            initialize() {
                if (this.type) {
                    this.type = new EventType(this.type);
                }
            }
            
            get typeId() {
                return this.type && this.type.typeId;
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
        
        EventTypeInfo.EventType = EventType;

        return EventTypeInfo;
    }
}

export default eventTypeProvider;