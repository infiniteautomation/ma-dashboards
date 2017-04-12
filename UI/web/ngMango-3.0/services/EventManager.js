/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';
/**
* @ngdoc service
* @name ngMangoServices.EventManager
*
* @description
* REPLACE
*
* # Usage
*
* <pre prettyprint-mode="javascript">
    REPLACE
* </pre>
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.EventManager
* @name openSocket
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.EventManager
* @name closeSocket
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.EventManager
* @name messageReceived
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.EventManager
* @name subscribe
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.EventManager
* @name unsubscribe
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.EventManager
* @name smartSubscribe
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.EventManager
* @name updateSubscriptions
*
* @description
* REPLACE
*
*/

function EventManagerFactory(mangoBaseUrl, $rootScope, mangoTimeout) {

	var READY_STATE_CONNECTING = 0;
	var READY_STATE_OPEN = 1;
	var READY_STATE_CLOSING = 2;
	var READY_STATE_CLOSED = 3;

	function EventManager(options) {
		 // keys are xid, value is object where key is event type and value is the number of subscriptions
	    this.subscriptionsByXid = {};
	    // keys are xid, value is array of event types
	    this.activeEventTypesByXid = {};
        // subscriptions to all xids
        this.allSubscriptions = {};
        // array of event types active for all xids
        this.activeAllEventTypes = [];

	    angular.extend(this, options);

	    $rootScope.$on('mangoWatchdog', function(event, current, previous) {
	        if (current.loggedIn) {
                this.openSocket();
	        } else {
                this.closeSocket();
	        }
	    }.bind(this));

	    this.openSocket();
	}

	EventManager.prototype.openSocket = function() {
		if (this.socket) {
			return;
		}

	    if (!('WebSocket' in window)) {
	        throw new Error('WebSocket not supported');
	    }

	    var host = document.location.host;
	    var protocol = document.location.protocol;

	    var baseUrl = mangoBaseUrl;
	    if (baseUrl) {
	        var i = baseUrl.indexOf('//');
	        if (i >= 0) {
	            protocol = baseUrl.substring(0, i);
	            host = baseUrl.substring(i+2);
	        }
	        else {
	            host = baseUrl;
	        }
	    }

	    protocol = protocol === 'https:' ? 'wss:' : 'ws:';

	    var socket = this.socket = new WebSocket(protocol + '//' + host + this.url);

	    this.connectTimer = setTimeout(function() {
	    	this.closeSocket();
	    }.bind(this), mangoTimeout);

	    socket.onclose = function() {
	        this.closeSocket();
	    }.bind(this);
	    
	    socket.onerror = function() {
	    	this.closeSocket();
	    }.bind(this);
	    
	    socket.onopen = function() {
	    	clearTimeout(this.connectTimer);
	    	delete this.connectTimer;
	    	
	    	// update subscriptions for individual xids
	    	for (var xidKey in this.subscriptionsByXid) {
                this.updateSubscriptions(xidKey);
            }
	    	// update subscriptions to all xids
	    	this.updateSubscriptions();
	    	
	    }.bind(this);
	    
	    socket.onmessage = function(event) {
	        var message = JSON.parse(event.data);
	        this.messageReceived(message);
	    }.bind(this);

	    return socket;
	};

	EventManager.prototype.closeSocket = function() {
	    if (this.connectTimer) {
	        clearTimeout(this.connectTimer);
            delete this.connectTimer;
	    }
		if (this.socket) {
			this.socket.onclose = angular.noop;
			this.socket.onerror = angular.noop;
			this.socket.onopen = angular.noop;
			this.socket.onmessage = angular.noop;
			this.socket.close();
			delete this.socket;
		}

		this.activeEventTypesByXid = {};
        this.activeAllEventTypes = [];
	};

	EventManager.prototype.messageReceived = function(message) {
	    if (message.status === 'OK') {
	        var payload = message.payload;
	        var eventType = payload.event || payload.action;
	        var xid = payload.xid || payload.object.xid;

	        var xidSubscriptions = this.subscriptionsByXid[xid];
	        if (xidSubscriptions) {
	            xidSubscriptions.lastPayload = payload;
	            $(xidSubscriptions.eventEmitter).trigger(eventType, payload);
	        }
	        $(this).trigger(eventType, payload);
	    }
	};

	EventManager.prototype.subscribe = function(xid, eventTypes, eventHandler) {
	    var xidSubscriptions;
	    if (xid) {
    	    if (!this.subscriptionsByXid[xid])
    	        this.subscriptionsByXid[xid] = {eventEmitter: {}};
    	    xidSubscriptions = this.subscriptionsByXid[xid];
	    }

	    if (!$.isArray(eventTypes)) eventTypes = [eventTypes];
	    
	    if (this.replayLastPayload && xidSubscriptions.lastPayload && typeof eventHandler === 'function') {
	        eventHandler(null, xidSubscriptions.lastPayload);
	    }

	    for (var i = 0; i < eventTypes.length; i++) {
	    	var eventType = eventTypes[i];
	        
	    	if (xidSubscriptions) {
    	    	if (typeof eventHandler === 'function') {
    	            $(xidSubscriptions.eventEmitter).on(eventType, eventHandler);
    	        }
    
    	        if (!xidSubscriptions[eventType]) {
    	            xidSubscriptions[eventType] = 1;
    	        }
    	        else {
    	            xidSubscriptions[eventType]++;
    	        }
	    	} else {
	    	    if (typeof eventHandler === 'function') {
                    $(this).on(eventType, eventHandler);
                }
	    	    
	    	    if (!this.allSubscriptions[eventType]) {
	    	        this.allSubscriptions[eventType] = 1;
                }
                else {
                    this.allSubscriptions[eventType]++;
                }
	    	}
	    }

	    this.updateSubscriptions(xid);
	};

	EventManager.prototype.unsubscribe = function(xid, eventTypes, eventHandler) {
	    var xidSubscriptions;
	    if (xid) {
	        xidSubscriptions = this.subscriptionsByXid[xid];
	    }

	    if (!$.isArray(eventTypes)) eventTypes = [eventTypes];

	    for (var i = 0; i < eventTypes.length; i++) {
	    	var eventType = eventTypes[i];
	    	
	    	if (xidSubscriptions) {
    	    	if (typeof eventHandler === 'function') {
    	            $(xidSubscriptions.eventEmitter).off(eventType, eventHandler);
    	    	}

    	        if (xidSubscriptions[eventType] > 0) {
    	            xidSubscriptions[eventType]--;
    	        }
	    	} else {
	    	    if (typeof eventHandler === 'function') {
                    $(this).off(eventType, eventHandler);
                }
	    	    
	    	    if (this.allSubscriptions[eventType] > 0) {
	                this.allSubscriptions[eventType]--;
	    	    }
	    	}
	    }

	    this.updateSubscriptions(xid);
	};

	/**
	 * Subscribes to the event type for the XID but also unsubscribes automatically when the given $scope
	 * is destroyed and does scope apply for the eventHandler function
	 */
	EventManager.prototype.smartSubscribe = function($scope, xid, eventTypes, eventHandler) {
	    var appliedHandler = scopeApply.bind(null, $scope, eventHandler);
	    this.subscribe(xid, eventTypes, appliedHandler);
	    
	    var $this = this;
	    var unsubscribe = function() {
	        $this.unsubscribe(xid, eventTypes, appliedHandler);
        };
        var deregister = $scope.$on('$destroy', unsubscribe);
        var manualUnsubscribe = function() {
            deregister();
            unsubscribe();
        };
        return manualUnsubscribe;

        function scopeApply($scope, fn) {
            var args = Array.prototype.slice.call(arguments, 2);
            var boundFn = fn.bind.apply(fn, [null].concat(args));
            $scope.$applyAsync(boundFn);
        }
	};

	EventManager.prototype.updateSubscriptions = function(xid) {
		if (!this.socket || this.socket.readyState !== READY_STATE_OPEN) return;

		var subscriptions = xid ? this.subscriptionsByXid[xid] : this.allSubscriptions;

	    var eventTypes = [];
	    for (var key in subscriptions) {
	        if (key === 'eventEmitter' || key === 'lastPayload')
	            continue;

	        if (subscriptions[key] === 0) {
	        	delete subscriptions[key];
	        } else {
	        	eventTypes.push(key);
	        }
	    }
	    eventTypes.sort();

	    var activeSubs = xid ? this.activeEventTypesByXid[xid] : this.activeAllEventTypes;

	    // there are no subscriptions for any event types for this xid
	    if (xid && eventTypes.length === 0) {
	        delete this.subscriptionsByXid[xid];
	        delete this.activeEventTypesByXid[xid];
	    }

	    if (!activeSubs || !arraysEqual(activeSubs, eventTypes)) {
	    	if (eventTypes.length) {
	    	    if (xid) {
	                this.activeEventTypesByXid[xid] = eventTypes;
	    	    } else {
	    	        this.activeAllEventTypes = eventTypes;
	    	    }
	    	}

	        var message = {};
	        if (xid)
	            message.xid = xid;
	        message.eventTypes = eventTypes;

	        this.socket.send(JSON.stringify(message));
	    }
	};

	function arraysEqual(a, b) {
		if (a.length !== b.length) return false;
		for (var i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}

	return EventManager;
}

EventManagerFactory.$inject = ['mangoBaseUrl', '$rootScope', 'mangoTimeout'];
return EventManagerFactory;

}); // define
