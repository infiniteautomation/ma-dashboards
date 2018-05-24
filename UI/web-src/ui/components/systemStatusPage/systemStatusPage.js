/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights relockved.
 * @author Will Geller
 */

import angular from 'angular';
import textAreaDialogTemplate from './textAreaDialog.html';
import systemStatusPageTemplate from './systemStatusPage.html';

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
    
    this.auditQuery = {
        alarmLevel: '*',
        changeType: '*',
        typeName: '*',
        dateFilter: false
    };
    this.auditTableLimit = 25;
    this.auditTablePage = 1;
    this.auditTableOrder = '-ts';
}

SystemStatusPageController.prototype.$onInit = function() {
};

SystemStatusPageController.prototype.pageChanged = function(name) {
    if (this.unsubscribe) this.unsubscribe();
    
    switch(name) {
    case 'auditTrail': {
        this.systemStatus.getAuditEventTypes().then((response) => {
            this.auditEventTypes = response.data;
        });
        this.updateAuditQuery();

        this.unsubscribe = this.dateBar.subscribe((event, changedProperties) => {
            if (this.auditQuery.dateFilter) {
                this.updateAuditQuery();
            }
        }, this.$scope);
        
        break;
    }
    case 'internalMetrics': this.getInternalMetrics(); break;
    case 'loggingConsole': this.getLogFilesList(); break;
    case 'workItems': this.getWorkItems(); break;
    case 'threads': this.getThreads(); break;
    case 'serverInfo': this.getSystemInfo(); break;
    
    }
};

/** Audit Context **/

SystemStatusPageController.prototype.displayAuditContext = function(auditEvent) {
    const context = angular.copy(auditEvent.context);
//    if (context.jsonData) {
//        context.jsonData = JSON.parse(context.jsonData);
//    }
    const content = JSON.stringify(context, null, 2);
    const title = this.maTranslate.trSync('ui.settings.systemStatus.displayingAuditContext', auditEvent.message);

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
    // stops the click handler for the row running and closing this dialog
    $event.stopPropagation();
    
    this.maDialogHelper.showBasicDialog($event, {
        titleTr: 'ui.settings.systemStatus.blockedThreadDetails',
        contentTemplate: `<p>lockOwnerName: ${thread.lockOwnerName}</p>
            <p>lockOwnerId: ${thread.lockOwnerId}</p>
            <p>className: ${thread.lockInfo && thread.lockInfo.className}</p>
            <p>identityHashCode: ${thread.lockInfo && thread.lockInfo.identityHashCode}</p>`
    });
};

SystemStatusPageController.prototype.showStackTrace = function(selectedThread) {
    this.selectedThreadStackTrace = '';
    selectedThread.location.forEach((item) => {
        this.selectedThreadStackTrace += `${item.className}.${item.methodName}:${item.lineNumber}\n`;
    });

    const content = this.selectedThreadStackTrace;
    const title = this.maTranslate.trSync('ui.settings.systemStatus.displayingStackTraceForThread', selectedThread.name);

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
            this.cancel = function() {
                $this.$mdDialog.cancel();
            };
            this.$mdMedia = $this.$mdMedia;
        },
        template: textAreaDialogTemplate,
        clickOutsideToClose: true,
        escapeToClose: true,
        controllerAs: '$ctrl',
        bindToController: true
    });
};

export default {
    controller: SystemStatusPageController,
    template: systemStatusPageTemplate
};

