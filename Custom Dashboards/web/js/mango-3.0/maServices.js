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
        'angular',
        'angular-resource'
], function(Point, PointHierarchy, User, PointEventManagerFactory, Translate, mangoHttpInterceptor, JsonStore,
        JsonStoreEventManagerFactory, Util, mangoWatchdog, EventManager, cssInjector, DataSourceFactory, DeviceNameFactory, angular) {
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
var maServices = angular.module('maServices', ['ngResource']);

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

maServices.constant('mangoBaseUrl', '');
maServices.constant('mangoTimeout', 30000);
maServices.constant('mangoWatchdogTimeout', 60000);
maServices.constant('mangoReconnectDelay', 60000);
maServices.constant('mangoDefaultDateFormat', 'll LTS');

return maServices;

}); // require
