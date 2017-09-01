/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights relockved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

SystemStatusPageController.$inject = ['maSystemStatus', '$state', 'maUiMenu', '$mdMedia', 'maDialogHelper', 'maUiDateBar', '$scope', 'maRqlBuilder'];
function SystemStatusPageController(systemStatus, $state, maUiMenu, $mdMedia, maDialogHelper, maUiDateBar, $scope, RqlBuilder) {
    this.systemStatus = systemStatus;
    this.$state = $state;
    this.$scope = $scope;
    this.menu = maUiMenu;
    this.$mdMedia = $mdMedia;
    this.maDialogHelper = maDialogHelper;
    this.dateBar = maUiDateBar;
    this.RqlBuilder = RqlBuilder;

    this.logByFileNameUrl = '/rest/v1/logging/view/';

    this.boundAuditQuery = (...args) => this.updateAuditQuery(...args);
    this.boundDisplayAuditContext = (...args) => this.displayAuditContext(...args);
}

SystemStatusPageController.prototype.$onInit = function() {
    this.getInternalMetrics();
    this.getLogFilesList();
    this.getWorkItems();
    this.getThreads();
    this.getSystemInfo();

    this.auditQuery = {
        alarmLevel: '*',
        changeType: '*',
        typeName: '*',
        dateFilter: false
    };
    this.auditTableLimit = 25;
    this.auditTablePage = 1;
    this.auditTableOrder = '-ts';
    this.selectedAuditEvent = [];

    this.systemStatus.getAuditEventTypes().then((response) => {
        this.auditEventTypes = response.data;
    });
    this.updateAuditQuery();

    this.dateBar.subscribe((event, changedProperties) => {
        if (this.auditQuery.dateFilter) {
            this.updateAuditQuery();
        }
    }, this.$scope);
};

SystemStatusPageController.prototype.updateAuditQuery = function() {
    // create a base rql query, will be of type 'and'
    const rootRql = new this.RqlBuilder();

    Object.keys(this.auditQuery).forEach(key => {
        const value = this.auditQuery[key];

        if (key === 'dateFilter') {
            if (this.auditQuery.dateFilter) {
                rootRql.ge('ts', this.dateBar.data.from)
                    .lt('ts', this.dateBar.data.to);
            }
        } else if (key === 'userId') {
            if (value) {
                rootRql.eq(key, value.id);
            }
        } else if (value !== '*') {
            rootRql.eq(key, value);
        }
    });

    rootRql.sort(this.auditTableOrder).limit(this.auditTableLimit, (this.auditTablePage - 1) * this.auditTableLimit);

    this.systemStatus.getAuditTrail(rootRql).then((auditTrail) => {
        this.auditTrail = auditTrail;
    });
};

SystemStatusPageController.prototype.displayAuditContext = function() {
    this.selectedAuditEventContext = JSON.stringify(this.selectedAuditEvent[0].context);
};


SystemStatusPageController.prototype.getWorkItems = function() {
    this.systemStatus.getWorkItemsQueueCounts().then((response) => {
        this.workItemsQueueCounts = response.data;
    });

    this.systemStatus.getWorkItemsRunningStats().then((response) => {
        this.workItemsRunningStats = response.data;
    });

    this.systemStatus.getWorkItemsRejectedStats().then((response) => {
        this.workItemsRejectedStats = response.data;
    });
};

SystemStatusPageController.prototype.getInternalMetrics = function() {
    this.systemStatus.getInternalMetrics().then((response) => {
        this.internalMetrics = response.data;
    });
};

SystemStatusPageController.prototype.getLogFilesList = function() {
    this.systemStatus.getLogFilesList().then((response) => {
        this.logFilesList = response.data;
    });
};

SystemStatusPageController.prototype.getLogDownloadUrl = function(filename) {
    return this.logByFileNameUrl + filename + '?download=true';
};

SystemStatusPageController.prototype.displayLogFile = function(filename) {
    this.selectedLogFile = filename;

    this.systemStatus.getLogFile(filename).then((response) => {
        this.selectedLogContent = response.data;
    });
};

SystemStatusPageController.prototype.copyLogToClipboard = function() {
    document.querySelector('#logging-console').select();
    document.execCommand('copy');

    this.maDialogHelper.toastOptions({
        text: this.selectedLogFile + ' copied to clipboard',
        hideDelay: 4000
    });
};

SystemStatusPageController.prototype.getThreads = function() {
    this.systemStatus.getThreads().then((response) => {
        this.threads = response.data;
    });
};

SystemStatusPageController.prototype.showBlockedThreadDetails = function($event, thread) {
    this.maDialogHelper.showBasicDialog($event, {
        titleTr: 'ui.settings.systemStatus.blockedThreadDetails',
        contentTemplate: '<p>lockOwnerName: ' + thread.lockOwnerName + '</p>' +
                '<p>lockOwnerId: ' + thread.lockOwnerId + '</p>' +
                '<p>className: ' +thread.lockInfo.className + '</p>' +
                '<p>identityHashCode: ' +thread.lockInfo.identityHashCode + '</p>'
    });
};

SystemStatusPageController.prototype.showStackTrace = function(thread) {
    this.selectedThread = thread.name;

    this.selectedThreadStackTrace = '';
    thread.location.forEach( (item) => {
        this.selectedThreadStackTrace += item.className + '.' + item.methodName + ':' + item.lineNumber + '\n';
    });
};

SystemStatusPageController.prototype.copyStackTraceToClipboard = function() {
    document.querySelector('#stack-trace').select();
    document.execCommand('copy');

    this.maDialogHelper.toastOptions({
        text: this.selectedThread + ' stack trace copied to clipboard',
        hideDelay: 4000
    });
};

SystemStatusPageController.prototype.getSystemInfo = function() {
    this.systemStatus.getFullSystemInfo().then((response) => {
        this.systemInfo = response.data;
    });
};

SystemStatusPageController.prototype.isEmptyObj = function(obj) {
    if (obj === undefined) {
        return true;
    }
    return Object.keys(obj).length === 0;
};

    return {
    controller: SystemStatusPageController,
    templateUrl: require.toUrl('./systemStatusPage.html')
};

}); // define