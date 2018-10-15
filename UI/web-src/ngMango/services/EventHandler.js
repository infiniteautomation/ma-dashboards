/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventHandlerEditorEmailTemplate from '../components/eventHandlerEditor/email.html';
//import eventHandlerEditorProcessTemplate from './components/eventHandlerEditor/process.html';
//import eventHandlerEditorSetPointTemplate from './components/eventHandlerEditor/setPoint.html';

eventHandlerProvider.$inject = [];
function eventHandlerProvider() {
    
    const eventHandlerTypes = [
        {
            type: 'EMAIL',
            description: 'eventHandlers.type.email',
            editorTemplateUrl: 'eventHandlers.email.html'
        },
        {
            type: 'PROCESS',
            description: 'eventHandlers.type.process',
            editorTemplateUrl: 'eventHandlers.process.html'
        },
        {
            type: 'SET_POINT',
            description: 'eventHandlers.type.setPoint',
            editorTemplateUrl: 'eventHandlers.setPoint.html'
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
    
    eventHandlerFactory.$inject = ['maRestResource', '$templateCache'];
    function eventHandlerFactory(RestResource, $templateCache) {
        $templateCache.put('eventHandlers.email.html', eventHandlerEditorEmailTemplate);

        const eventHandlerBaseUrl = '/rest/v1/event-handlers';
        const eventHandlerWebSocketUrl = '/rest/v1/websocket/event-handlers';
        const eventHandlerXidPrefix = 'EH_';

        const eventHandlerTypesByName = Object.create(null);
        eventHandlerTypes.forEach(type => {
            eventHandlerTypesByName[type.type] = type;
        });
        
    	const defaultProperties = {
            alias: '',
            eventType: {
                typeName: 'SYSTEM',
                systemEventType: 'SET_POINT_HANDLER_FAILURE',
                refId1: 0
            },
            
            handlerType: 'EMAIL',
            activeRecipients: [{type: 'USER', username: 'admin'}],
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