/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['./services/Point',
        './services/PointHierarchy',
        './services/User',
        './services/PointEventManager',
        './services/Translate',
        './services/httpInterceptor',
        './services/JsonStore',
        './services/JsonStoreEventManager',
        './services/Util',
        './services/watchdog',
        './services/EventManager',
        './services/NotificationManager',
        './services/cssInjector',
        './services/DataSource',
        './services/DeviceName',
        './services/WatchList',
        './services/WatchListEventManager',
        './services/rqlParamSerializer',
        './services/UserNotes',
        './services/events',
        './services/DynamicItems',
        './services/pointValues',
        './services/statistics',
        './services/qDecorator',
        './services/UserEventManager',
        './services/Modules',
        './services/Permissions',
        './services/systemSettings',
        './services/systemStatus',
        './services/ImportExport',
        './services/analytics',
        './services/requireQ',
        './services/locales',
        './services/fileStore',
        './services/systemActions',
        './services/server',
        './services/TemporaryResource',
        './services/RestResource',
        './services/TemporaryRestResource',
        './services/RqlBuilder',
        './services/math',
        './services/EventDetector',
        './services/EventHandler',
        './services/dataPointTags',
        './services/auditTrail',
        './services/revisionHistoryDialog',
        './services/exceptionHandler',
        './filters/dateFilter',
        './filters/trFilter',
        'angular',
        'require',
        'rql/query',
        'angular-resource',
        'angular-sanitize',
        'angular-local-storage',
        'angular-cookies'
], function(Point, PointHierarchy, UserProvider, PointEventManagerFactory, Translate, httpInterceptor, JsonStore,
        JsonStoreEventManagerFactory, Util, watchdog, EventManager, NotificationManagerFactory, cssInjector, DataSourceFactory, DeviceNameFactory,
        WatchListFactory, WatchListEventManagerFactory, rqlParamSerializer, UserNotes, events,
        DynamicItems, pointValuesFactory, statisticsFactory, qDecorator, UserEventManager, ModulesFactory,
        PermissionsFactory, systemSettingsProvider, systemStatusFactory,
        ImportExportFactory, webAnalyticsFactory, requireQProvider, localesFactory, fileStoreFactory, systemActionsFactory,
        serverFactory, temporaryResourceFactory, restResourceFactory, temporaryRestResourceFactory, rqlBuilderFactory, mathFactory, maEventDetector,
        maEventHandler, maDataPointTags, maAuditTrail, maRevisionHistoryDialog, maExceptionHandler, dateFilterFactory, trFilterFactory,
        angular, require, rqlQuery) {
'use strict';

// rql library doesn't encode null correctly (it encodes as string:null)
const oldEncodeValue = rqlQuery.encodeValue;
rqlQuery.encodeValue = function(val) {
    if (val === null) return 'null';
    return oldEncodeValue.apply(this, arguments);
};

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
var ngMangoServices = angular.module('ngMangoServices', ['ngResource', 'ngSanitize', 'LocalStorageModule', 'ngLocale', 'ngCookies']);

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
ngMangoServices.factory('maNotificationManager', NotificationManagerFactory);
ngMangoServices.factory('maCssInjector', cssInjector);
ngMangoServices.factory('maDataSource', DataSourceFactory);
ngMangoServices.factory('maDeviceName', DeviceNameFactory);
ngMangoServices.factory('maWatchList', WatchListFactory);
ngMangoServices.factory('maWatchListEventManager', WatchListEventManagerFactory);
ngMangoServices.factory('maRqlParamSerializer', rqlParamSerializer);
ngMangoServices.factory('maUserNotes', UserNotes);
ngMangoServices.factory('maEvents', events);
ngMangoServices.factory('maDynamicItems', DynamicItems);
ngMangoServices.factory('maPointValues', pointValuesFactory);
ngMangoServices.factory('maStatistics', statisticsFactory);
ngMangoServices.factory('maUserEventManager', UserEventManager);
ngMangoServices.factory('maModules', ModulesFactory);
ngMangoServices.factory('maPermissions', PermissionsFactory);
ngMangoServices.provider('maSystemSettings', systemSettingsProvider);
ngMangoServices.factory('maSystemStatus', systemStatusFactory);
ngMangoServices.factory('maImportExport', ImportExportFactory);
ngMangoServices.factory('maWebAnalytics', webAnalyticsFactory);
ngMangoServices.provider('maRequireQ', requireQProvider);
ngMangoServices.factory('maLocales', localesFactory);
ngMangoServices.factory('maFileStore', fileStoreFactory);
ngMangoServices.factory('maSystemActions', systemActionsFactory);
ngMangoServices.factory('maServer', serverFactory);
ngMangoServices.factory('maTemporaryResource', temporaryResourceFactory);
ngMangoServices.factory('maRestResource', restResourceFactory);
ngMangoServices.factory('maTemporaryRestResource', temporaryRestResourceFactory);
ngMangoServices.factory('maRqlBuilder', rqlBuilderFactory);
ngMangoServices.factory('maMath', mathFactory);
ngMangoServices.factory('maEventDetector', maEventDetector);
ngMangoServices.factory('maEventHandler', maEventHandler);
ngMangoServices.factory('maDataPointTags', maDataPointTags);
ngMangoServices.factory('maAuditTrail', maAuditTrail);
ngMangoServices.factory('maRevisionHistoryDialog', maRevisionHistoryDialog);
ngMangoServices.provider('$exceptionHandler', maExceptionHandler);
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

ngMangoServices.constant('MA_DEFAULT_TIMEZONE', '');
ngMangoServices.constant('MA_DEFAULT_LOCALE', '');

ngMangoServices.constant('MA_EVENT_HANDLER_TYPES', [
    {
        type: 'EMAIL',
        description: 'eventHandlers.type.email',
        editorTemplateUrl: require.toUrl('./components/eventHandlerEditor/email.html')
    },
    {
        type: 'PROCESS',
        description: 'eventHandlers.type.process',
        editorTemplateUrl: require.toUrl('./components/eventHandlerEditor/process.html')
    },
    {
        type: 'SET_POINT',
        description: 'eventHandlers.type.setPoint',
        editorTemplateUrl: require.toUrl('./components/eventHandlerEditor/setPoint.html')
    }
]);

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
    
    $provide.decorator('$resource', ['$delegate', 'maRqlBuilder', 'maUtil', function($delegate, RqlBuilder, maUtil) {
        const buildQuery = function() {
            const builder = new RqlBuilder();
            builder.queryFunction = (queryObj, opts) => {
                return this.query({rqlQuery: queryObj.toString()}).$promise;
            };
            return builder;
        };
        
        return function resourceWithBuildQuery() {
            const resource = $delegate.apply(this, arguments);
            resource.buildQuery = buildQuery;
            resource.objQuery = maUtil.objQuery;
            return resource;
        };
    }]);
}]);

return ngMangoServices;

}); // require
