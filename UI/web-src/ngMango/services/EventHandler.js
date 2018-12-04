/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

eventHandlerProvider.$inject = [];
function eventHandlerProvider() {
    
    const eventHandlerTypes = [
        {
            type: 'EMAIL',
            description: 'eventHandlers.type.email',
            template: `<ma-event-handler-email-editor></ma-event-handler-email-editor>`
        },
        {
            type: 'PROCESS',
            description: 'eventHandlers.type.process',
            template: ``
        },
        {
            type: 'SET_POINT',
            description: 'eventHandlers.type.setPoint',
            template: ``
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
    
    eventHandlerFactory.$inject = ['maRestResource', '$templateCache', '$injector', '$rootScope'];
    function eventHandlerFactory(RestResource, $templateCache, $injector, $rootScope) {

        const eventHandlerBaseUrl = '/rest/v2/event-handlers';
        const eventHandlerWebSocketUrl = '/rest/v2/websocket/event-handlers';
        const eventHandlerXidPrefix = 'EH_';

        const eventHandlerTypesByName = Object.create(null);
        eventHandlerTypes.forEach(eventHandlerType => {
            eventHandlerTypesByName[eventHandlerType.type] = eventHandlerType;
            
            // put the templates in the template cache so we can ng-include them
            if (eventHandlerType.template && !eventHandlerType.templateUrl) {
                eventHandlerType.templateUrl = `eventHandlers.${eventHandlerType.type}.html`;
                $templateCache.put(eventHandlerType.templateUrl, eventHandlerType.template);
            }
        });
        
    	const defaultProperties = {
            name: '',
            eventTypes: [],
            handlerType: 'EMAIL',
            activeRecipients: [],
            additionalContext: [],
            customTemplate: '',
            disabled: false,
            sendEscalation: false,
            escalationDelay: 1,
            escalationDelayType: 'HOURS',
            escalationRecipients: [],
            sendInactive: false,
            inactiveOverride: false,
            inactiveRecipients: [],
            includeLogfile: false,
            includePointValueCount: 10,
            includeSystemInfo: false
    	};
    	
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
            
            static get handlerTypes() {
                return Object.freeze(eventHandlerTypes);
            }
            
            static get handlerTypesByName() {
                return Object.freeze(eventHandlerTypesByName);
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
        }
    
        return EventHandler;
    }
}

export default eventHandlerProvider;