/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/* global self, workbox */

workbox.core.skipWaiting();
workbox.core.clientsClaim();

//workbox.routing.registerRoute(
//    new RegExp('/rest/v2/ui-bootstrap/(pre|post)-login$'),
//    new workbox.strategies.NetworkFirst()
//);
//
//workbox.routing.registerRoute(
//    new RegExp('/rest/v1/translations/.*'),
//    new workbox.strategies.NetworkFirst()
//);

workbox.routing.registerRoute(
    /\/modules\/[\w-]+\/web\/.*\?v=.+/,
    new workbox.strategies.CacheFirst()
);

workbox.precaching.precacheAndRoute(self.__precacheManifest, {
    directoryIndex: null,
    cleanUrls: false
});

workbox.routing.registerNavigationRoute(
    workbox.precaching.getCacheKeyForURL('/ui/index.html')
);