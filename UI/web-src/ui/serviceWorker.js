/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import {precacheAndRoute, createHandlerBoundToURL} from 'workbox-precaching';
import {registerRoute, NavigationRoute} from 'workbox-routing';
import {NetworkFirst, CacheFirst} from 'workbox-strategies';

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
    async cacheWillUpdate({request, response}) {
        if (/\/rest\/latest\/ui-bootstrap\/pre-login/.test(request.url)) {
            const preLoginData = await response.json();
            preLoginData.user = null;
            return new Response(JSON.stringify(preLoginData), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
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
    }
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

const moduleForUrl = (u) => {
    const url = new URL(u);
    const matches = /\/modules\/([\w-]+)\/web\//.exec(url.pathname);
    const moduleName = matches && matches[1];
    if (moduleName) {
        return {
            name: moduleName,
            version: url.searchParams.get('v')
        };
    }
};

const warmUpModules = async () => {
    const modulesRequest = await fetch('/rest/latest/modules/angularjs-modules/public');
    const modules = await modulesRequest.json();

    // warm up the module-resources cache by requesting and caching the files defined in AngularJSModuleDefinitions
    const cache = await caches.open(moduleResourcesCacheName);
    return Promise.all(modules.urls.map(async url => {
        const response = await cache.match(url, {ignoreVary: true});
        if (!response) {
            return cache.add(url);
        }
    }));
};

const cleanUpModules = async () => {
    const modulesRequest = await fetch('/rest/latest/modules/angularjs-modules/public');
    const modules = await modulesRequest.json();

    const installedModules = new Map();
    for (const module of modules.modules) {
        installedModules.set(module.name, module);
    }

    // delete all cache entries for modules which are not installed or have been updated
    const cache = await caches.open(moduleResourcesCacheName);
    const keys = await cache.keys();
    return Promise.all(keys.map(k => {
        const cachedModule = moduleForUrl(k.url);
        if (cachedModule) {
            const installedModule = installedModules.get(cachedModule.name);
            if (!installedModule || installedModule.version !== cachedModule.version) {
                return cache.delete(k);
            }
        }
    }));
};

self.addEventListener('install', event => {
    event.waitUntil(warmUpModules());
});

self.addEventListener('activate', event => {
    event.waitUntil(cleanUpModules());
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
