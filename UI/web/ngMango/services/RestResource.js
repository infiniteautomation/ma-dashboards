/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

restResourceFactory.$inject = ['$http', 'maUtil', 'maNotificationManager'];
function restResourceFactory($http, maUtil, NotificationManager) {

    class RestResource {
        constructor(properties) {
            Object.assign(this, angular.copy(this.constructor.defaultProperties), properties);
            
            if (this.xid) {
                this.originalXid = this.xid;
            } else {
                this.xid = (this.constructor.xidPrefix || '') + maUtil.uuid();
            }
        }

        static get notificationManager() {
            if (!this._notificationManager) {
                this._notificationManager = new NotificationManager({
                    webSocketUrl: this.webSocketUrl,
                    itemPrototype: this
                });
            }

            return this._notificationManager;
        }

        static list() {
            return $http({
                url: this.baseUrl,
                method: 'GET'
            }).then(response => {
                const items = response.data.items.map(item => {
                    return new this(item);
                });
                items.$total = response.data.total;
                return items;
            });
        }

        static get(xid) {
            const item = Object.create(this.prototype);
            item.originalXid = xid;
            return item.get();
        }

        static subscribe(...args) {
            return this.notificationManager.subscribe(...args);
        }
        
        static notify(...args) {
            // we only want to notify the listeners if they dont have a connected websocket
            // otherwise they will get 2 events
            return this.notificationManager.notifyIfNotConnected(...args);
        }

        get() {
            return $http({
                url: this.constructor.baseUrl + '/' + angular.$$encodeUriSegment(this.originalXid),
                method: 'GET'
            }).then(response => {
                angular.copy(response.data, this);
                this.originalXid = this.xid;
                return this;
            });
        }
        
        save() {
            const originalXid = this.originalXid;
            
            let url, method;
            if (originalXid) {
                url = this.constructor.baseUrl + '/' + angular.$$encodeUriSegment(this.originalXid);
                method = 'PUT';
            } else {
                url = this.constructor.baseUrl;
                method = 'POST';
            }
            
            return $http({
                url,
                method,
                data: this
            }).then(response => {
                angular.copy(response.data, this);
                this.originalXid = this.xid;
                this.constructor.notify(originalXid ? 'update' : 'create', this, originalXid);
                return this;
            });
        }
        
        delete() {
            const originalXid = this.originalXid;
            
            return $http({
                url: this.constructor.baseUrl + '/' + angular.$$encodeUriSegment(this.originalXid),
                method: 'DELETE'
            }).then(response => {
                angular.copy(response.data, this);
                this.constructor.notify('delete', this, originalXid);
                return this;
            });
        }

        setEnabled(enable) {
            if (enable == null) {
                return this.enabled;
            }
            
            this.enabled = enable;
            
            if (this.originalXid) {
                this.save();
            }
        }
    }
    
    return RestResource;
}

return restResourceFactory;

}); // define
