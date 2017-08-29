/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights relockved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

SystemStatusPageController.$inject = ['maSystemStatus', '$state', 'maUiMenu', '$mdMedia', 'maDialogHelper'];
function SystemStatusPageController(systemStatus, $state, maUiMenu, $mdMedia, maDialogHelper) {
    this.systemStatus = systemStatus;
    this.$state = $state;
    this.menu = maUiMenu;
    this.$mdMedia = $mdMedia;
    this.maDialogHelper = maDialogHelper;

    this.logByFileNameUrl = '/rest/v1/logging/view/';
}

SystemStatusPageController.prototype.$onChanges = function(changes) {
};

SystemStatusPageController.prototype.$onInit = function() {
    this.getInternalMetrics();
    this.getLogFilesList();
    this.getWorkItems();
    this.getThreads();
    this.getSystemInfo();

    this.auditQuery = {
        alarmLevel: '*'
    };
    this.updateAuditQuery();
};


SystemStatusPageController.prototype.updateAuditQuery = function() {
    var $this = this;
    // console.log(this.auditQuery);

    this.systemStatus.getAuditTrail(this.auditQuery).then(function(response) {
        $this.auditTrail = response.data.items;
    });
};

SystemStatusPageController.prototype.getWorkItems = function() {
    var $this = this;

    this.systemStatus.getWorkItemsQueueCounts().then(function(response) {
        $this.workItemsQueueCounts = response.data;
    });

    this.systemStatus.getWorkItemsRunningStats().then(function(response) {
        $this.workItemsRunningStats = response.data;
    });

    this.systemStatus.getWorkItemsRejectedStats().then(function(response) {
        $this.workItemsRejectedStats = response.data;
    });
};

SystemStatusPageController.prototype.getInternalMetrics = function() {
    var $this = this;

    this.systemStatus.getInternalMetrics().then(function(response) {
        $this.internalMetrics = response.data;
    });
};

SystemStatusPageController.prototype.getLogFilesList = function() {
    var $this = this;

    this.systemStatus.getLogFilesList().then(function(response) {
        $this.logFilesList = response.data;
    });
};

SystemStatusPageController.prototype.getLogDownloadUrl = function(filename) {
    return this.logByFileNameUrl + filename + '?download=true';
};

SystemStatusPageController.prototype.displayLogFile = function(filename) {
    var $this = this;

    this.selectedLogFile = filename;

    this.systemStatus.getLogFile(filename).then(function(response) {
        $this.selectedLogContent = response.data;
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
    var $this = this;

    this.systemStatus.getThreads().then(function(response) {
        $this.threads = response.data;
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
    var $this = this;
    this.selectedThread = thread.name;

    $this.selectedThreadStackTrace = '';
    thread.location.forEach(function(item) {
        $this.selectedThreadStackTrace += item.className + '.' + item.methodName + ':' + item.lineNumber + '\n';
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
    var $this = this;

    this.systemStatus.getFullSystemInfo().then(function(response) {
        $this.systemInfo = response.data;
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