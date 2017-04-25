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
        './services/WatchList',
        './services/WatchListEventManager',
        './services/rqlParamSerializer',
        './services/UserNotes',
        './services/eventsEventManagerFactory',
        './services/events',
        './services/DynamicItems',
        './services/pointValuesFactory',
        './services/statisticsFactory',
        './services/qDecorator',
        './services/UserEventManager',
        './services/Modules',
        './services/Permissions',
        './services/SystemSettings',
        './services/ImportExport',
        './services/GoogleAnalytics',
        'angular',
        'angular-resource',
        'angular-local-storage'
], function(Point, PointHierarchy, UserProvider, PointEventManagerFactory, Translate, mangoHttpInterceptor, JsonStore,
        JsonStoreEventManagerFactory, Util, mangoWatchdog, EventManager, cssInjector, DataSourceFactory, DeviceNameFactory,
        WatchListFactory, WatchListEventManagerFactory, rqlParamSerializer, UserNotes, eventsEventManagerFactory, events,
        DynamicItems, pointValuesFactory, statisticsFactory, qDecorator, UserEventManager, ModulesFactory, PermissionsFactory, SystemSettingsProvider,
        ImportExportFactory, GoogleAnalyticsFactory, angular) {
'use strict';
/**
 * @ngdoc overview
 * @name ngMangoServices
 *
 *
 * @description
 * The ngMangoServices module handles loading of services and providers that make API calls to the mango backend.
 *
 *
**/
var ngMangoServices = angular.module('ngMangoServices', ['ngResource', 'LocalStorageModule']);

ngMangoServices.factory('Point', Point);
ngMangoServices.factory('PointHierarchy', PointHierarchy);
ngMangoServices.provider('User', UserProvider);
ngMangoServices.factory('pointEventManager', PointEventManagerFactory);
ngMangoServices.factory('Translate', Translate);
ngMangoServices.factory('mangoHttpInterceptor', mangoHttpInterceptor);
ngMangoServices.factory('JsonStore', JsonStore);
ngMangoServices.factory('jsonStoreEventManager', JsonStoreEventManagerFactory);
ngMangoServices.factory('Util', Util);
ngMangoServices.factory('mangoWatchdog', mangoWatchdog);
ngMangoServices.factory('EventManager', EventManager);
ngMangoServices.factory('cssInjector', cssInjector);
ngMangoServices.factory('DataSource', DataSourceFactory);
ngMangoServices.factory('DeviceName', DeviceNameFactory);
ngMangoServices.factory('WatchList', WatchListFactory);
ngMangoServices.factory('WatchListEventManager', WatchListEventManagerFactory);
ngMangoServices.factory('rqlParamSerializer', rqlParamSerializer);
ngMangoServices.factory('UserNotes', UserNotes);
ngMangoServices.factory('eventsEventManager', eventsEventManagerFactory);
ngMangoServices.factory('Events', events);
ngMangoServices.factory('DynamicItems', DynamicItems);
ngMangoServices.factory('pointValues', pointValuesFactory);
ngMangoServices.factory('statistics', statisticsFactory);
ngMangoServices.factory('UserEventManager', UserEventManager);
ngMangoServices.factory('Modules', ModulesFactory);
ngMangoServices.factory('Permissions', PermissionsFactory);
ngMangoServices.provider('SystemSettings', SystemSettingsProvider);
ngMangoServices.factory('ImportExport', ImportExportFactory);
ngMangoServices.factory('GoogleAnalytics', GoogleAnalyticsFactory);

ngMangoServices.constant('MA_GOOGLE_ANALYTICS_PROPERTY_ID', '');

ngMangoServices.constant('mangoBaseUrl', '');
ngMangoServices.constant('mangoTimeout', 30000);
ngMangoServices.constant('mangoWatchdogTimeout', 10000);
ngMangoServices.constant('mangoReconnectDelay', 5000);

ngMangoServices.constant('mangoDateFormats', {
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
    year: 'YYYY',
    iso: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
});

ngMangoServices.config(['localStorageServiceProvider', '$httpProvider', '$provide', function(localStorageServiceProvider, $httpProvider, $provide) {
    localStorageServiceProvider
        .setPrefix('ngMangoServices')
        .setStorageCookieDomain(window.location.hostname === 'localhost' ? '' : window.location.host)
        .setNotify(false, false);
    
    $httpProvider.defaults.paramSerializer = 'rqlParamSerializer';
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $httpProvider.interceptors.push('mangoHttpInterceptor');

    $provide.decorator('$q', qDecorator);
}]);

return ngMangoServices;

}); // require
