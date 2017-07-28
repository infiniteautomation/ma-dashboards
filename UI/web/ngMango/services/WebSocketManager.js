/**
 * Copyright (C) 2017 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

WebSocketManagerFactory.$inject = ['MA_BASE_URL', '$rootScope', 'MA_TIMEOUT'];
function WebSocketManagerFactory(MA_BASE_URL, $rootScope, MA_TIMEOUT) {

	//var READY_STATE_CONNECTING = 0;
	//var READY_STATE_OPEN = 1;
	//var READY_STATE_CLOSING = 2;
	//var READY_STATE_CLOSED = 3;

	function WebSocketManager(options) {
	    angular.extend(this, options);
	    
	    this.listeners = 0;
	    this.eventScope = $rootScope.$new(true);
	    this.eventScope.webSocketManager = this;

	    $rootScope.$on('maWatchdog', function(event, current, previous) {
	        if (current.status === 'LOGGED_IN' && this.listeners > 0) {
                this.openSocket();
	        } else {
                this.closeSocket();
	        }
	    }.bind(this));
	}

	WebSocketManager.prototype.openSocket = function() {
		if (this.socket) {
			return;
		}

	    if (!('WebSocket' in window)) {
	        throw new Error('WebSocket not supported');
	    }

	    var host = document.location.host;
	    var protocol = document.location.protocol;

	    var baseUrl = MA_BASE_URL;
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
	    }.bind(this), MA_TIMEOUT);

	    socket.onclose = function() {
	        this.closeSocket();
	    }.bind(this);
	    
	    socket.onerror = function() {
	    	this.closeSocket();
	    }.bind(this);
	    
	    socket.onopen = function() {
	    	clearTimeout(this.connectTimer);
	    	delete this.connectTimer;
	    	this.eventScope.$broadcast('maWebSocketOpen');
	    }.bind(this);
	    
	    socket.onmessage = function(event) {
	    	var message;
	    	try {
	    		message = JSON.parse(event.data);
	    		if (message.status !== 'OK') {
	    			var error = new Error('Web socket status != OK');
	    			error.message = message;
	    			throw error;
	    		}
	    		this.eventScope.$broadcast('maWebSocketMessage', message.payload);
	    	} catch (e) {
	    		this.eventScope.$broadcast('maWebSocketError', e);
	    	}
    		
	    }.bind(this);

	    return socket;
	};

	WebSocketManager.prototype.closeSocket = function() {
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
	};

	WebSocketManager.prototype.sendMessage = function(message) {
		if (this.socket) {
			this.socket.send(JSON.stringify(message));
		}
	};

	WebSocketManager.prototype.subscribe = function($scope, handler, applyAsync) {
		if (this.listeners === 0) {
			this.openSocket();
		}
		this.listeners++;

		var boundHandler;
		if (applyAsync == null || applyAsync) {
			var fnName = applyAsync == null ? '$apply' : '$applyAsync';
			boundHandler = function() {
				var args = arguments;
				$scope[fnName](function() {
					handler.apply(this, args);
				});
			};
		} else {
			boundHandler = handler.bind(this);
		}
		
		var deregisterOpen = this.eventScope.$on('maWebSocketOpen', boundHandler);
		var deregisterMessage = this.eventScope.$on('maWebSocketMessage', boundHandler);
		var deregisterError = this.eventScope.$on('maWebSocketError', boundHandler);
		
		var deregister = function() {
			deregisterOpen();
			deregisterMessage();
			deregisterError();
			this.listeners--;
			if (this.listeners === 0) {
				this.closeSocket();
			}
		}.bind(this);
		
		$scope.$on('$destroy', deregister);
		
		return deregister;
	};

	return WebSocketManager;
}

return WebSocketManagerFactory;

}); // define
