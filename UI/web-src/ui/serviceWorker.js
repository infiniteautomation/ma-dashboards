/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import {precacheAndRoute, createHandlerBoundToURL} from 'workbox-precaching';
import {registerRoute, NavigationRoute} from 'workbox-routing';
import {NetworkFirst, CacheFirst} from 'workbox-strategies';

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
    fetchDidSucceed({response}) {
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
    cacheWillUpdate({request, response}) {
        if (/\/rest\/latest\/ui-bootstrap\/pre-login/.test(request.url)) {
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

const moduleResourcesStrategy = new CacheFirst({
    cacheName: moduleResourcesCacheName,
    matchOptions: {
        ignoreVary: true
    },
    plugins: [
        new DeleteOutdatedVersionsPlugin(moduleResourcesCacheName)
    ]
});

// register a route for any versioned resources under /modules/xxx/web
registerRoute(/\/modules\/[\w-]+\/web\/.*\?v=.+/, moduleResourcesStrategy);

registerRoute(/\/rest\/latest\/ui-bootstrap\//, new NetworkFirst({
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
precacheAndRoute(self.__WB_MANIFEST, {
    directoryIndex: null,
    cleanUrls: false
});

// reply to navigation requests with our index.html from the precache
registerRoute(new NavigationRoute(
    createHandlerBoundToURL('/ui/index.html'),
    {
        allowlist: [/\/[\w-]*(\?|$)/]
    }
));

const moduleForUrl = (url) => {
    const matches = /\/modules\/([\w-]+)\/web\//.exec(url);
    return matches && matches[1];
};

// TODO dont delete all caches before activated
const cleanUpModules = (event) => {
    fetch('/rest/latest/modules/angularjs-modules/public').then(r => r.json()).then(modules => {
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
                // returns two promises, first resolves when request is done, second resolves when handler is done
                // i.e. the response was successfully cached
                return moduleResourcesStrategy.handleAll({
                    request: new Request(url),
                    event
                })[1];
            });
            return Promise.all(requests);
        });
    });
};

self.addEventListener('install', event => {
    event.waitUntil(cleanUpModules(event));
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
