/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/* global self, workbox, caches */

workbox.core.skipWaiting();
workbox.core.clientsClaim();

// used to delete outdated versions from a cache whenever a new version is written
// still need to add a limit to expire files which are no longer used
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
        return request;
    }
}

const moduleResourcesCacheName = 'module-resources';

// Mango sends a Vary: User-Agent header, need to ignore it for caching our resources
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
    workbox.precaching.getCacheKeyForURL('/ui/index.html')
);

self.addEventListener('install', event => {
    // warm up the module-resources cache by requesting and caching the files defined in AngularJSModuleDefinitions
    const done = fetch('/rest/v1/modules/angularjs-modules/public').then(r => r.json()).then(modules => {
        const requests = modules.urls.map(url => {
            return moduleResourcesStrategy.makeRequest({
                request: url
            });
        });
        return Promise.all(requests);
    });
    event.waitUntil(done);
});