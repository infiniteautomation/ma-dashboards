/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

restResourceFactory.$inject = ['$http', '$q', '$timeout', 'maUtil', 'maNotificationManager', 'maRqlBuilder', 'MA_TIMEOUT'];
function restResourceFactory($http, $q, $timeout, maUtil, NotificationManager, RqlBuilder, MA_TIMEOUT) {
    
    const idProperty = 'xid';
    const originalIdProperty = typeof Symbol === 'function' ? Symbol('originalId') : 'originalId';
    const notificationManagerProperty = typeof Symbol === 'function' ? Symbol('notificationManager') : '_notificationManager';

    class RestResource {
        constructor(properties) {
            Object.assign(this, angular.copy(this.constructor.defaultProperties), properties);
            
            const itemId = this[this.constructor.idProperty];
            if (itemId) {
                // item already has an ID store it in a private property so we can use it later when updating the item
                this[originalIdProperty] = itemId;
            } else {
                // new item, generate a new id for the item
                this[this.constructor.idProperty] = (this.constructor.xidPrefix || '') + maUtil.uuid();
            }
            
            this.initialize('constructor');
        }

        static get idProperty() {
            return idProperty;
        }
        
        static get timeout() {
            return MA_TIMEOUT;
        }
        
        static createNotificationManager() {
            return new NotificationManager({
                webSocketUrl: this.webSocketUrl,
                transformObject: (...args) => {
                    return new this(...args);
                }
            });
        }
        
        static get notificationManager() {
            let notificationManager = this[notificationManagerProperty];
            
            if (!notificationManager) {
                notificationManager = this.createNotificationManager();
                this[notificationManagerProperty] = notificationManager;
            }
            
            return notificationManager;
        }

        static list(opts) {
            return this.query(null, opts);
        }

        static query(queryObject, opts) {
            const params = {};
            
            if (queryObject) {
                const rqlQuery = queryObject.toString();
                if (rqlQuery) {
                    params.rqlQuery = rqlQuery;
                }
            }
            
            return this.http({
                url: this.baseUrl,
                method: 'GET',
                params: params
            }, opts).then(response => {
                const items = response.data.items.map(item => {
                    return new this(item);
                });
                items.$total = response.data.total;
                return items;
            });
        }
        
        static buildQuery() {
            const builder = new RqlBuilder();
            builder.queryFunction = (queryObj, opts) => {
                return this.query(queryObj, opts);
            };
            return builder;
        }

        static get(id, opts) {
            const item = Object.create(this.prototype);
            item[originalIdProperty] = id;
            
            return item.get(opts).then(item => {
                return new this(item);
            });
        }

        static subscribe(...args) {
            return this.notificationManager.subscribe(...args);
        }
        
        static notify(...args) {
            // we only want to notify the listeners if they dont have a connected websocket
            // otherwise they will get 2 events
            return this.notificationManager.notifyIfNotConnected(...args);
        }
        
        isNew() {
            return !this.hasOwnProperty(originalIdProperty);
        }
        
        getOriginalId() {
            return this[originalIdProperty];
        }

        get(opts = {}) {
            const originalId = this[originalIdProperty];
            return this.constructor.http({
                url: this.constructor.baseUrl + '/' + angular.$$encodeUriSegment(originalId),
                method: 'GET',
                params: opts.params
            }, opts).then(response => {
                this.itemUpdated(response.data);
                this.initialize('get');
                if (this.constructor.notifyUpdateOnGet) {
                    this.constructor.notify('update', this, originalId);
                }
                return this;
            });
        }
        
        save(opts = {}) {
            const originalId = this[originalIdProperty];
            
            let url, method;
            if (originalId) {
                url = this.constructor.baseUrl + '/' + angular.$$encodeUriSegment(originalId);
                method = 'PUT';
            } else {
                url = this.constructor.baseUrl;
                method = 'POST';
            }
            
            return this.constructor.http({
                url,
                method,
                data: this,
                params: opts.params
            }, opts).then(response => {
                const saveType = originalId ? 'update' : 'create';

                this.itemUpdated(response.data);
                this.initialize(saveType);
                this.constructor.notify(saveType, this, originalId);
                return this;
            });
        }
        
        itemUpdated(item) {
            angular.copy(item, this);
            this[originalIdProperty] = this[this.constructor.idProperty];
        }
        
        delete(opts = {}) {
            const originalId = this[originalIdProperty];
            
            return this.constructor.http({
                url: this.constructor.baseUrl + '/' + angular.$$encodeUriSegment(originalId),
                method: 'DELETE',
                params: opts.params
            }, opts).then(response => {
                this.itemUpdated(response.data);
                this.initialize('delete');
                this.constructor.notify('delete', this, originalId);
                return this;
            });
        }
        
        initialize(reason) {
        }
        
        static http(httpConfig, opts = {}) {
            if (!httpConfig.timeout) {
                const timeout = isFinite(opts.timeout) ? opts.timeout : this.timeout;
                
                if (!opts.cancel && timeout > 0) {
                    httpConfig.timeout = timeout;
                } else if (opts.cancel && timeout <= 0) {
                    httpConfig.timeout = opts.cancel;
                } else {
                    const timeoutPromise = $timeout(angular.noop, timeout, false);
                    const userCancelledPromise = opts.cancel.then(() => {
                        $timeout.cancel(timeoutPromise);
                    });
                    httpConfig.timeout = $q.race([userCancelledPromise, timeoutPromise.catch(angular.noop)]);
                }
            }
            return $http(httpConfig);
        }
        
        static defer() {
            return $q.defer();
        }
        
//        static createCancel(timeout = this.timeout) {
//            const deferred = $q.defer();
//            let timeoutPromise;
//            
//            const cancel = () => {
//                if (timeoutPromise) {
//                    $timeout.cancel(timeoutPromise);
//                }
//                deferred.resolve();
//            };
//            
//            if (timeout > 0) {
//                timeoutPromise = $timeout(cancel, timeout, false);
//            }
//            
//            cancel.promise = deferred.promise;
//            
//            return cancel;
//        }

        setEnabled(enable) {
            if (enable == null) {
                return this.enabled;
            }
            
            this.enabled = enable;
            
            if (this[originalIdProperty]) {
                this.save();
            }
        }
    }
    
    return RestResource;
}

return restResourceFactory;

}); // define
