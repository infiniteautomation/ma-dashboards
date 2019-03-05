/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import MultiMap from './MultiMap';

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

        const eventTypeOptionsMap = new Map();
        
        /**
         * Injects options, freezes the result so it cant be modified and creates a map of type name to options
         */
        eventTypeOptions.forEach(options => {
            try {
                const injected = Util.inject(options);
                eventTypeOptionsMap.set(injected.typeName, Object.freeze(injected));
            } catch (e) {
                console.error(e);
            }
        });

        const eventTypeBaseUrl = '/rest/v2/event-types';

        
        class EventTypeMap extends MultiMap {
            eventTypeKey(eventType) {
                const type = eventType.eventType;
                const subType = eventType.subType || eventType.eventSubtype || null;
                return `${type}_${subType}`;
            }
            
            set(eventType, value) {
                const key = this.eventTypeKey(eventType);
                super.set(key, {
                    eventType,
                    value
                });
            }
            
            get(eventType) {
                const subTypeMatches = super.get(this.eventTypeKey(eventType));
                
                const values = new Set();
                for (let m of subTypeMatches) {
                    if (m.eventType.matches(eventType)) {
                        values.add(m.value);
                    }
                }
                return values;
            }
            
            count(eventType) {
                const subTypeMatches = super.get(this.eventTypeKey(eventType));
                
                let count = 0;
                for (let m of subTypeMatches) {
                    if (m.eventType.matches(eventType)) {
                        count++;
                    }
                }
                return count;
            }
        }
        
        class EventType {
            constructor(data) {
                Object.assign(this, data);
                if (!this.subType) {
                    this.subType = this.eventSubtype || null;
                }
            }
            
            get typeId() {
                return this.constructor.typeId(this);
            }
            
            matches(other) {
                if (this.eventType !== other.eventType || this.subType !== (other.subType || other.eventSubtype || null)) {
                    return false;
                }
                
                if (!this.referenceId1) {
                    return true;
                } else if (this.referenceId1 === other.referenceId1) {
                    if (!this.referenceId2 || this.referenceId2 === other.referenceId2) {
                        return true;
                    }
                }
                return false;
            }
            
            static typeId(eventType) {
                const type = eventType.eventType;
                const subType = eventType.subType || eventType.eventSubtype || null;
                const ref1 = eventType.referenceId1 || 0;
                const ref2 = eventType.referenceId2 || 0;
                return `${type}_${subType}_${ref1}_${ref2}`;
            }
        }
        
        class EventTypeInfo extends RestResource {
            static get baseUrl() {
                return eventTypeBaseUrl;
            }
            
            static get idProperty() {
                return null;
            }

            initialize() {
                if (this.type) {
                    this.type = new EventType(this.type);
                }
            }
            
            get typeId() {
                return this.type && this.type.typeId;
            }
            
            static list(eventType, opts = {}) {
                return this.query(eventType, null, opts);
            }
            
            static buildQuery(eventType) {
                const builder = new RqlBuilder();
                builder.queryFunction = (queryObj, opts) => {
                    return this.query(eventType, queryObj, opts);
                };
                return builder;
            }

            static query(eventType, queryObject, opts = {}) {
                const params = {};
                
                if (queryObject) {
                    const rqlQuery = queryObject.toString();
                    if (rqlQuery) {
                        params.rqlQuery = rqlQuery;
                    }
                }
                
                let segments = [];
                if (eventType && eventType.eventType && (eventType.subType || eventType.subType === null)) {
                    segments.push(eventType.eventType, eventType.subType);
                    if (eventType.referenceId1) {
                        segments.push(eventType.referenceId1);
                        if (eventType.referenceId2) {
                            segments.push(eventType.referenceId2);
                        }
                    }
                }
                segments = segments.map(s => this.encodeUriSegment(s));
                segments.unshift(this.baseUrl);

                return this.http({
                    url: segments.join('/'),
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
        EventTypeInfo.EventTypeMap = EventTypeMap;

        return EventTypeInfo;
    }
}

export default eventTypeProvider;