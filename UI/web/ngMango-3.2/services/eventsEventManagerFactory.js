/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
* @ngdoc service
* @name ngMangoServices.maEventsEventManager
*
* @description
* Provides an <a ui-sref="ui.docs.ngMangoServices.EventManager">EventManager</a> factory pointing to the events websocket at `'/rest/v1/websocket/events'`
* - All methods available to <a ui-sref="ui.docs.ngMangoServices.EventManager">EventManager</a> are available.
*
*/

function eventsEventManager(EventManager) {
    
    var READY_STATE_CONNECTING = 0;
	var READY_STATE_OPEN = 1;
	var READY_STATE_CLOSING = 2;
	var READY_STATE_CLOSED = 3;
    
    var eventsEventManager = new EventManager({
    	url: '/rest/v1/websocket/events'
    });
    
    // var message = {"eventTypes":["ACKNOWLEDGED","RAISED","RETURN_TO_NORMAL","DEACTIVATED"], "levels":["LIFE_SAFETY","CRITICAL","URGENT","INFORMATION","NONE"]};
    var message = {"eventTypes":["RAISED", "ACKNOWLEDGED"], "levels":["LIFE_SAFETY","CRITICAL","URGENT","WARNING","IMPORTANT","INFORMATION","NONE"]};
    
    eventsEventManager.eventHandlers = [];
    
    eventsEventManager.subscribe = function(eventHandler) {
            if (!this.socket || this.socket.readyState !== READY_STATE_OPEN) return;
            
            this.socket.send(JSON.stringify(message));
            
            this.eventHandlers.push(eventHandler);
    };
    
    eventsEventManager.messageReceived = function(payload) {
        // console.log(payload);
        
        this.eventHandlers.forEach(function(handler) {
            handler(payload);
        });
    };
    
    
    return eventsEventManager;
    
    
    
}

eventsEventManager.$inject = ['maEventManager'];
return eventsEventManager;

}); // define
