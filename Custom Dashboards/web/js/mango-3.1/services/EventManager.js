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

function JsonStoreEventManagerFactory(mangoBaseUrl, mangoWatchdog, $rootScope, mangoTimeout, mangoReconnectDelay) {

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
	    
	    var _this = this;
	    
	    $rootScope.$on('mangoWatchdogTimeout', function() {
	    	_this.closeSocket();
	    });
	    
	    this.openSocket();
	}

	EventManager.prototype.openSocket = function() {
		var _this = this;
		
		if (this.socket) {
			throw new Error('Socket already open');
		}
		
		if (this.debounceTimer) {
			this.openPending = true;
			return;
		}
		this.debounceTimer = setTimeout(function() {
			delete _this.debounceTimer;
			if (_this.openPending) {
				delete _this.openPending;
				_this.openSocket();
			}
		}, mangoReconnectDelay);
		
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
	    	_this.closeSocket();
	    }, mangoTimeout);
	    
	    socket.onclose = function() {
	        _this.closeSocket();
	    };
	    socket.onerror = function() {
	    	_this.closeSocket();
	    };
	    socket.onopen = function() {
	    	mangoWatchdog.reset();
	    	clearTimeout(_this.connectTimer);
	    	_this.updateSubscriptions();
	    };
	    socket.onmessage = function(event) {
	        var message = JSON.parse(event.data);
	        _this.messageReceived(message);
	    };
	    
	    return socket;
	};
	
	EventManager.prototype.closeSocket = function() {
    	clearTimeout(this.connectTimer);
		if (this.socket) {
			this.socket.onclose = nop;
			this.socket.onerror = nop;
			this.socket.onopen = nop;
			this.socket.onmessage = nop;
			this.socket.close();
			delete this.socket;
		}
		
		this.activeSubscriptions = {};
        this.openSocket();
	};

	EventManager.prototype.messageReceived = function(message) {
	    if (message.status === 'OK') {
	    	mangoWatchdog.reset();
			
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

JsonStoreEventManagerFactory.$inject = ['mangoBaseUrl', 'mangoWatchdog', '$rootScope', 'mangoTimeout', 'mangoReconnectDelay'];
return JsonStoreEventManagerFactory;

}); // define
