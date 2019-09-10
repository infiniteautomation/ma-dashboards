/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/* global self, workbox, caches */

workbox.core.skipWaiting();
workbox.core.clientsClaim();

// used to delete outdated versions from a cache whenever a new version is written
// Needed as the cleanUpModules() function only runs when the UI module is updated and service worker is installed
class DeleteOutdatedVersions {
    constructor(cacheName) {
        this.cacheName = cacheName;
    }
    
    cacheKeyWillBeUsed({request, mode}) {
        if (mode === 'write') {
            return caches.open(this.cacheName).then(cache => {
                // delete all requests with matching URL from cache, ignoring the ?v= search parameter
                return cache.delete(request, {ignoreVary: true, ignoreSearch: true});
            }).then(() => request);
        }
        return Promise.resolve(request);
    }
}

const moduleResourcesCacheName = 'module-resources';

const moduleResourcesStrategy = new workbox.strategies.CacheFirst({
    cacheName: moduleResourcesCacheName,
    matchOptions: {
        ignoreVary: true
    },
    plugins: [
        new DeleteOutdatedVersions(moduleResourcesCacheName)
    ]
});

// register a route for any versioned resources under /modules/xxx/web
workbox.routing.registerRoute(/\/modules\/[\w-]+\/web\/.*\?v=.+/, moduleResourcesStrategy);

// precache files from webpack manifest
workbox.precaching.precacheAndRoute(self.__precacheManifest, {
    directoryIndex: null,
    cleanUrls: false
});

// reply to navigation requests with our index.html from the precache
workbox.routing.registerNavigationRoute(
    workbox.precaching.getCacheKeyForURL('/ui/index.html'),
    {
        whitelist: [/\/[\w-]*(\?|$)/]
    }
);

const moduleForUrl = (url) => {
    const matches = /\/modules\/([\w-]+)\/web\//.exec(url);
    return matches && matches[1];
};

const cleanUpModules = () => {
    fetch('/rest/v1/modules/angularjs-modules/public').then(r => r.json()).then(modules => {
        return caches.open(moduleResourcesCacheName).then(cache => {
            const updatedModulesPromise = Promise.all(modules.urls.map(url => {
                return cache.match(url).then(response => {
                    if (!response) {
                        return moduleForUrl(url);
                    }
                });
            }));
            return Promise.all([cache, cache.keys(), updatedModulesPromise]);
        }).then(([cache, keys, updated]) => {
            const moduleNames = new Set(modules.modules.map(m => m.name));
            const updatedModules = new Set(updated.filter(m => !!m));

            const deletePromises = keys.map(k => {
                const moduleName = moduleForUrl(k.url);
                if (moduleName) {
                    // remove all entries for modules which have been updated or deleted
                    if (!moduleNames.has(moduleName) || updatedModules.has(moduleName)) {
                        return cache.delete(k);
                    }
                }
            }).filter(p => !!p);

            return Promise.all(deletePromises);
        }).then(() => {
            // warm up the module-resources cache by requesting and caching the files defined in AngularJSModuleDefinitions
            const requests = modules.urls.map(url => {
                return moduleResourcesStrategy.makeRequest({
                    request: url
                });
            });
            return Promise.all(requests);
        });
    });
};

self.addEventListener('install', event => {
    event.waitUntil(cleanUpModules());
});