/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

restResourceFactory.$inject = ['$http', '$q', '$timeout', 'maUtil', 'maNotificationManager', 'maRqlBuilder', 'MA_TIMEOUT'];
function restResourceFactory($http, $q, $timeout, maUtil, NotificationManager, RqlBuilder, MA_TIMEOUT) {

    class RestResource {
        constructor(properties) {
            Object.assign(this, angular.copy(this.constructor.defaultProperties), properties);
            
            if (this.xid) {
                this.originalXid = this.xid;
            } else {
                this.xid = (this.constructor.xidPrefix || '') + maUtil.uuid();
            }
        }
        
        static get timeout() {
            return MA_TIMEOUT;
        }

        static get notificationManager() {
            if (!this._notificationManager) {
                this._notificationManager = new NotificationManager({
                    webSocketUrl: this.webSocketUrl,
                    transformObject: (...args) => {
                        return this.transformObject(...args);
                    }
                });
            }

            return this._notificationManager;
        }
        
        static list(opts) {
            return this.query(null, opts);
        }

        static query(queryObject, opts) {
            const params = {};
            
            if (queryObject) {
                let rqlQuery = queryObject.toString();
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
                    return this.transformObject(item);
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

        static get(xid, opts) {
            const item = this.transformObject({originalXid: xid}, false);
            return item.get(opts);
        }

        static subscribe(...args) {
            return this.notificationManager.subscribe(...args);
        }
        
        static notify(...args) {
            // we only want to notify the listeners if they dont have a connected websocket
            // otherwise they will get 2 events
            return this.notificationManager.notifyIfNotConnected(...args);
        }
        
        static transformObject(object, callConstructor = true) {
            if (callConstructor) {
                return new this(object);
            } else {
                const item = Object.create(this.prototype);
                return Object.assign(item, object);
            }
        }

        get(opts) {
            return this.constructor.http({
                url: this.constructor.baseUrl + '/' + angular.$$encodeUriSegment(this.originalXid),
                method: 'GET'
            }, opts).then(response => {
                angular.copy(response.data, this);
                this.originalXid = this.xid;
                return this;
            });
        }
        
        save(opts) {
            const originalXid = this.originalXid;
            
            let url, method;
            if (originalXid) {
                url = this.constructor.baseUrl + '/' + angular.$$encodeUriSegment(this.originalXid);
                method = 'PUT';
            } else {
                url = this.constructor.baseUrl;
                method = 'POST';
            }
            
            return this.constructor.http({
                url,
                method,
                data: this
            }, opts).then(response => {
                angular.copy(response.data, this);
                this.originalXid = this.xid;
                this.constructor.notify(originalXid ? 'update' : 'create', this, originalXid);
                return this;
            });
        }
        
        delete(opts) {
            const originalXid = this.originalXid;
            
            return this.constructor.http({
                url: this.constructor.baseUrl + '/' + angular.$$encodeUriSegment(this.originalXid),
                method: 'DELETE'
            }, opts).then(response => {
                angular.copy(response.data, this);
                this.constructor.notify('delete', this, originalXid);
                return this;
            });
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
            
            if (this.originalXid) {
                this.save();
            }
        }
    }
    
    return RestResource;
}

return restResourceFactory;

}); // define
