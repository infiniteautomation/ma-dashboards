/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import textAreaDialogTemplate from './textAreaDialog.html';
import systemStatusPageTemplate from './systemStatusPage.html';

class SystemStatusPageController {

    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maSystemStatus', '$state', 'maUiMenu', '$mdMedia', '$mdDialog', 'maTranslate',
        'maDialogHelper', 'maUiDateBar', '$scope', 'maRqlBuilder', 'maLogFile']; }

    constructor(systemStatus, $state, maUiMenu, $mdMedia, $mdDialog, maTranslate,
            maDialogHelper, maUiDateBar, $scope, RqlBuilder, maLogFile) {
        
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
        this.maLogFile = maLogFile;
    
        this.logByFileNameUrl = '/rest/latest/logging/view/';
    
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
    
    $onInit() {
        if (this.$state.includes('ui.settings.systemStatus.loggingConsole')) {
            if (this.$state.params.filename) {
                const filename = this.$state.params.filename;
                this.selectedLogFile = new this.maLogFile({filename});
                this.displayLogFile();
            }
        }
    }

    pageChanged(name) {
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
        case 'workItems': this.getWorkItems(); break;
        case 'threads': this.getThreads(); break;
        case 'serverInfo': this.getSystemInfo(); break;
        
        }
    }
    
    /** Audit Context **/
    
    displayAuditContext(auditEvent) {
        const context = angular.copy(auditEvent.context);
    //    if (context.jsonData) {
    //        context.jsonData = JSON.parse(context.jsonData);
    //    }
        const content = JSON.stringify(context, null, 2);
        const title = this.maTranslate.trSync('ui.settings.systemStatus.displayingAuditContext', auditEvent.message);
    
        this.showTextAreaDialog(title, content);
    }
    
    updateAuditQuery() {
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
    }
    
    /** Internal Metrics **/
    
    getInternalMetrics() {
        this.systemStatus.getInternalMetrics().then((response) => {
            this.internalMetrics = response.data;
        });
    }
    
    /** Server Info **/

    displayCurrentLogFile() {
        this.selectedLogFile = new this.maLogFile({filename: 'ma.log'});
        this.displayLogFile();
    }
    
    displayLogFile() {
        const filename = this.selectedLogFile.filename;

        this.$state.params.filename = filename;
        this.$state.go('.', this.$state.params, {location: 'replace', notify: false});

        this.selectedLogFile.getContents().then(contents => {
            const title = this.maTranslate.trSync(['ui.settings.systemStatus.displayingLogFile', filename]);
    
            this.showTextAreaDialog(title, contents).catch(e => null).finally(() => {
                this.$state.params.filename = null;
                this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
                this.selectedLogFile = null;
            });
        });
    }
    
    /** Server Info **/
    
    getSystemInfo() {
        this.systemStatus.getFullSystemInfo().then((response) => {
            this.systemInfo = response.data;
        });
    }
    
    getPointCounts() {
        this.systemStatus.getPointCounts().then((response) => {
            this.pointCounts = response.data;
        });
    }
    
    /** Threads **/
    
    getThreads() {
        this.systemStatus.getThreads().then((response) => {
            this.threads = response.data;
        });
    }
    
    showBlockedThreadDetails($event, thread) {
        // stops the click handler for the row running and closing this dialog
        $event.stopPropagation();
        
        this.maDialogHelper.showBasicDialog($event, {
            titleTr: 'ui.settings.systemStatus.blockedThreadDetails',
            contentTemplate: `<p>lockOwnerName: ${thread.lockOwnerName}</p>
                <p>lockOwnerId: ${thread.lockOwnerId}</p>
                <p>className: ${thread.lockInfo && thread.lockInfo.className}</p>
                <p>identityHashCode: ${thread.lockInfo && thread.lockInfo.identityHashCode}</p>`
        });
    }
    
    showStackTrace(selectedThread) {
        this.selectedThreadStackTrace = '';
        selectedThread.location.forEach((item) => {
            this.selectedThreadStackTrace += `${item.className}.${item.methodName}:${item.lineNumber}\n`;
        });
    
        const content = this.selectedThreadStackTrace;
        const title = this.maTranslate.trSync('ui.settings.systemStatus.displayingStackTraceForThread', selectedThread.name);
    
        this.showTextAreaDialog(title, content);
    }
    
    /** Work Items **/
    
    getWorkItems() {
        this.systemStatus.getWorkItemsQueueCounts().then((response) => {
            this.workItemsQueueCounts = response.data;
        });
    
        this.systemStatus.getWorkItemsRunningStats().then((response) => {
            this.workItemsRunningStats = response.data;
        });
    
        this.systemStatus.getWorkItemsRejectedStats().then((response) => {
            this.workItemsRejectedStats = response.data;
        });
    }
    
    isEmptyObj(obj) {
        if (obj === undefined) {
            return true;
        }
        return Object.keys(obj).length === 0;
    }

    showTextAreaDialog(title, textContent) {
        let $this = this;
        return this.$mdDialog.show({
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
    }
}

export default {
    controller: SystemStatusPageController,
    template: systemStatusPageTemplate
};
