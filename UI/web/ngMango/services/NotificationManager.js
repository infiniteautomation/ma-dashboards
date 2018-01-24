/**
 * Copyright (C) 2017 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

NotificationManagerFactory.$inject = ['MA_BASE_URL', '$rootScope', 'MA_TIMEOUT', '$q', '$timeout'];
function NotificationManagerFactory(MA_BASE_URL, $rootScope, MA_TIMEOUT, $q, $timeout) {

	//const READY_STATE_CONNECTING = 0;
	const READY_STATE_OPEN = 1;
	//const READY_STATE_CLOSING = 2;
	//const READY_STATE_CLOSED = 3;
	
	const actionNameToEventType = {
        add: 'create',
        update: 'update',
        'delete': 'delete'
	};

    class NotificationManager {
        constructor(options) {
            angular.extend(this, options);
            
            this.listeners = 0;
            this.eventScope = $rootScope.$new(true);
            this.eventScope.notificationManager = this;
            this.pendingRequests = {};
            this.sequenceNumber = 0;

            $rootScope.$on('maWatchdog', (event, current, previous) => {
                if (current.status === 'LOGGED_IN' && this.listeners > 0) {
                    this.openSocket().catch(angular.noop);
                } else {
                    this.closeSocket();
                }
            });
        }

        openSocket() {
            // socket already open
            if (this.socketDeferred) {
                return this.socketDeferred.promise;
            }
            if (!('WebSocket' in window)) {
                return $q.reject('WebSocket not supported in this browser');
            }
            if (!this.webSocketUrl) {
                return $q.reject('No websocket URL');
            }
            
            const socketDeferred = this.socketDeferred = $q.defer();

            let host = document.location.host;
            let protocol = document.location.protocol;

            if (MA_BASE_URL) {
                const i = MA_BASE_URL.indexOf('//');
                if (i >= 0) {
                    protocol = MA_BASE_URL.substring(0, i);
                    host = MA_BASE_URL.substring(i+2);
                } else {
                    host = MA_BASE_URL;
                }
            }

            protocol = protocol === 'https:' ? 'wss:' : 'ws:';

            const socket = this.socket = new WebSocket(protocol + '//' + host + this.webSocketUrl);

            this.connectTimer = $timeout(() => {
                socketDeferred.reject('Timeout opening socket');
                this.closeSocket();
            }, MA_TIMEOUT);
            
            socket.onclose = () => {
                socketDeferred.reject('Socket closed');
                this.closeSocket();
            };
            
            socket.onerror = () => {
                socketDeferred.reject('Socket error');
                this.closeSocket();
            };

            socket.onopen = () => {
                $timeout.cancel(this.connectTimer);
                delete this.connectTimer;
                
                this.pendingRequests = {};
                this.sequenceNumber = 0;
                
                $q.resolve(this.onOpen()).then(() => {
                    this.notify('webSocketOpen', this);
                    socketDeferred.resolve(this.socket);
                }).then(null, error => {
                    this.closeSocket();
                });
            };
            
            socket.onmessage = (event) => {
                try {
                    const message = angular.fromJson(event.data);
                    
                    if (message.status === 'ERROR') {
                        const error = new Error('Web socket status ERROR');
                        error.message = message;
                        throw error;
                    } else if (message.status === 'OK') {
                        const payload = message.payload;
                        this.notify('webSocketMessage', payload, this);
                        this.notifyFromPayload(payload);
                    } else if (typeof message.messageType === 'string') {
                        this.messageReceived(message);
                    }
                } catch (e) {
                    this.notify('webSocketError', e, this);
                }
            };

            return socketDeferred.promise;
        }

        onOpen() {
            // do nothing
        }
        
        /**
         * Processes the websocket payload and calls notify() with the appropriate event type.
         * Default notifier for CRUD type websocket payloads, they have a action and object property.
         */
        notifyFromPayload(payload) {
            if (typeof payload.action === 'string' && payload.object != null) {
                const eventType = actionNameToEventType[payload.action] || payload.action;
                if (eventType) {
                    const item = this.transformObject(payload.object);
                    this.notify(eventType, item, this);
                }
            }
        }
        
        /**
         * Processes a V2 websocket message and calls notify()
         */
        messageReceived(message) {
            if (message.messageType === 'RESPONSE') {
                if (isFinite(message.sequenceNumber)) {
                    const request = this.pendingRequests[message.sequenceNumber];
                    if (request != null) {
                        request.deferred.resolve(message.payload);
                        $timeout.cancel(request.timeoutPromise);
                    }
                    delete this.pendingRequests[message.sequenceNumber];
                }
            } else if (message.messageType === 'NOTIFICATION') {
                this.notify(message.notificationType, message.payload, this);
            }
        }

        closeSocket() {
            if (this.socketDeferred) {
                this.socketDeferred.reject('Socket closed');
                delete this.socketDeferred;
            }
            if (this.connectTimer) {
                $timeout.cancel(this.connectTimer);
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
            
            Object.keys(this.pendingRequests).forEach(request => {
                request.deferred.reject('Socket closed');
                $timeout.cancel(request.timeoutPromise);
            });
            this.pendingRequests = {};
            this.sequenceNumber = 0;
        }
        
        socketConnected() {
            return this.socket && this.socket.readyState === READY_STATE_OPEN;
        }

        sendMessage(message) {
            if (this.socketConnected()) {
                this.socket.send(angular.toJson(message));
            }
        }
        
        sendRequest(message, timeout = MA_TIMEOUT) {
            if (this.socketConnected()) {
                const deferred = $q.defer();
                const timeoutPromise = $timeout(() => {
                    deferred.reject('Timeout');
                }, timeout);
                const sequenceNumber = this.sequenceNumber++;
                
                message.sequenceNumber = sequenceNumber;
                this.pendingRequests[sequenceNumber] = {
                    deferred,
                    timeoutPromise
                };
                
                this.socket.send(angular.toJson(message));
                return deferred.promise;
            } else {
                return $q.reject('Socket is not open');
            }
        }

        subscribe(handler, $scope, eventTypes = ['create', 'update', 'delete']) {
            if (this.listeners === 0) {
                this.openSocket().catch(angular.noop);
            }
            this.listeners++;

            const applyThenHandle = (...args) => {
                if ($scope) {
                    $scope.$applyAsync(() => {
                        handler(...args);
                    });
                } else {
                    handler(...args);
                }
            };

            const eventDeregisters = [];
            eventTypes.forEach((eventType) => {
                const eventDeregister = this.eventScope.$on(eventType, applyThenHandle);
                eventDeregisters.push(eventDeregister);
            });
            
            let deregistered = false;

            const deregisterEvents = () => {
                if (!deregistered) {
                    eventDeregisters.forEach(eventDeregister => eventDeregister());

                    deregistered = true;
                    this.listeners--;
                    if (this.listeners === 0) {
                        this.closeSocket();
                    }
                }
            };
            
            const deregisterDestroy = $scope && $scope.$on('$destroy', deregisterEvents);
            
            const manualDeregister = () => {
                if (deregisterDestroy) {
                    deregisterDestroy();
                }
                deregisterEvents();
            };
            
            return manualDeregister;
        }
        
        /**
         * Notifies the event listeners of an event
         */
        notify(type, ...args) {
            this.eventScope.$broadcast(type, ...args);
        }
        
        /**
         * Notifies the event listeners only if the websocket is not connected. This is so the listener is not notified twice of the same change.
         */
        notifyIfNotConnected(type, ...args) {
            if (['create', 'update', 'delete'].indexOf(type) < 0 || !this.socket || this.socket.readyState !== READY_STATE_OPEN) {
                this.notify(type, ...args);
            }
        }
        
        transformObject(obj) {
            return obj;
        }
    }
	
	return NotificationManager;
}

return NotificationManagerFactory;

}); // define
