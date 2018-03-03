/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */
import angular from 'angular';



SystemStatusFactory.$inject = ['$http'];

function SystemStatusFactory($http) {

    var auditTrailUrl = '/rest/v1/audit';
    var internalMetricsUrl = '/rest/v1/system-metrics';
    var logFilesListUrl = '/rest/v1/logging/files';
    var logByFileNameUrl = '/rest/v1/logging/view/';
    var workItemsUrl = '/rest/v1/work-items/';
    var threadsUrl = '/rest/v1/threads';
    var systemInfoUrl = '/rest/v2/server/system-info';
    var pointHistoryCountsUrl = '/rest/v2/server/point-history-counts';

    var SystemStatus = {};

    /**
     * param {string} rql A query.Query object or an encoded RQL string
     */
    SystemStatus.getAuditTrail = function(rql) {
        const params = {};
        
        if (rql) {
            // coerce to string
            const rqlString = '' + rql;
            
            // only add parameter if string is not empty
            if (rqlString) {
                params.rqlQuery = rqlString;
            }
        }
        
        return $http({
            method: 'GET',
            url: auditTrailUrl,
            params: params
        }).then(response => {
            response.data.items.$total = response.data.total;
            return response.data.items;
        });
    };

    SystemStatus.getAuditEventTypes = function() {
        return $http({
            method: 'GET',
            url: auditTrailUrl + '/list-event-types'
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
            url: logByFileNameUrl + encodeURIComponent(filename)
        });
    };

    SystemStatus.getWorkItemsQueueCounts = function() {
        return $http({
            method: 'GET',
            url: workItemsUrl + 'queue-counts'
        });
    };

    SystemStatus.getWorkItemsRunningStats = function() {
        return $http({
            method: 'GET',
            url: workItemsUrl + 'running-stats'
        });
    };

    SystemStatus.getWorkItemsRejectedStats = function() {
        return $http({
            method: 'GET',
            url: workItemsUrl + 'rejected-stats'
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

    SystemStatus.getPointCounts = function() {
        return $http({
            method: 'GET',
            url: pointHistoryCountsUrl
        });
    };

    return SystemStatus;
}

export default SystemStatusFactory;


