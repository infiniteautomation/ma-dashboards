/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

SystemStatusFactory.$inject = ['$http'];

function SystemStatusFactory($http) {

    const auditTrailUrl = '/rest/latest/audit';
    const internalMetricsUrl = '/rest/latest/system-metrics';
    const logFilesListUrl = '/rest/latest/logging/files';
    const logByFileNameUrl = '/rest/latest/logging/view/';
    const workItemsUrl = '/rest/latest/work-items/';
    const threadsUrl = '/rest/latest/threads';
    const systemInfoUrl = '/rest/latest/server/system-info';
    const pointHistoryCountsUrl = '/rest/latest/server/point-history-counts';

    const SystemStatus = {};

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
    
    SystemStatus.getInternalMetric = function(id) {
        return $http({
            method: 'GET',
            url: `${internalMetricsUrl}/${encodeURIComponent(id)}`
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


