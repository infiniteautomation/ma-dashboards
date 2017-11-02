/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

ConfigImportDialogController.$inject = ['$mdDialog', 'maImportExport', '$timeout', '$element'];
function ConfigImportDialogController($mdDialog, ImportExport, $timeout, $element) {
    this.$mdDialog = $mdDialog;
    this.ImportExport = ImportExport;
    this.$timeout = $timeout;
    this.$element = $element;
}

ConfigImportDialogController.prototype.$onInit = function() {
    this.doImport();
};

ConfigImportDialogController.prototype.close = function() {
    this.$mdDialog.hide();
};

ConfigImportDialogController.prototype.getMessagesDiv = function() {
    if (this.messagesDiv) return this.messagesDiv;
    var $messagesDiv = this.$element.find('.ma-config-import-messages');
    if ($messagesDiv.length) {
        return (this.messagesDiv = $messagesDiv[0]);
    }
};

ConfigImportDialogController.prototype.updateScrollPosition = function() {
    var messagesDiv = this.getMessagesDiv();
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
    
    this.ImportExport.importData(this.importData).then(function(importStatus) {
        this.importStatus = importStatus;
        
        this.updateScrollPosition();
        this.updateProgress();
        
        // start polling
        this.getImportStatus();
    }.bind(this), function(error) {
        this.error = error.mangoStatusText;
    }.bind(this));
};

ConfigImportDialogController.prototype.getImportStatus = function() {
    if (this.importStatus) {
        this.importStatus.getStatus().then(status => {
            this.updateScrollPosition();
            this.updateProgress();
            
            if ((status.state !== 'COMPLETED' || status.state !== 'CANCELLED') && status.progress !== 100) {
                this.$timeout(() => {
                    this.getImportStatus();
                }, 1000);
            }
        }, error => {
            this.updateProgress();
            
            if (this.importStatus.errors == null) {
                this.importStatus.errors = 0;
            }
            this.importStatus.errors++;
            
            // retry 10 times
            if (this.importStatus.errors < 10) {
                this.$timeout(() => {
                    this.getImportStatus();
                }, 1000);
            } else {
                this.importStatus.cancel();
                this.error = error.mangoStatusText;
            }
        });
    }
};

ConfigImportDialogController.prototype.updateProgress = function() {
    this.progress = Math.floor(this.inportStatus.progress || 0);
};

ConfigImportDialogController.prototype.cancelImport = function() {
    if (this.importStatus) {
        this.importStatus.cancel();
    }
    this.close();
};

return {
    controller: ConfigImportDialogController,
    templateUrl: require.toUrl('./configImportDialog.html'),
    bindings: {
        importData: '<'
    },
    designerInfo: {
        translation: 'ui.components.configImportDialog',
        icon: 'import_export',
        hideFromMenu: true
    }
};

}); // define
