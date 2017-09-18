/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights relockved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

SystemStatusPageController.$inject = ['maSystemStatus', '$state', 'maUiMenu', '$mdMedia', '$mdDialog', 'maTranslate', 'maDialogHelper', 
    'maUiDateBar', '$scope', 'maRqlBuilder'];
function SystemStatusPageController(systemStatus, $state, maUiMenu, $mdMedia, $mdDialog, maTranslate, maDialogHelper, maUiDateBar, $scope, RqlBuilder) {
    this.systemStatus = systemStatus;
    this.$state = $state;
    this.$scope = $scope;
    this.menu = maUiMenu;
    this.$mdMedia = $mdMedia;
    this.maTranslate = maTranslate;
    this.maDialogHelper = maDialogHelper;
    this.$mdDialog = $mdDialog;
    this.dateBar = maUiDateBar;
    this.RqlBuilder = RqlBuilder;

    this.logByFileNameUrl = '/rest/v1/logging/view/';

    this.boundAuditQuery = (...args) => this.updateAuditQuery(...args);
    this.boundDisplayAuditContext = (...args) => this.displayAuditContext(...args);
    this.boundShowStackTrace = (...args) => this.showStackTrace(...args);
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
    this.selectedThread = [];

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

/** Audit Context **/

SystemStatusPageController.prototype.displayAuditContext = function() {
    let content = JSON.stringify(this.selectedAuditEvent[0].context);
    let title = this.maTranslate.trSync('ui.settings.systemStatus.displayingAuditContext', this.selectedAuditEvent[0].message);

    this.showTextAreaDialog(title, content);
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

/** Internal Metrics **/

SystemStatusPageController.prototype.getInternalMetrics = function() {
    this.systemStatus.getInternalMetrics().then((response) => {
        this.internalMetrics = response.data;
    });
};

/** Server Info **/

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
        let content = response.data;
        let title = this.maTranslate.trSync('ui.settings.systemStatus.displayingLogFile', this.selectedLogFile);

        this.showTextAreaDialog(title, content);
    });
};

/** Server Info **/

SystemStatusPageController.prototype.getSystemInfo = function() {
    this.systemStatus.getFullSystemInfo().then((response) => {
        this.systemInfo = response.data;
    });
};

SystemStatusPageController.prototype.getPointCounts = function() {
    this.systemStatus.getPointCounts().then((response) => {
        this.pointCounts = response.data;
    });
};

/** Threads **/

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

SystemStatusPageController.prototype.showStackTrace = function() {
    this.selectedThreadStackTrace = '';
    this.selectedThread[0].location.forEach( (item) => {
        this.selectedThreadStackTrace += item.className + '.' + item.methodName + ':' + item.lineNumber + '\n';
    });

    let content = this.selectedThreadStackTrace;
    let title = this.maTranslate.trSync('ui.settings.systemStatus.displayingStackTraceForThread', this.selectedThread[0].name);

    this.showTextAreaDialog(title, content);
};

/** Work Items **/

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

SystemStatusPageController.prototype.isEmptyObj = function(obj) {
    if (obj === undefined) {
        return true;
    }
    return Object.keys(obj).length === 0;
};


SystemStatusPageController.prototype.showTextAreaDialog = function(title, textContent) {
    let $this = this;
    this.$mdDialog.show({
        controller: function() {
            this.title = title;
            this.textContent = textContent;

            this.copyToClipBoard = function() {
                document.querySelector('#dialog-text-area').select();
                document.execCommand('copy');

                $this.maDialogHelper.toastOptions({
                    text: 'Text copied to clipboard',
                    hideDelay: 4000
                });
            };

            this.ok = function() {
                $this.$mdDialog.hide();
            };
            this.$mdMedia = $this.$mdMedia;
        },
        templateUrl: require.toUrl('./textAreaDialog.html'),
        clickOutsideToClose: true,
        escapeToClose: true,
        controllerAs: '$ctrl',
        bindToController: true
    });
};

    return {
    controller: SystemStatusPageController,
    templateUrl: require.toUrl('./systemStatusPage.html')
};

}); // define