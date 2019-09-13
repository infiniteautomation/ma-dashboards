/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/* global self, workbox, caches, Response */

workbox.core.skipWaiting();
workbox.core.clientsClaim();

/**
 * Used to delete out-dated versions of resources from the cache whenever a new version is written.
 * The cleanUpModules() function will only run when the service worker is installed, and this will not occur unless
 * the UI module has been updated. We still want to clean up the cache if we get a new version of a resource belonging to any other Mango module.
 */
class DeleteOutdatedVersionsPlugin {
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

/**
 * Throws an error when the response is not a 2xx status code, causes NetworkFirst strategy to fall back to cache.
 */
class ThrowOnErrorPlugin {
    fetchDidSucceed({request, response}) {
        if (response.ok) {
            return response;
        }
        throw new Error(`${response.status} ${response.statusText}`);
    }
}

/**
 * Removes the user from the pre-login response before caching.
 */
class DontCacheUserPlugin {
    cacheWillUpdate({request, response, event}) {
        if (/\/rest\/v2\/ui-bootstrap\/pre-login/.test(request.url)) {
            return response.json().then(preLoginData => {
                preLoginData.user = null;
                return new Response(JSON.stringify(preLoginData), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
            });
        }
        return response;
    }
}

const moduleResourcesCacheName = 'module-resources';
const uiBootstrapCacheName = 'ui-bootstrap';

const moduleResourcesStrategy = new workbox.strategies.CacheFirst({
    cacheName: moduleResourcesCacheName,
    matchOptions: {
        ignoreVary: true
    },
    plugins: [
        new DeleteOutdatedVersionsPlugin(moduleResourcesCacheName)
    ]
});

// register a route for any versioned resources under /modules/xxx/web
workbox.routing.registerRoute(/\/modules\/[\w-]+\/web\/.*\?v=.+/, moduleResourcesStrategy);

workbox.routing.registerRoute(/\/rest\/v2\/ui-bootstrap\//, new workbox.strategies.NetworkFirst({
    cacheName: uiBootstrapCacheName,
    matchOptions: {
        ignoreVary: true
    },
    networkTimeoutSeconds: 5,
    plugins: [
        new ThrowOnErrorPlugin(),
        new DontCacheUserPlugin()
    ]
}));

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