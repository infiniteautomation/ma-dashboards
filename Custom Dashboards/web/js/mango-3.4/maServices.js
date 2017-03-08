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
        'angular',
        'angular-resource',
        'angular-local-storage'
], function(Point, PointHierarchy, UserProvider, PointEventManagerFactory, Translate, mangoHttpInterceptor, JsonStore,
        JsonStoreEventManagerFactory, Util, mangoWatchdog, EventManager, cssInjector, DataSourceFactory, DeviceNameFactory,
        WatchListFactory, WatchListEventManagerFactory, rqlParamSerializer, UserNotes, eventsEventManagerFactory, events,
        DynamicItems, pointValuesFactory, statisticsFactory, qDecorator, UserEventManager, ModulesFactory, PermissionsFactory, SystemSettingsProvider, ImportExportFactory, angular) {
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
maServices.provider('User', UserProvider);
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
maServices.factory('WatchList', WatchListFactory);
maServices.factory('WatchListEventManager', WatchListEventManagerFactory);
maServices.factory('rqlParamSerializer', rqlParamSerializer);
maServices.factory('UserNotes', UserNotes);
maServices.factory('eventsEventManager', eventsEventManagerFactory);
maServices.factory('Events', events);
maServices.factory('DynamicItems', DynamicItems);
maServices.factory('pointValues', pointValuesFactory);
maServices.factory('statistics', statisticsFactory);
maServices.factory('UserEventManager', UserEventManager);
maServices.factory('Modules', ModulesFactory);
maServices.factory('Permissions', PermissionsFactory);
maServices.provider('SystemSettings', SystemSettingsProvider);
maServices.factory('ImportExport', ImportExportFactory);

maServices.constant('mangoBaseUrl', '');
maServices.constant('mangoTimeout', 30000);
maServices.constant('mangoWatchdogTimeout', 10000);
maServices.constant('mangoReconnectDelay', 5000);

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

maServices.config(['localStorageServiceProvider', '$httpProvider', '$provide', function(localStorageServiceProvider, $httpProvider, $provide) {
    localStorageServiceProvider
        .setPrefix('maServices')
        .setStorageCookieDomain(window.location.hostname === 'localhost' ? '' : window.location.host)
        .setNotify(false, false);
    
    $httpProvider.defaults.paramSerializer = 'rqlParamSerializer';

    $provide.decorator('$q', qDecorator);
}]);

return maServices;

}); // require
