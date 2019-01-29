/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import Point from './services/Point';
import PointHierarchy from './services/PointHierarchy';
import UserProvider from './services/User';
import PointEventManagerFactory from './services/PointEventManager';
import translateProvider from './services/Translate';
import httpInterceptor from './services/httpInterceptor';
import JsonStore from './services/JsonStore';
import JsonStoreEventManagerFactory from './services/JsonStoreEventManager';
import Util from './services/Util';
import watchdog from './services/watchdog';
import EventManager from './services/EventManager';
import NotificationManagerFactory from './services/NotificationManager';
import cssInjector from './services/cssInjector';
import dataSourceProvider from './services/DataSource';
import DeviceNameFactory from './services/DeviceName';
import WatchListFactory from './services/WatchList';
import WatchListEventManagerFactory from './services/WatchListEventManager';
import rqlParamSerializer from './services/rqlParamSerializer';
import UserNotes from './services/UserNotes';
import events from './services/events';
import DynamicItems from './services/DynamicItems';
import pointValuesProvider from './services/pointValues';
import statisticsFactory from './services/statistics';
import qDecorator from './services/qDecorator';
import resourceDecorator from './services/resourceDecorator';
import UserEventManager from './services/UserEventManager';
import ModulesFactory from './services/Modules';
import PermissionsFactory from './services/Permissions';
import systemSettingsProvider from './services/systemSettings';
import systemStatusFactory from './services/systemStatus';
import ImportExportFactory from './services/ImportExport';
import webAnalyticsFactory from './services/analytics';
import localesFactory from './services/locales';
import fileStoreFactory from './services/fileStore';
import systemActionsFactory from './services/systemActions';
import serverFactory from './services/server';
import temporaryResourceFactory from './services/TemporaryResource';
import restResourceFactory from './services/RestResource';
import temporaryRestResourceFactory from './services/TemporaryRestResource';
import rqlBuilderFactory from './services/RqlBuilder';
import mathFactory from './services/math';
import maEventDetector from './services/EventDetector';
import maEventHandler from './services/EventHandler';
import maDataPointTags from './services/dataPointTags';
import maAuditTrail from './services/auditTrail';
import maRevisionHistoryDialog from './services/revisionHistoryDialog';
import maExceptionHandler from './services/exceptionHandler';
import PointValueController from './services/PointValueController';
import moduleLoader from './services/moduleLoader';
import mailingListFactory from './services/mailingList';
import eventTypeProvider from './services/EventType';
import virtualSerialPortFactory from './services/virtualSerialPort';
import dateFilterFactory from './filters/dateFilter';
import trFilterFactory from './filters/trFilter';
import scriptingEditorFactory from './services/scriptingEditor';
import multipleValuesFactory from './services/MultipleValues';
import angular from 'angular';
import rqlQuery from 'rql/query';
import 'angular-resource';
import 'angular-sanitize';
import 'angular-local-storage';
import 'angular-cookies';

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
const ngMangoServices = angular.module('ngMangoServices', ['ngResource', 'ngSanitize', 'LocalStorageModule', 'ngLocale', 'ngCookies']);

ngMangoServices.provider('maPoint', Point);
ngMangoServices.factory('maPointHierarchy', PointHierarchy);
ngMangoServices.provider('maUser', UserProvider);
ngMangoServices.factory('maPointEventManager', PointEventManagerFactory);
ngMangoServices.provider('maTranslate', translateProvider);
ngMangoServices.factory('maHttpInterceptor', httpInterceptor);
ngMangoServices.factory('maJsonStore', JsonStore);
ngMangoServices.factory('maJsonStoreEventManager', JsonStoreEventManagerFactory);
ngMangoServices.factory('maUtil', Util);
ngMangoServices.factory('maWatchdog', watchdog);
ngMangoServices.factory('maEventManager', EventManager);
ngMangoServices.factory('maNotificationManager', NotificationManagerFactory);
ngMangoServices.factory('maCssInjector', cssInjector);
ngMangoServices.provider('maDataSource', dataSourceProvider);
ngMangoServices.factory('maDeviceName', DeviceNameFactory);
ngMangoServices.factory('maWatchList', WatchListFactory);
ngMangoServices.factory('maWatchListEventManager', WatchListEventManagerFactory);
ngMangoServices.factory('maRqlParamSerializer', rqlParamSerializer);
ngMangoServices.factory('maUserNotes', UserNotes);
ngMangoServices.factory('maEvents', events);
ngMangoServices.factory('maDynamicItems', DynamicItems);
ngMangoServices.provider('maPointValues', pointValuesProvider);
ngMangoServices.factory('maStatistics', statisticsFactory);
ngMangoServices.factory('maUserEventManager', UserEventManager);
ngMangoServices.factory('maModules', ModulesFactory);
ngMangoServices.factory('maPermissions', PermissionsFactory);
ngMangoServices.provider('maSystemSettings', systemSettingsProvider);
ngMangoServices.factory('maSystemStatus', systemStatusFactory);
ngMangoServices.factory('maImportExport', ImportExportFactory);
ngMangoServices.factory('maWebAnalytics', webAnalyticsFactory);
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
ngMangoServices.provider('maEventHandler', maEventHandler);
ngMangoServices.factory('maDataPointTags', maDataPointTags);
ngMangoServices.factory('maAuditTrail', maAuditTrail);
ngMangoServices.factory('maRevisionHistoryDialog', maRevisionHistoryDialog);
ngMangoServices.factory('maPointValueController', PointValueController);
ngMangoServices.factory('maModuleLoader', moduleLoader);
ngMangoServices.factory('maMailingList', mailingListFactory);
ngMangoServices.provider('maEventType', eventTypeProvider);
ngMangoServices.factory('maVirtualSerialPort', virtualSerialPortFactory);
ngMangoServices.factory('maScriptingEditor', scriptingEditorFactory);
ngMangoServices.provider('$exceptionHandler', maExceptionHandler);
ngMangoServices.factory('maMultipleValues', multipleValuesFactory);
ngMangoServices.filter('maDate', dateFilterFactory);
ngMangoServices.filter('maTr', trFilterFactory);

ngMangoServices.constant('MA_BASE_URL', '');
ngMangoServices.constant('MA_TIMEOUT', 30000);
ngMangoServices.constant('MA_WATCHDOG_TIMEOUT', 10000);
ngMangoServices.constant('MA_RECONNECT_DELAY', 5000);

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

ngMangoServices.config(['localStorageServiceProvider', '$httpProvider', '$provide',
        function(localStorageServiceProvider, $httpProvider, $provide) {
    localStorageServiceProvider
        .setPrefix('ngMangoServices')
        .setStorageCookieDomain(window.location.hostname === 'localhost' ? '' : window.location.host)
        .setNotify(false, false);
    
    $httpProvider.defaults.paramSerializer = 'maRqlParamSerializer';
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $httpProvider.interceptors.push('maHttpInterceptor');

    $provide.decorator('$q', qDecorator);
    $provide.decorator('$resource', resourceDecorator);
}]);

export default ngMangoServices;