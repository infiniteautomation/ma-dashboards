/**
 * Copyright (C) 2017 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

NotificationManagerFactory.$inject = ['MA_BASE_URL', '$rootScope', 'MA_TIMEOUT'];
function NotificationManagerFactory(MA_BASE_URL, $rootScope, MA_TIMEOUT) {

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

            $rootScope.$on('maWatchdog', (event, current, previous) => {
                if (current.status === 'LOGGED_IN' && this.listeners > 0) {
                    this.openSocket();
                } else {
                    this.closeSocket();
                }
            });
        }

        openSocket() {
            if (this.socket || !this.webSocketUrl) {
                return;
            }

            if (!('WebSocket' in window)) {
                throw new Error('WebSocket not supported');
            }

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

            const closeSocket = () => this.closeSocket();
            
            this.connectTimer = setTimeout(closeSocket, MA_TIMEOUT);
            socket.onclose = closeSocket;
            socket.onerror = closeSocket;

            socket.onopen = () => {
                clearTimeout(this.connectTimer);
                delete this.connectTimer;
                this.onOpen();
                this.notify('webSocketOpen');
            };
            
            socket.onmessage = (event) => {
                try {
                    const message = angular.fromJson(event.data);
                    if (message.status !== 'OK') {
                        const error = new Error('Web socket status != OK');
                        error.message = message;
                        throw error;
                    }
                    const payload = message.payload;
                    this.notify('webSocketMessage', payload);
                    this.notifyFromPayload(payload);
                } catch (e) {
                    this.notify('webSocketError', e);
                }
            };

            return socket;
        }
        
        onOpen() {
            // do nothing
        }
        
        /**
         * default notifier for CRUD type websocket payloads, they have a action and object property
         */
        notifyFromPayload(payload) {
            if (payload.object) {
                const eventType = actionNameToEventType[payload.action] || payload.action;
                if (eventType) {
                    const item = this.transformObject(payload.object);
                    this.notify(eventType, item);
                }
            }
        }

        closeSocket() {
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
        }
        
        socketConnected() {
            return this.socket && this.socket.readyState === READY_STATE_OPEN;
        }

        sendMessage(message) {
            if (this.socketConnected()) {
                this.socket.send(angular.toJson(message));
            }
        }

        subscribe(handler, $scope, eventTypes = ['create', 'update', 'delete']) {
            if (this.listeners === 0) {
                this.openSocket();
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
