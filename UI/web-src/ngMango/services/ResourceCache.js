/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
                        $timeout(unsubscribe, 5000);
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
            if (event.name === 'update') {
                const originalXid = attributes.originalXid;
                // only add to cache if it is already in there
                if (this.delete(originalXid || item.getOriginalId())) {
                    this.set(item.getOriginalId(), item);
                }
            } else if (event.name === 'delete') {
                this.delete(item.getOriginalId());
            }
        }

        get(id) {
            const result = super.get(id);
            if (!(result instanceof LoadingValue)) {
                return result;
            }
        }

        has(id) {
            return super.has(id) && !(this.get(id) instanceof LoadingValue);
        }

        loadItems(ids) {
            const promises = new Set();

            const missingIds = new Set(ids.filter(id => {
                if (super.has(id)) {
                    const value = super.get(id);
                    if (value instanceof LoadingValue) {
                        promises.add(value.promise);
                    }
                    return false;
                }
                return true;
            }));

            if (missingIds.size) {
                const idsToLoad = Array.from(missingIds);
                const promise = this.resourceService.buildQuery()
                    .in(this.resourceService.idProperty, idsToLoad)
                    .query().then(items => {
                        const loaded = new Map(items.map(item => [item.getOriginalId(), item]));
                        idsToLoad.forEach(id => {
                            const item = loaded.get(id);
                            if (item) {
                                this.set(id, item);
                            } else {
                                // item must not exist, remove promise
                                this.delete(id);
                            }
                        });
                    }, () => {
                        // clear promises on error
                        idsToLoad.forEach(id => this.delete(id));
                    });

                idsToLoad.forEach(id => this.set(id, new LoadingValue(id, promise)));
                promises.add(promise);
            }

            return $q.all(Array.from(promises));
        }
    }

    return ResourceCache;
}

export default resourceCacheFactory;