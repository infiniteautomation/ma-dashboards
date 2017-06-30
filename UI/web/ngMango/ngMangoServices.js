/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['./services/Point',
        './services/PointHierarchy',
        './services/User',
        './services/PointEventManagerFactory',
        './services/Translate',
        './services/httpInterceptor',
        './services/JsonStore',
        './services/JsonStoreEventManagerFactory',
        './services/Util',
        './services/watchdog',
        './services/EventManager',
        './services/WebSocketManager',
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
        './services/ModulesWebSocket',
        './services/Permissions',
        './services/systemSettings',
        './services/ImportExport',
        './services/analytics',
        './services/requireQ',
        './services/locales',
        './services/fileStore',
        './services/systemActions',
        './services/server',
        './filters/dateFilter',
        './filters/trFilter',
        'angular',
        'require',
        'angular-resource',
        'angular-sanitize',
        'angular-local-storage'
], function(Point, PointHierarchy, UserProvider, PointEventManagerFactory, Translate, httpInterceptor, JsonStore,
        JsonStoreEventManagerFactory, Util, watchdog, EventManager, WebSocketManager, cssInjector, DataSourceFactory, DeviceNameFactory,
        WatchListFactory, WatchListEventManagerFactory, rqlParamSerializer, UserNotes, eventsEventManagerFactory, events,
        DynamicItems, pointValuesFactory, statisticsFactory, qDecorator, UserEventManager, ModulesFactory, ModulesWebSocketFactory,
        PermissionsFactory, systemSettingsProvider,
        ImportExportFactory, webAnalyticsFactory, requireQProvider, localesFactory, fileStoreFactory, systemActionsFactory, serverFactory,
        dateFilterFactory, trFilterFactory, angular, require) {
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
var ngMangoServices = angular.module('ngMangoServices', ['ngResource', 'ngSanitize', 'LocalStorageModule']);

ngMangoServices.factory('maPoint', Point);
ngMangoServices.factory('maPointHierarchy', PointHierarchy);
ngMangoServices.provider('maUser', UserProvider);
ngMangoServices.factory('maPointEventManager', PointEventManagerFactory);
ngMangoServices.factory('maTranslate', Translate);
ngMangoServices.factory('maHttpInterceptor', httpInterceptor);
ngMangoServices.factory('maJsonStore', JsonStore);
ngMangoServices.factory('maJsonStoreEventManager', JsonStoreEventManagerFactory);
ngMangoServices.factory('maUtil', Util);
ngMangoServices.factory('maWatchdog', watchdog);
ngMangoServices.factory('maEventManager', EventManager);
ngMangoServices.factory('maWebSocketManager', WebSocketManager);
ngMangoServices.factory('maCssInjector', cssInjector);
ngMangoServices.factory('maDataSource', DataSourceFactory);
ngMangoServices.factory('maDeviceName', DeviceNameFactory);
ngMangoServices.factory('maWatchList', WatchListFactory);
ngMangoServices.factory('maWatchListEventManager', WatchListEventManagerFactory);
ngMangoServices.factory('maRqlParamSerializer', rqlParamSerializer);
ngMangoServices.factory('maUserNotes', UserNotes);
ngMangoServices.factory('maEventsEventManager', eventsEventManagerFactory);
ngMangoServices.factory('maEvents', events);
ngMangoServices.factory('maDynamicItems', DynamicItems);
ngMangoServices.factory('maPointValues', pointValuesFactory);
ngMangoServices.factory('maStatistics', statisticsFactory);
ngMangoServices.factory('maUserEventManager', UserEventManager);
ngMangoServices.factory('maModules', ModulesFactory);
ngMangoServices.factory('maModulesWebSocket', ModulesWebSocketFactory);
ngMangoServices.factory('maPermissions', PermissionsFactory);
ngMangoServices.provider('maSystemSettings', systemSettingsProvider);
ngMangoServices.factory('maImportExport', ImportExportFactory);
ngMangoServices.factory('maWebAnalytics', webAnalyticsFactory);
ngMangoServices.provider('maRequireQ', requireQProvider);
ngMangoServices.factory('maLocales', localesFactory);
ngMangoServices.factory('maFileStore', fileStoreFactory);
ngMangoServices.factory('maSystemActions', systemActionsFactory);
ngMangoServices.factory('maServer', serverFactory);
ngMangoServices.filter('maDate', dateFilterFactory);
ngMangoServices.filter('maTr', trFilterFactory);

ngMangoServices.constant('MA_GOOGLE_ANALYTICS_PROPERTY_ID', '');

ngMangoServices.constant('MA_BASE_URL', '');
ngMangoServices.constant('MA_TIMEOUT', 30000);
ngMangoServices.constant('MA_WATCHDOG_TIMEOUT', 10000);
ngMangoServices.constant('MA_RECONNECT_DELAY', 5000);
ngMangoServices.constant('MA_POINT_VALUES_CONFIG', {limit: 5000});

ngMangoServices.constant('MA_DATE_FORMATS', {
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

ngMangoServices.config(['localStorageServiceProvider', '$httpProvider', '$provide',
        function(localStorageServiceProvider, $httpProvider, $provide, maRequireQProvider) {
    localStorageServiceProvider
        .setPrefix('ngMangoServices')
        .setStorageCookieDomain(window.location.hostname === 'localhost' ? '' : window.location.host)
        .setNotify(false, false);
    
    $httpProvider.defaults.paramSerializer = 'maRqlParamSerializer';
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $httpProvider.interceptors.push('maHttpInterceptor');

    $provide.decorator('$q', qDecorator);
}]);

return ngMangoServices;

}); // require
