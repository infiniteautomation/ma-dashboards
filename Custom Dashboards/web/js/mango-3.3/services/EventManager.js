/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['jquery'], function($) {
'use strict';
/**
* @ngdoc service
* @name maServices.EventManager
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
* @methodOf maServices.EventManager
* @name openSocket
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf maServices.EventManager
* @name closeSocket
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf maServices.EventManager
* @name messageReceived
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf maServices.EventManager
* @name subscribe
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf maServices.EventManager
* @name unsubscribe
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf maServices.EventManager
* @name smartSubscribe
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf maServices.EventManager
* @name updateSubscriptions
*
* @description
* REPLACE
*
*/

function JsonStoreEventManagerFactory(mangoBaseUrl, $rootScope, mangoTimeout) {

	var READY_STATE_CONNECTING = 0;
	var READY_STATE_OPEN = 1;
	var READY_STATE_CLOSING = 2;
	var READY_STATE_CLOSED = 3;

	function nop() {}

	function EventManager(options) {
		 // keys are xid, value is object where key is event type and value is the number of subscriptions
	    this.subscriptions = {};
	    // keys are xid, value is array of event types
	    this.activeSubscriptions = {};

	    $.extend(this, options);

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
			this.socket.onclose = nop;
			this.socket.onerror = nop;
			this.socket.onopen = nop;
			this.socket.onmessage = nop;
			this.socket.close();
			delete this.socket;
		}

		this.activeSubscriptions = {};
	};

	EventManager.prototype.messageReceived = function(message) {
	    if (message.status === 'OK') {
	        var payload = message.payload;
	        var eventType = payload.event || payload.action;
	        var xid = payload.xid || payload.object.xid;

	        var xidSubscriptions = this.subscriptions[xid];
	        if (!xidSubscriptions)
	            return;
	        $(xidSubscriptions.eventEmitter).trigger(eventType, payload);
	        $(this).trigger(xid, payload);
	    }
	};

	EventManager.prototype.subscribe = function(xid, eventTypes, eventHandler) {
	    if (!this.subscriptions[xid])
	        this.subscriptions[xid] = {eventEmitter: {}};
	    var xidSubscriptions = this.subscriptions[xid];

	    if (!$.isArray(eventTypes)) eventTypes = [eventTypes];

	    for (var i = 0; i < eventTypes.length; i++) {
	    	var eventType = eventTypes[i];
	        if (typeof eventHandler === 'function') {
	            $(xidSubscriptions.eventEmitter).on(eventType, eventHandler);
	        }

	        if (!xidSubscriptions[eventType]) {
	            xidSubscriptions[eventType] = 1;
	        }
	        else {
	            xidSubscriptions[eventType] = xidSubscriptions[eventType] + 1;
	        }
	    }

	    this.updateSubscriptions(xid);
	};

	EventManager.prototype.unsubscribe = function(xid, eventTypes, eventHandler) {
	    var xidSubscriptions = this.subscriptions[xid];
	    if (!xidSubscriptions)
	        return;

	    if (!$.isArray(eventTypes)) eventTypes = [eventTypes];

	    for (var i = 0; i < eventTypes.length; i++) {
	    	var eventType = eventTypes[i];
	    	if (typeof eventHandler === 'function') {
	            $(xidSubscriptions.eventEmitter).off(eventType, eventHandler);
	    	}

	        var count = xidSubscriptions[eventType];
	        if (count >= 1) {
	            xidSubscriptions[eventType] = count - 1;
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
        $scope.$on('$destroy', function() {
            this.unsubscribe(xid, eventTypes, appliedHandler);
        }.bind(this));

        function scopeApply($scope, fn) {
            var args = Array.prototype.slice.call(arguments, 2);
            var boundFn = fn.bind.apply(fn, [null].concat(args));
            $scope.$apply(boundFn);
        }
	};

	EventManager.prototype.updateSubscriptions = function(xid) {
		if (!this.socket || this.socket.readyState !== READY_STATE_OPEN) return;

		if (!xid) {
			for (var xidKey in this.subscriptions) {
				this.updateSubscriptions(xidKey);
			}
			return;
		}

	    var xidSubscriptions = this.subscriptions[xid];
	    if (!xidSubscriptions)
	        return;

	    var eventTypes = [];
	    for (var key in xidSubscriptions) {
	        if (key === 'eventEmitter')
	            continue;

	        if (xidSubscriptions[key] === 0) {
	        	delete xidSubscriptions[key];
	        } else {
	        	eventTypes.push(key);
	        }
	    }
	    eventTypes.sort();

	    var activeSubs = this.activeSubscriptions[xid];

	    // there are no subscriptions for any event types for this xid
	    if (eventTypes.length === 0) {
	        delete this.subscriptions[xid];
	        delete this.activeSubscriptions[xid];
	    }

	    if (!activeSubs || !arraysEqual(activeSubs, eventTypes)) {
	    	if (eventTypes.length)
	    		this.activeSubscriptions[xid] = eventTypes;

	        var message = {};
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

JsonStoreEventManagerFactory.$inject = ['mangoBaseUrl', '$rootScope', 'mangoTimeout'];
return JsonStoreEventManagerFactory;

}); // define
