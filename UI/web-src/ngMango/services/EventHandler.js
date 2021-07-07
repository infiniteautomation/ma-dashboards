/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';

eventHandlerProvider.$inject = [];
function eventHandlerProvider() {

    const eventHandlerTypes = [
        {
            type: 'EMAIL',
            description: 'eventHandlers.type.email',
            template: `<ma-event-handler-email-editor></ma-event-handler-email-editor>`,
            defaultProperties: {
                activeRecipients: [],
                additionalContext: [],
                customTemplate: '',
                sendEscalation: false,
                escalationDelay: 1,
                escalationDelayType: 'HOURS',
                escalationRecipients: [],
                sendInactive: false,
                activeProcessTimeout: 15,
                inactiveProcessTimeout: 15,
                inactiveOverride: false,
                inactiveRecipients: [],
                includeLogfile: false,
                includePointValueCount: 10,
                includeSystemInfo: false,
                scriptContext: [],
                subject: 'INCLUDE_EVENT_MESSAGE'
            }
        },
        {
            type: 'PROCESS',
            description: 'eventHandlers.type.process',
            template: `<ma-event-handler-process-editor></ma-event-handler-process-editor>`
        },
        {
            type: 'SET_POINT',
            description: 'eventHandlers.type.setPoint',
            template: `<ma-event-handler-set-point-editor></ma-event-handler-set-point-editor>`,
            defaultProperties: {
                activeAction: 'NONE',
                inactiveAction: 'NONE'
            }
        },
        {
            type: 'SCRIPT',
            description: 'eventHandlers.type.script',
            template: `<ma-event-handler-script-editor event-handler="$ctrl.eventHandler"></ma-event-handler-script-editor>`
        }
    ];

    this.registerEventHandlerType = function(type) {
        const existing = eventHandlerTypes.find(t => t.type === type.type);
        if (existing) {
            console.error('Tried to register event handler type twice', type);
            return;
        }
        eventHandlerTypes.push(type);
    };

    this.$get = eventHandlerFactory;

    eventHandlerFactory.$inject = ['maRestResource', '$templateCache', '$injector', '$rootScope', 'maEventTypeInfo'];
    function eventHandlerFactory(RestResource, $templateCache, $injector, $rootScope, EventTypeInfo) {

        const eventHandlerBaseUrl = '/rest/latest/event-handlers';
        const eventHandlerWebSocketUrl = '/rest/latest/websocket/event-handlers';
        const eventHandlerXidPrefix = 'EH_';

        const defaultProperties = {
            name: '',
            xid: '',
            eventTypes: [],
            disabled: false,
            readPermission: [],
            editPermission: []
        };

        const eventHandlerTypesByName = Object.create(null);

        class EventHandler extends RestResource {
            static get defaultProperties() {
                return defaultProperties;
            }

            static get baseUrl() {
                return eventHandlerBaseUrl;
            }

            static get webSocketUrl() {
                return eventHandlerWebSocketUrl;
            }

            static get xidPrefix() {
                return eventHandlerXidPrefix;
            }

            static handlerTypes() {
                return eventHandlerTypes;
            }

            static handlerTypesByName() {
                return eventHandlerTypesByName;
            }

            static create(typeName) {
                return eventHandlerTypesByName[typeName].create();
            }

            static forEventType(eventType, subType, ref1, ref2) {
                const queryBuilder = this.buildQuery()
                    .eq('eventTypeName', eventType);

                if (subType !== undefined) {
                    queryBuilder.eq('eventSubtypeName', subType);
                }
                if (ref1 !== undefined) {
                    queryBuilder.eq('eventTypeRef1', ref1);
                }
                if (ref2 !== undefined) {
                    queryBuilder.eq('eventTypeRef2', ref2);
                }
                return queryBuilder.query();
            }

            static runCommand (command, timeout) {
                const url = `/rest/latest/server/execute-command`;

                const data = {
                    command: command,
                    timeout: timeout
                };

                return this.http({
                    method: 'POST',
                    url: url,
                    data: data
                }).then(response => {
                    return response.data;
                });
            }

            initialize() {
                if (Array.isArray(this.eventTypes)) {
                    this.eventTypes = this.eventTypes.map(et => new EventTypeInfo.EventType(et));
                }
            }

            addEventType(eventType) {
                if (!(eventType instanceof EventTypeInfo.EventType)) {
                    eventType = new EventTypeInfo.EventType(eventType);
                }
                this.eventTypes.push(eventType);
            }

            hasEventType(eventTypeId) {
                return this.eventTypes.some(et => et.typeId === eventTypeId);
            }
        }

        class EventHandlerType {
            constructor(defaults = {}) {
                Object.assign(this, defaults);

                // put the templates in the template cache so we can ng-include them
                if (this.template && !this.templateUrl) {
                    this.templateUrl = `eventHandlers.${this.type}.html`;
                    $templateCache.put(this.templateUrl, this.template);
                }
            }

            create() {
                return new EventHandler(Object.assign({}, this.defaultProperties && angular.copy(this.defaultProperties), {
                    handlerType: this.type
                }));
            }
        }

        eventHandlerTypes.forEach((type, i) => {
            const eventHandlerType = new EventHandlerType(type);
            eventHandlerTypesByName[eventHandlerType.type] = eventHandlerType;
            eventHandlerTypes[i] = eventHandlerType;
            Object.freeze(eventHandlerType);
        });
        Object.freeze(eventHandlerTypes);
        Object.freeze(eventHandlerTypesByName);

        return EventHandler;
    }
}

export default eventHandlerProvider;