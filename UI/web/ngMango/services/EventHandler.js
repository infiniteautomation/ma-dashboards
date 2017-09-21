/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

eventHandlerFactory.$inject = ['maRestResource'];
function eventHandlerFactory(RestResource) {
    
    const eventHandlerBaseUrl = '/rest/v1/event-handlers';
    const eventHandlerWebSocketUrl = '/rest/v1/websocket/event-handlers';
    const eventHandlerXidPrefix = 'EH_';
    
	const defaultProperties = {
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
    }
    
    return EventHandler;
}

return eventHandlerFactory;

}); // define
