/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import BoundedMap from '../classes/BoundedMap';

resourceCacheFactory.$inject = ['$q', '$timeout', '$rootScope'];
function resourceCacheFactory($q, $timeout, $rootScope) {

    class LoadingValue {
        constructor(key, promise) {
            this.key = key;
            this.promise = promise;
        }
    }

    class ResourceCache extends BoundedMap {
        constructor(resourceService) {
            super(100);
            this.resourceService = resourceService;
            this.subscribers = new Set();
        }

        subscribe(subscriber) {
            if (!this.subscribers.has(subscriber)) {
                if (!this.subscribers.size) {
                    this.deregister = this.resourceService.notificationManager.subscribe((event, item, attributes) => {
                        $rootScope.$applyAsync(() => {
                            this.updateHandler(event, item, attributes);
                        });
                    });
                }
                this.subscribers.add(subscriber);
                const unsubscribe = () => this.unsubscribe(subscriber);
                if (subscriber instanceof $rootScope.constructor) {
                    subscriber.$on('$destroy', () => {
                        // adding a timeout gives other pages a chance to subscribe before the websocket is closed
                        $timeout(unsubscribe, 0);
                    });
                }
                return () => this.unsubscribe(subscriber);
            }
        }

        unsubscribe(subscriber) {
            if (this.subscribers.delete(subscriber) && !this.subscribers.size) {
                this.deregister();
                this.clear();
            }
        }

        updateHandler(event, item, attributes) {
            if (event.type === 'update') {
                const originalXid = attributes.originalXid;
                // only add to cache if it is already in there
                if (this.delete(originalXid || item.getOriginalId())) {
                    this.set(item.getOriginalId(), item);
                }
            } else if (event.type === 'delete') {
                this.delete(item.getOriginalId());
            }
        }

        get(id) {
            const result = super.get(id);
            if (!(result instanceof LoadingValue)) {
                return result;
            }
        }

        loadItems(ids) {
            const missingIds = new Set(ids.filter(x => !this.has(x)));
            if (!missingIds.size) {
                return $q.resolve();
            }

            const idsToLoad = Array.from(missingIds);
            const promise = this.resourceService.buildQuery()
                .in(this.resourceService.idProperty, idsToLoad)
                .query().then(items => {
                    items.forEach(item => this.set(item.getOriginalId(), item));
                }, () => {
                    // clear promises on error
                    idsToLoad.forEach(id => this.delete(id));
                });

            idsToLoad.forEach(id => this.set(id, new LoadingValue(id, promise)));
            return promise;
        }
    }

    return ResourceCache;
}

export default resourceCacheFactory;