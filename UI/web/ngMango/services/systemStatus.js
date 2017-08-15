/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['require', 'angular'], function(require, angular) {
'use strict';


SystemStatusFactory.$inject = ['$http'];

function SystemStatusFactory($http) {

    var auditTrailUrl = '/rest/v1/audit';
    var internalMetricsUrl = '/rest/v1/system-metrics';
    var logFilesListUrl = '/rest/v1/logging/files';
    var logByFileNameUrl = '/rest/v1/logging/by-filename/';
    var workItemsUrl = '/rest/v1/work-items';
    var threadsUrl = '/rest/v1/threads';
    var systemInfoUrl = '/rest/v2/server/system-info';

    var SystemStatus = {};

    SystemStatus.getAuditTrail = function() {
        return $http({
            method: 'GET',
            url: auditTrailUrl
        }).then(function(response) {
            return response.data;
        });
    };

    SystemStatus.getInternalMetrics = function() {
        return $http({
            method: 'GET',
            url: internalMetricsUrl
        });
    };

    SystemStatus.getLogFilesList = function() {
        return $http({
            method: 'GET',
            url: logFilesListUrl
        });
    };

    SystemStatus.getLogFile = function(filename) {
        return $http({
            method: 'GET',
            url: logByFileNameUrl + filename
        });
    };

    SystemStatus.getWorkItems = function() {
        return $http({
            method: 'GET',
            url: workItemsUrl
        });
    };

    SystemStatus.getThreads = function() {
        return $http({
            method: 'GET',
            url: threadsUrl
        });
    };

    SystemStatus.getFullSystemInfo = function() {
        return $http({
            method: 'GET',
            url: systemInfoUrl
        });
    };

    return SystemStatus;
}

return SystemStatusFactory;

});
