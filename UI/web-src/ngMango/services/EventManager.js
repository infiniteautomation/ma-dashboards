/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';

/**
* @ngdoc service
* @name ngMangoServices.maEventManager
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
* @methodOf ngMangoServices.maEventManager
* @name openSocket
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEventManager
* @name closeSocket
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEventManager
* @name messageReceived
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEventManager
* @name subscribe
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEventManager
* @name unsubscribe
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEventManager
* @name smartSubscribe
*
* @description
* REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEventManager
* @name updateSubscriptions
*
* @description
* REPLACE
*
*/

EventManagerFactory.$inject = ['MA_BASE_URL', '$rootScope', 'MA_TIMEOUT', 'maUser', '$window', '$injector'];
function EventManagerFactory(mangoBaseUrl, $rootScope, mangoTimeout, maUser, $window, $injector) {

    const $state = $injector.has('$state') && $injector.get('$state');
    
	//const READY_STATE_CONNECTING = 0;
	const READY_STATE_OPEN = 1;
	//const READY_STATE_CLOSING = 2;
	//const READY_STATE_CLOSED = 3;

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

	    let unloadPending = false;
        $window.addEventListener('beforeunload', event => {
            // if a beforeunload event occurs on the login page do not try and open the WebSocket
            if ($state && $state.includes('login')) {
                unloadPending = true;
            }
        });

	    $rootScope.$on('maWatchdog', (event, current, previous) => {
	        if (current.status === 'LOGGED_IN') {
                // API is up and we are logged in
	            
	            // prevent opening WS connections which are closed immediately when maLoginRedirector sets window.location
	            if (!unloadPending) {
                    this.openSocket();
	            }
	        } else if (current.status === 'API_UP') {
	            // API is up but we aren't logged in
                this.closeSocket();
	        }
	        // all other states we dont do anything
	    });

	    this.openSocket();
	}

	EventManager.prototype.openSocket = function() {
	    // return if socket is already open or there is no authenticated user
		if (this.socket || (!this.noAuthenticationRequired && !maUser.current)) {
			return;
		}

	    if (!('WebSocket' in window)) {
	        throw new Error('WebSocket not supported');
	    }

	    let host = document.location.host;
	    let protocol = document.location.protocol;

	    const baseUrl = mangoBaseUrl;
	    if (baseUrl) {
	        const i = baseUrl.indexOf('//');
	        if (i >= 0) {
	            protocol = baseUrl.substring(0, i);
	            host = baseUrl.substring(i+2);
	        }
	        else {
	            host = baseUrl;
	        }
	    }

	    protocol = protocol === 'https:' ? 'wss:' : 'ws:';

	    const socket = this.socket = new WebSocket(protocol + '//' + host + this.url);

	    this.connectTimer = setTimeout(() => {
	    	this.closeSocket();
	    }, mangoTimeout);

	    socket.onclose = () => {
	        this.closeSocket();
	    };
	    
	    socket.onerror = () => {
	    	this.closeSocket();
	    };
	    
	    socket.onopen = () => {
	    	clearTimeout(this.connectTimer);
	    	delete this.connectTimer;
	    	
	    	// update subscriptions for individual xids
	    	for (const xidKey in this.subscriptionsByXid) {
                this.updateSubscriptions(xidKey);
            }
	    	// update subscriptions to all xids
	    	this.updateSubscriptions();
	    };
	    
	    socket.onmessage = (event) => {
	        const message = JSON.parse(event.data);
	        this.messageReceived(message);
	    };

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
	        const payload = this.transformPayload(message.payload);
	        const eventType = payload.event || payload.action;
	        const xid = payload.xid || payload.object.xid;

	        const xidSubscriptions = this.subscriptionsByXid[xid];
	        if (xidSubscriptions) {
	            xidSubscriptions.lastPayload = payload;
	            angular.element(xidSubscriptions.eventEmitter).triggerHandler(eventType, payload);
	        }
	        angular.element(this).triggerHandler(eventType, payload);
	    }
	};
	
	EventManager.prototype.transformPayload = function(payload) {
	    return payload;
	};

	EventManager.prototype.subscribe = function(xid, eventTypes, eventHandler) {
	    let xidSubscriptions;
	    if (xid) {
    	    if (!this.subscriptionsByXid[xid])
    	        this.subscriptionsByXid[xid] = {eventEmitter: {}};
    	    xidSubscriptions = this.subscriptionsByXid[xid];
	    }

	    if (!Array.isArray(eventTypes)) eventTypes = [eventTypes];

	    if (this.replayLastPayload && xidSubscriptions && xidSubscriptions.lastPayload && typeof eventHandler === 'function') {
	        eventHandler(null, xidSubscriptions.lastPayload);
	    }

	    for (let i = 0; i < eventTypes.length; i++) {
	    	const eventType = eventTypes[i];
	        
	    	if (xidSubscriptions) {
    	    	if (typeof eventHandler === 'function') {
    	    	    angular.element(xidSubscriptions.eventEmitter).on(eventType, eventHandler);
    	        }
    
    	        if (!xidSubscriptions[eventType]) {
    	            xidSubscriptions[eventType] = 1;
    	        }
    	        else {
    	            xidSubscriptions[eventType]++;
    	        }
	    	} else {
	    	    if (typeof eventHandler === 'function') {
	    	        angular.element(this).on(eventType, eventHandler);
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
	    let xidSubscriptions;
	    if (xid) {
	        xidSubscriptions = this.subscriptionsByXid[xid];
	    }

	    if (!Array.isArray(eventTypes)) eventTypes = [eventTypes];

	    for (let i = 0; i < eventTypes.length; i++) {
	    	const eventType = eventTypes[i];
	    	
	    	if (xidSubscriptions) {
    	    	if (typeof eventHandler === 'function') {
    	            angular.element(xidSubscriptions.eventEmitter).off(eventType, eventHandler);
    	    	}

    	        if (xidSubscriptions[eventType] > 0) {
    	            xidSubscriptions[eventType]--;
    	        }
	    	} else {
	    	    if (typeof eventHandler === 'function') {
                    angular.element(this).off(eventType, eventHandler);
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
	    const appliedHandler = scopeApply.bind(null, $scope, eventHandler);
	    this.subscribe(xid, eventTypes, appliedHandler);

	    const unsubscribe = () => {
	        this.unsubscribe(xid, eventTypes, appliedHandler);
        };
        const deregister = $scope.$on('$destroy', unsubscribe);
        
        const manualUnsubscribe = () => {
            deregister();
            unsubscribe();
        };
        return manualUnsubscribe;

        function scopeApply($scope, fn) {
            const args = Array.prototype.slice.call(arguments, 2);
            const boundFn = fn.bind.apply(fn, [null].concat(args));
            $scope.$applyAsync(boundFn);
        }
	};

	EventManager.prototype.updateSubscriptions = function(xid) {
		if (!this.socket || this.socket.readyState !== READY_STATE_OPEN) return;

		const subscriptions = xid ? this.subscriptionsByXid[xid] : this.allSubscriptions;

	    const eventTypes = [];
	    for (const key in subscriptions) {
	        if (key === 'eventEmitter' || key === 'lastPayload')
	            continue;

	        if (subscriptions[key] === 0) {
	        	delete subscriptions[key];
	        } else {
	        	eventTypes.push(key);
	        }
	    }
	    eventTypes.sort();

	    const activeSubs = xid ? this.activeEventTypesByXid[xid] : this.activeAllEventTypes;

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

	        const message = {};
	        if (xid)
	            message.xid = xid;
	        message.eventTypes = eventTypes;

	        this.socket.send(JSON.stringify(message));
	    }
	};
	
	EventManager.prototype.isConnected = function() {
        return this.socket && this.socket.readyState === READY_STATE_OPEN;
	};

	function arraysEqual(a, b) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}

	return EventManager;
}

export default EventManagerFactory;
