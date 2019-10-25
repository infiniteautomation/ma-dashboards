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
import eventTypeInfoProvider from './services/EventTypeInfo';
import virtualSerialPortFactory from './services/virtualSerialPort';
import dateFilterFactory from './filters/dateFilter';
import trFilterFactory from './filters/trFilter';
import scriptingEditorFactory from './services/scriptingEditor';
import multipleValuesFactory from './services/MultipleValues';
import serialPort from './services/serialPort';
import Publisher from './services/Publisher';
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
ngMangoServices.provider('maEventDetector', maEventDetector);
ngMangoServices.provider('maEventHandler', maEventHandler);
ngMangoServices.factory('maDataPointTags', maDataPointTags);
ngMangoServices.factory('maAuditTrail', maAuditTrail);
ngMangoServices.factory('maRevisionHistoryDialog', maRevisionHistoryDialog);
ngMangoServices.factory('maPointValueController', PointValueController);
ngMangoServices.factory('maModuleLoader', moduleLoader);
ngMangoServices.factory('maMailingList', mailingListFactory);
ngMangoServices.provider('maEventTypeInfo', eventTypeInfoProvider);
ngMangoServices.factory('maVirtualSerialPort', virtualSerialPortFactory);
ngMangoServices.factory('maScriptingEditor', scriptingEditorFactory);
ngMangoServices.provider('$exceptionHandler', maExceptionHandler);
ngMangoServices.factory('maMultipleValues', multipleValuesFactory);
ngMangoServices.filter('maDate', dateFilterFactory);
ngMangoServices.filter('maTr', trFilterFactory);
ngMangoServices.factory('maSerialPort', serialPort);
ngMangoServices.provider('maPublisher', Publisher);

ngMangoServices.constant('MA_BASE_URL', '');
ngMangoServices.constant('MA_TIMEOUT', 30000); // TODO Mango 4.0 remove
ngMangoServices.constant('MA_TIMEOUTS', {
    // NOTE: update uiSettings.json as well! These timeouts are overriden by the timeouts in the UI Settings
    xhr: 30000, // default XMLHttpRequest timeout
    websocket: 10000, // WebSocket connection timeout
    websocketRequest: 10000, // request made over WebSocket
    pointValues: 60000 // timeout for fetching points values
});
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

ngMangoServices.constant('MA_ROLLUP_TYPES', [
    {type: 'POINT_DEFAULT', nonNumeric: true, label: 'Point default', translation: 'common.rollup.pointDefault', nonAssignable: true},
    {type: 'NONE', nonNumeric: true, label: 'None', translation: 'common.rollup.none'},
    {type: 'SIMPLIFY', nonNumeric: false, label: 'Simplify', translation: 'ui.app.simplify', nonAssignable: true},
    {type: 'AVERAGE', nonNumeric: false, label: 'Average', translation: 'common.rollup.average'},
    {type: 'DELTA', nonNumeric: false, label: 'Delta', translation: 'common.rollup.delta'},
    {type: 'MINIMUM', nonNumeric: false, label: 'Minimum', translation: 'common.rollup.minimum'},
    {type: 'MAXIMUM', nonNumeric: false, label: 'Maximum', translation: 'common.rollup.maximum'},
    {type: 'ACCUMULATOR', nonNumeric: false, label: 'Accumulator', translation: 'common.rollup.accumulator'},
    {type: 'SUM', nonNumeric: false, label: 'Sum', translation: 'common.rollup.sum'},
    {type: 'START', nonNumeric: true, label: 'Start', translation: 'common.rollup.start'},
    {type: 'FIRST', nonNumeric: true, label: 'First', translation: 'common.rollup.first'},
    {type: 'LAST', nonNumeric: true, label: 'Last', translation: 'common.rollup.last'},
    {type: 'COUNT', nonNumeric: true, label: 'Count', translation: 'common.rollup.count'},
    {type: 'INTEGRAL', nonNumeric: false, label: 'Integral', translation: 'common.rollup.integral'}
    //{name: 'FFT', nonNumeric: false}
]);

ngMangoServices.constant('MA_DATE_TIME_FORMATS', [
    {
        translation: 'ui.app.timeFormat.iso',
        format: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX'
    },
    {
        translation: 'ui.app.timeFormat.excelCompatible',
        format: 'yyyy-MM-dd HH:mm:ss'
    },
    {
        translation: 'ui.app.timeFormat.excelCompatibleMs',
        format: 'yyyy-MM-dd HH:mm:ss.SSS'
    },
    {
        translation: 'ui.app.timeFormat.epoch',
        format: ''
    }
]);

ngMangoServices.constant('MA_TIME_PERIOD_TYPES', [
    {type: 'MILLISECONDS', label: 'Milliseconds', translation: 'dateAndTime.milliseconds', perTranslation: 'dateAndTime.millisecond.per'},
    {type: 'SECONDS', label: 'Seconds', translation: 'dateAndTime.seconds', perTranslation: 'dateAndTime.second.per'},
    {type: 'MINUTES', label: 'Minutes', translation: 'dateAndTime.minutes', perTranslation: 'dateAndTime.minute.per'},
    {type: 'HOURS', label: 'Hours', translation: 'dateAndTime.hours', perTranslation: 'dateAndTime.hour.per'},
    {type: 'DAYS', label: 'Days', translation: 'dateAndTime.days', perTranslation: 'dateAndTime.day.per', showByDefault: true},
    {type: 'WEEKS', label: 'Weeks', translation: 'dateAndTime.weeks', perTranslation: 'dateAndTime.week.per', showByDefault: true},
    {type: 'MONTHS', label: 'Months', translation: 'dateAndTime.months', perTranslation: 'dateAndTime.month.per', showByDefault: true},
    {type: 'YEARS', label: 'Years', translation: 'dateAndTime.years', perTranslation: 'dateAndTime.year.per', showByDefault: true}
]);

ngMangoServices.constant('MA_CHART_TYPES', [
    {type: 'line', apiType: 'LINE', label: 'Line', translation: 'ui.app.line'},
    {type: 'smoothedLine', apiType: 'SPLINE', label: 'Smoothed', translation: 'ui.app.smooth'},
    {type: 'step', apiType: 'STEP', label: 'Step', translation: 'ui.app.step', nonNumeric: true},
    {type: 'column', apiType: 'BAR', label: 'Bar', translation: 'ui.app.bar'}
]);

ngMangoServices.constant('MA_SIMPLIFY_TYPES', [
    {type: 'NONE', translation: 'pointEdit.simplify.none', dataTypes: new Set(['BINARY', 'ALPHANUMERIC', 'MULTISTATE', 'NUMERIC', 'IMAGE'])},
    {type: 'TARGET', translation: 'pointEdit.simplify.target', dataTypes: new Set(['NUMERIC', 'MULTISTATE', 'BINARY'])},
    {type: 'TOLERANCE', translation: 'pointEdit.simplify.tolerance', dataTypes: new Set(['NUMERIC', 'MULTISTATE', 'BINARY'])}
]);

// properties are added/defined in UI module
ngMangoServices.constant('MA_EVENT_LINK_INFO', {});

ngMangoServices.constant('MA_DEFAULT_TIMEZONE', '');
ngMangoServices.constant('MA_DEFAULT_LOCALE', '');

// development mode settings
ngMangoServices.constant('MA_DEVELOPMENT_CONFIG', {enabled: false});

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