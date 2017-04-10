/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['./services/Point',
        './services/PointHierarchy',
        './services/User',
        './services/PointEventManagerFactory',
        './services/Translate',
        './services/mangoHttpInterceptor',
        './services/JsonStore',
        './services/JsonStoreEventManagerFactory',
        './services/Util',
        './services/mangoWatchdog',
        './services/EventManager',
        './services/cssInjector',
        './services/DataSource',
        './services/DeviceName',
        './services/UserNotes',
        './services/eventsEventManagerFactory',
        './services/events',
        'angular',
        'angular-resource',
        'angular-local-storage'
], function(Point, PointHierarchy, User, PointEventManagerFactory, Translate, mangoHttpInterceptor, JsonStore,
        JsonStoreEventManagerFactory, Util, mangoWatchdog, EventManager, cssInjector, DataSourceFactory, DeviceNameFactory,
        UserNotes, eventsEventManagerFactory, events, angular) {
'use strict';
/**
 * @ngdoc overview
 * @name maServices
 *
 *
 * @description
 * The maServices module handles loading of services and providers that make API calls to the mango backend.
 *
 *
**/
var maServices = angular.module('maServices', ['ngResource', 'LocalStorageModule']);

maServices.factory('Point', Point);
maServices.factory('PointHierarchy', PointHierarchy);
maServices.factory('User', User);
maServices.factory('pointEventManager', PointEventManagerFactory);
maServices.factory('Translate', Translate);
maServices.factory('mangoHttpInterceptor', mangoHttpInterceptor);
maServices.factory('JsonStore', JsonStore);
maServices.factory('jsonStoreEventManager', JsonStoreEventManagerFactory);
maServices.factory('Util', Util);
maServices.factory('mangoWatchdog', mangoWatchdog);
maServices.factory('EventManager', EventManager);
maServices.factory('cssInjector', cssInjector);
maServices.factory('DataSource', DataSourceFactory);
maServices.factory('DeviceName', DeviceNameFactory);
maServices.factory('UserNotes', UserNotes);
maServices.factory('eventsEventManager', eventsEventManagerFactory);
maServices.factory('Events', events);

maServices.constant('mangoBaseUrl', '');
maServices.constant('mangoTimeout', 30000);
maServices.constant('mangoWatchdogTimeout', 30000);
maServices.constant('mangoReconnectDelay', 15000);
maServices.constant('mangoDefaultDateFormat', 'll LTS');

maServices.constant('mangoDateFormats', {
    dateTime: 'lll',
    shortDateTime: 'l LT',
    dateTimeSeconds: 'll LTS',
    shortDateTimeSeconds: 'l LTS',
    date: 'll',
    shortDate: 'l',
    time: 'LT',
    timeSeconds: 'LTS',
    monthDay: 'MMM D',
    month: 'MMM',
    year: 'YYYY'
});

maServices.config(['localStorageServiceProvider', function(localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('maServices')
        .setStorageCookieDomain(window.location.hostname === 'localhost' ? '' : window.location.host)
        .setNotify(false, false);
}]);

return maServices;

}); // require
