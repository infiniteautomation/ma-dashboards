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

        class EventType {
            constructor(data) {
                Object.assign(this, data);
                if (!this.subType) {
                    this.subType = this.eventSubtype || null;
                }
                this.typeId = this.getTypeId();
                this.matchingIds = this.getMatchingIds();
            }
            
            getTypeId() {
                return this.constructor.typeId(this);
            }
            
            getMatchingIds() {
                return this.constructor.matchingIds(this);
            }

            static typeId(eventType) {
                const type = eventType.eventType;
                const subType = eventType.subType || eventType.eventSubtype || null;
                const ref1 = eventType.referenceId1 || 0;
                const ref2 = eventType.referenceId2 || 0;
                return `${type}_${subType}_${ref1}_${ref2}`;
            }
            
            static matchingIds(eventType) {
                const ids = [eventType.typeId || this.typeId(eventType)];
                if (eventType.referenceId2) {
                    ids.push(this.typeId({
                        eventType: eventType.eventType,
                        subType: eventType.subType,
                        referenceId1: eventType.referenceId1,
                        referenceId2: 0
                    }));
                }
                if (eventType.referenceId1) {
                    ids.push(this.typeId({
                        eventType: eventType.eventType,
                        subType: eventType.subType,
                        referenceId1: 0,
                        referenceId2: 0
                    }));
                }
                if (eventType.subType) {
                    ids.push(this.typeId({
                        eventType: eventType.eventType,
                        subType: null,
                        referenceId1: 0,
                        referenceId2: 0
                    }));
                }
                return ids;
            }
        }

        class EventTypeMap extends MultiMap {
            set(eventType, value) {
                return super.set(eventType.typeId, value);
            }
            
            get(eventType, exact) {
                const values = new Set();
                
                if (exact) {
                    return super.get(eventType.typeId || EventType.typeId(eventType));
                }
                
                const matchingIds = eventType.matchingIds || EventType.matchingIds(eventType);
                for (let id of matchingIds) {
                    for (let v of super.get(id)) {
                        values.add(v);
                    }
                }
                
                return values;
            }
            
            has(eventType, exact, value) {
                if (exact) {
                    return super.has(eventType.typeId || EventType.typeId(eventType));
                }
                
                const matchingIds = eventType.matchingIds || EventType.matchingIds(eventType);
                for (let id of matchingIds) {
                    if (super.has(id, value)) {
                        return true;
                    }
                }
                return false;
            }
            
            delete(eventType, exact, value) {
                if (exact) {
                    return super.delete(eventType.typeId || EventType.typeId(eventType));
                }
                
                const deleted = new Set();
                const matchingIds = eventType.matchingIds || EventType.matchingIds(eventType);
                for (let id of matchingIds) {
                    for (let d of super.delete(id, value)) {
                        deleted.add(d);
                    }
                }
                return deleted;
            }
            
            count(eventType, exact) {
                return this.get(eventType, exact).size;
            }
            
            /* Not used for now
            deleteMoreSpecific(eventType) {
                // return immediately if eventType is the most specific form
                if (eventType.referenceId1 && eventType.referenceId2) {
                    return;
                }
                
                for (let et of this.values()) {
                    if (et.matchingIds.includes(eventType.typeId)) {
                        this.delete(et);
                    }
                }
            }
            */
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
            
            handleable() {
                return this.type.eventType && (this.type.subType || !this.supportsSubtype);
            }

            hasChildren() {
                const eventType = this.type;
                if (this.supportsSubtype && !eventType.subType) {
                    return true;
                } else if (this.supportsReferenceId1 && !eventType.referenceId1) {
                    return true;
                } else if (this.supportsReferenceId2 && !eventType.referenceId2) {
                    return true;
                }
                return false;
            }
            
            loadChildren() {
                const eventType = this.type;
                return this.constructor.list({
                    eventType: eventType.eventType,
                    subType: this.supportsSubtype ? eventType.subType || undefined : null,
                    referenceId1: eventType.referenceId1,
                    referenceId2: eventType.referenceId2
                });
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
                if (eventType && eventType.eventType) {
                    segments.push(eventType.eventType);
                    if (eventType.subType || eventType.subType === null) {
                        segments.push(eventType.subType);
                        if (eventType.referenceId1) {
                            segments.push(eventType.referenceId1);
                            if (eventType.referenceId2) {
                                segments.push(eventType.referenceId2);
                            }
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