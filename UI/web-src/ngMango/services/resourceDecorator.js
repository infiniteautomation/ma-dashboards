/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

resourceDecorator.$inject = ['$delegate', 'maRqlBuilder', 'maUtil', 'maNotificationManager', '$q'];
function resourceDecorator($delegate, RqlBuilder, maUtil, NotificationManager, $q) {

    const buildQuery = function() {
        const builder = new RqlBuilder();
        builder.queryFunction = (queryObj, opts) => {
            return this.query({rqlQuery: queryObj.toString()}).$promise;
        };
        return builder;
    };

    return function resourceWithBuildQuery() {
        const Resource = $delegate.apply(this, arguments);
        Resource.buildQuery = buildQuery;
        Resource.objQuery = maUtil.objQuery;
        
        Resource.notificationManager = new NotificationManager({
            webSocketUrl: Resource.webSocketUrl,
            transformObject: (...args) => {
                return new Resource(...args);
            }
        });
        
        Resource.prototype.getAndSubscribe = function($scope) {
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
        };
        
        return Resource;
    };
}

export default resourceDecorator;
