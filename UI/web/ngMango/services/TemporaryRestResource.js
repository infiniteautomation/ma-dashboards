/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

/**
 * Replaces the old maTemporaryResource service. This is used for bulk data point and tag operations. 
 */

temporaryRestResourceFactory.$inject = ['maRestResource', '$q', '$timeout'];
function temporaryRestResourceFactory(RestResource, $q, $timeout) {

    class TemporaryRestResource extends RestResource {
        static get idProperty() {
            return 'id';
        }
        
        static get webSocketUrl() {
            return '/rest/v2/websocket/temporary-resources';
        }
        
        static get pollPeriod() {
            return 1000;
        }
        
        itemUpdated(item) {
            if (this.resourceVersion == null || item.resourceVersion > this.resourceVersion) {
                super.itemUpdated(item);
            }
        }
        
        isComplete() {
            return !(this.status === 'SCHEDULED' || this.status === 'RUNNING');
        }

        start($scope) {
            const tmpResourceDeferred = $q.defer();
            let deregister = angular.noop;
            let lastSeenVersion = -1;
            let timeoutPromise;
            
            const notifyDeferred = () => {
                if (this.resourceVersion > lastSeenVersion) {
                    lastSeenVersion = this.resourceVersion;
                    
                    if (this.isComplete()) {
                        tmpResourceDeferred.resolve(this);
                        deregister();
                        $timeout.cancel(timeoutPromise);
                    } else {
                        tmpResourceDeferred.notify(this);
                    }
                }
            };
            
            const startTimeout = () => {
                timeoutPromise = $timeout(() => {
                    this.get().then(() => {
                        notifyDeferred();
                        if (!this.isComplete()) {
                            startTimeout();
                        }
                    }, error => {
                        tmpResourceDeferred.reject(error);
                    });
                }, this.constructor.pollPeriod, false);
            };
            
            this.constructor.notificationManager.openSocket().then(() => {
                deregister = this.constructor.subscribe((event, item) => {
                    if (item.id === this.id) {
                        this.itemUpdated(item);
                        notifyDeferred();
                        
                        if ($scope) {
                            $scope.$apply();
                        }
                    }
                }, null, ['SCHEDULED', 'RUNNING', 'TIMED_OUT', 'CANCELLED', 'SUCCESS', 'ERROR']);
            }, angular.noop).then(() => {
                return this.save();
            }).then(item => {
                notifyDeferred();
                if (!this.isComplete()) {
                    startTimeout();
                }
            }, error => {
                // couldn't start the temporary resource
                tmpResourceDeferred.reject(error);
                deregister();
            });
            
            return tmpResourceDeferred.promise;
        }
    }

    TemporaryRestResource.notificationManager.onOpen = function() {
        this.sendMessage({
            ownResourcesOnly: true,
            statuses: ['SCHEDULED', 'RUNNING', 'TIMED_OUT', 'CANCELLED', 'SUCCESS', 'ERROR']
        });
    };

    return TemporaryRestResource;
}

return temporaryRestResourceFactory;

}); // define
