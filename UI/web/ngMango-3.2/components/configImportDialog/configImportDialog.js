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
        
        // start polling
        this.getImportStatus();
    }.bind(this), function(response) {
        this.error = 'HTTP ' + response.status + ': ';
        if (response.data && response.data.message) {
            this.error += response.data.message;
        }
    }.bind(this));
};

ConfigImportDialogController.prototype.getImportStatus = function() {
    if (this.importStatus) {
        this.importStatus.getStatus().then(function(status) {
            this.updateScrollPosition();
            if ((status.state !== 'COMPLETED' || status.state !== 'CANCELLED') && status.progress !== 100) {
                this.$timeout(function() {
                    this.getImportStatus();
                }.bind(this), 1000);
            }
        }.bind(this));
    }
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
    }
};

}); // define
