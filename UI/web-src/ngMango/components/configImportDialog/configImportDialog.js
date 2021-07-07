/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import configImportDialogTemplate from './configImportDialog.html';

ConfigImportDialogController.$inject = ['$mdDialog', 'maImportExport', '$timeout', '$element', '$q'];
function ConfigImportDialogController($mdDialog, ImportExport, $timeout, $element, $q) {
    this.$mdDialog = $mdDialog;
    this.ImportExport = ImportExport;
    this.$timeout = $timeout;
    this.$element = $element;
    this.$q = $q;
}

ConfigImportDialogController.prototype.$onInit = function() {
    this.doImport();
};

ConfigImportDialogController.prototype.close = function() {
    this.$mdDialog.hide();
};

ConfigImportDialogController.prototype.getMessagesDiv = function() {
    if (this.messagesDiv) return this.messagesDiv;
    const $messagesDiv = this.$element.maFind('.ma-config-import-messages');
    if ($messagesDiv.length) {
        return (this.messagesDiv = $messagesDiv[0]);
    }
};

ConfigImportDialogController.prototype.updateScrollPosition = function() {
    const messagesDiv = this.getMessagesDiv();
    if (messagesDiv) {
        if (messagesDiv !== document.activeElement) {
            this.$timeout(function() {
                if (messagesDiv !== document.activeElement) {
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                }
            });
        }
    }
};

ConfigImportDialogController.prototype.doImport = function() {
    if (this.importData instanceof Error) {
        this.error = this.importData;
        return;
    }
    delete this.error;
    
    this.ImportExport.importData(this.importData, {timeout: 0}).then(function(importStatus) {
        this.importStatus = importStatus;
        
        this.updateScrollPosition();
        
        // start polling
        this.getImportStatus();
    }.bind(this), function(error) {
        this.error = error.mangoStatusText;
    }.bind(this));
};

ConfigImportDialogController.prototype.getImportStatus = function(retryCount = 0) {
    if (this.importStatus) {
        this.importStatus.getStatus().then(status => {
            this.updateScrollPosition();
            this.updateProgress();
            
            if ((status.state !== 'COMPLETED' || status.state !== 'CANCELLED') && status.progress !== 100) {
                this.timeoutPromise = this.$timeout(() => {
                    this.getImportStatus();
                }, 1000);
            }
        }, error => {
            this.updateProgress();

            if (retryCount < 3) {
                this.timeoutPromise = this.$timeout(() => {
                    this.getImportStatus(retryCount + 1);
                }, 5000);
            } else {
                this.doCancel();
                this.error = error.mangoStatusText;
            }
        });
    }
};

ConfigImportDialogController.prototype.updateProgress = function() {
    this.progress = Math.floor(this.importStatus && this.importStatus.progress || 0);
};

ConfigImportDialogController.prototype.cancelImport = function() {
    if (this.cancelPromise) return;
    
    this.cancelPromise = this.doCancel().finally(() => {
        delete this.cancelPromise;
    });
    
    if (this.timeoutPromise) {
        this.$timeout.cancel(this.timeoutPromise);
    }
    
    this.close();
};

ConfigImportDialogController.prototype.doCancel = function(retryCount = 0) {
    return this.importStatus.cancel().then(null, () => {
        if (retryCount < 3) {
            return this.$timeout(angular.noop, 5000).then(() => {
                return this.doCancel(retryCount + 1);
            });
        }
        return this.$q.reject('cancel failed');
    });
};

export default {
    controller: ConfigImportDialogController,
    template: configImportDialogTemplate,
    bindings: {
        importData: '<'
    },
    designerInfo: {
        translation: 'ui.components.configImportDialog',
        icon: 'import_export',
        hideFromMenu: true
    }
};


