/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';

resourceDecorator.$inject = ['$delegate', 'maRqlBuilder', 'maUtil', 'maNotificationManager', '$q'];
function resourceDecorator($delegate, RqlBuilder, maUtil, NotificationManager, $q) {

    return function resourceWithBuildQuery(url, paramDefaults, actions, options = {}) {
        const defaultProperties = options.defaultProperties || {};
        const idProperty = options.idProperty || 'xid';
        const xidPrefix = options.xidPrefix || '';
        const autoXid = options.autoXid == null || options.autoXid;
        
        if (!actions.update) {
            actions.update = {
                method: 'PUT'
            };
        }
        if (!actions.get) {
            actions.get = {
                method: 'GET'
            };
        }
        
        Object.keys(actions).forEach(key => {
            const action = actions[key];
            if (!action.interceptor) {
                action.interceptor = {};
            }
            if (!action.interceptor.response) {
                // interceptor to copy the xid to the originalId property
                action.interceptor.response = function(response) {
                    const resource = response.resource;
                    const originalId = resource[idProperty];
                    if (originalId) {
                        resource.originalId = originalId;
                    }
                    return resource;
                };
            }
        });
        
        const Resource = $delegate.apply(this, arguments);

        function ExtendedResource(value = defaultProperties) {
            Resource.call(this, value);
            
            if (autoXid && !this[idProperty]) {
                this[idProperty] = xidPrefix + maUtil.uuid();
            }
        }

        Object.assign(ExtendedResource, Resource, {
            idProperty,
            objQuery: maUtil.objQuery,

            buildQuery() {
                const builder = new RqlBuilder();
                builder.queryFunction = (queryObj, opts) => {
                    return this.query({rqlQuery: queryObj.toString()}).$promise;
                };
                return builder;
            },

            notificationManager: new NotificationManager({
                transformObject: (item) => {
                    const resource = Object.assign(Object.create(ExtendedResource.prototype), item);
                    const originalId = resource[idProperty];
                    if (originalId) {
                        resource.originalId = originalId;
                    }
                    return resource;
                }
            })
        });

        ExtendedResource.prototype = Object.assign(Resource.prototype, {
            constructor: ExtendedResource,
            
            isNew() {
                return !this.originalId;
            },

            get(...args) {
                return this.$get(...args);
            },
            
            save(...args) {
                if (this.isNew()) {
                    return this.$save(...args);
                } else {
                    return this.$update(...args);
                }
            },
            
            delete(...args) {
                return this.$delete(...args);
            },
            
            getAndSubscribe($scope) {
                return this.$get().catch(error => {
                    if (error.status === 404) {
                        return this;
                    }
                    return $q.reject(error);
                }).then(item => {
                    this.constructor.notificationManager.subscribeToXids([item.xid], (event, updatedItem) => {
                        Object.assign(item, updatedItem);
                    }, $scope);
                    
                    return item;
                });
            },
            
            copy() {
                return angular.copy(this);
            }
        });

        return ExtendedResource;
    };
}

export default resourceDecorator;