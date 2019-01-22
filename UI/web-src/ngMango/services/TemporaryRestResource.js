/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';

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

        static get notifyUpdateOnGet() {
            return true;
        }
        
        itemUpdated(item, responseType) {
            // only update if the new resource version is newer than what we already have
            if (this.resourceVersion == null || item.resourceVersion > this.resourceVersion) {
                super.itemUpdated(item, responseType, true);
            }
        }
        
        isComplete() {
            return !(this.status === 'VIRGIN' || this.status === 'SCHEDULED' || this.status === 'RUNNING');
        }

        start($scope, opts) {
            const tmpResourceDeferred = $q.defer();
            let lastSeenVersion = -1;
            let timeoutPromise;
            let pollPeriod = this.constructor.pollPeriodOpenSocket || 10000;
            let startTimeout = () => null;
            let deregister = () => null;
            let wsCache = [];

            const gotUpdate = (item) => {
                if (item) {
                    this.itemUpdated(item);
                }
                
                if (this.resourceVersion > lastSeenVersion) {
                    lastSeenVersion = this.resourceVersion;
                    
                    if (this.isComplete()) {
                        tmpResourceDeferred.resolve(this);
                        deregister();
                        $timeout.cancel(timeoutPromise);
                    } else {
                        // cancel and restart the timer every time we get an update
                        startTimeout();
                        
                        // notify with a copy as the listener as the subscribe callback uses $applyAsync
                        // resulting in a batch of messages being processed at once, we might want to see each progress message separately
                        tmpResourceDeferred.notify(angular.copy(this));
                    }
                }
            };
            
            startTimeout = () => {
                if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                }
                timeoutPromise = $timeout(() => {
                    this.get().then(() => {
                        gotUpdate();
                    }, error => {
                        tmpResourceDeferred.reject(error);
                    });
                }, pollPeriod, false);
            };

            deregister = this.constructor.subscribe((event, item) => {
                if (item.id === this.id) {
                    gotUpdate(item);
                } else if (Array.isArray(wsCache)) {
                    // store any updates that don't match our id in a cache for use later
                    wsCache.unshift(item);
                }
            }, $scope);

            this.constructor.notificationManager.openSocket().then(null, error => {
                // set the poll period faster if the websocket cant be opened
                pollPeriod = this.constructor.pollPeriod || 1000;
            }).then(() => {
                return this.save(opts);
            }).then(item => {
                gotUpdate();
                // we tend to get updates over websocket before this save callback is triggered
                // check for newer updates from the websocket cache
                wsCache.forEach(item => gotUpdate(item));
            }, error => {
                // couldn't start the temporary resource
                tmpResourceDeferred.reject(error);
                deregister();
                $timeout.cancel(timeoutPromise);
            }).finally(() => wsCache = null);
            
            return tmpResourceDeferred.promise;
        }
        
        cancel(opts = {}) {
            const originalId = this.getOriginalId();
            
            return this.constructor.http({
                url: this.constructor.baseUrl + '/' + angular.$$encodeUriSegment(originalId),
                method: 'PUT',
                data: {
                    status: 'CANCELLED'
                },
                params: opts.params
            }, opts).then(response => {
                this.itemUpdated(response.data);
                this.initialize('update');
                this.constructor.notify('update', this, originalId);
                return this;
            });
        }
        
        static getSubscription() {
            const subscription = {
                requestType: 'SUBSCRIPTION',
                ownResourcesOnly: true,
                showResultWhenIncomplete: false,
                showResultWhenComplete: true,
                anyStatus: false,
                statuses: ['VIRGIN', 'SCHEDULED', 'RUNNING', 'TIMED_OUT', 'CANCELLED', 'SUCCESS', 'ERROR'],
                anyResourceType: false,
                resourceTypes: []
            };
            if (this.resourceType) {
                subscription.resourceTypes.push(this.resourceType);
            }
            return subscription;
        }
        
        static createNotificationManager() {
            const notificationManager = super.createNotificationManager();
            const tmpResource = this;
            notificationManager.onOpen = function() {
                return this.sendRequest(tmpResource.getSubscription());
            };
            return notificationManager;
        }
    }

    return TemporaryRestResource;
}

export default temporaryRestResourceFactory;