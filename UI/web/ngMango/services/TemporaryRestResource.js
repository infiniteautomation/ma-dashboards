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
        
        itemUpdated(item) {
            // only update if the new resource version is newer than what we already have
            if (this.resourceVersion == null || item.resourceVersion > this.resourceVersion) {
                super.itemUpdated(item);
            }
        }
        
        isComplete() {
            return !(this.status === 'VIRGIN' || this.status === 'SCHEDULED' || this.status === 'RUNNING');
        }

        start($scope) {
            const tmpResourceDeferred = $q.defer();
            let lastSeenVersion = -1;
            let timeoutPromise;
            let pollPeriod = this.constructor.pollPeriodOpenSocket || 10000;

            const startTimeout = () => {
                if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                }
                timeoutPromise = $timeout(() => {
                    this.get().then(() => {
                        if (!this.isComplete()) {
                            startTimeout();
                        }
                    }, error => {
                        tmpResourceDeferred.reject(error);
                    });
                }, pollPeriod, false);
            };

            const deregister = this.constructor.subscribe((event, item) => {
                if (item.id === this.id) {
                    this.itemUpdated(item);
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
                }
            }, $scope);

            this.constructor.notificationManager.openSocket().then(null, error => {
                // set the poll period faster if the websocket cant be opened
                pollPeriod = this.constructor.pollPeriod || 1000;
            }).then(() => {
                return this.save();
            }).then(item => {
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
                messageType: 'SUBSCRIPTION',
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


