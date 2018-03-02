/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';


eventHandlerFactory.$inject = ['maRestResource', 'MA_EVENT_HANDLER_TYPES'];
function eventHandlerFactory(RestResource, MA_EVENT_HANDLER_TYPES) {

    const typesByName = Object.create(null);
    MA_EVENT_HANDLER_TYPES.forEach(type => {
        typesByName[type.type] = type;
    });

    const eventHandlerBaseUrl = '/rest/v1/event-handlers';
    const eventHandlerWebSocketUrl = '/rest/v1/websocket/event-handlers';
    const eventHandlerXidPrefix = 'EH_';

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
            return MA_EVENT_HANDLER_TYPES;
        }
        
        static get handlerTypesByName() {
            return typesByName;
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

export default eventHandlerFactory;


