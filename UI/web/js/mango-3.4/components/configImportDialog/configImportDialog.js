/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

ConfigImportDialogController.$inject = ['$mdDialog', 'ImportExport', '$timeout'];
function ConfigImportDialogController($mdDialog, ImportExport, $timeout) {
    this.$mdDialog = $mdDialog;
    this.ImportExport = ImportExport;
    this.$timeout = $timeout;
}

ConfigImportDialogController.prototype.$onInit = function() {
    this.doImport();
};

ConfigImportDialogController.prototype.close = function() {
    this.$mdDialog.hide();
};

ConfigImportDialogController.prototype.doImport = function() {
    this.ImportExport.importData(this.importData).then(function(importStatus) {
        this.importStatus = importStatus;
        this.getImportStatus();
    }.bind(this), function(response) {
        console.log('error importing file');
    }.bind(this));
};

ConfigImportDialogController.prototype.getImportStatus = function() {
    var $ctrl = this;
    if (this.importStatus) {
        this.importStatus.getStatus().then(function(status) {
            if ((status.state !== 'COMPLETED' || status.state !== 'CANCELLED') && status.progress !== 100) {
                $ctrl.$timeout(function() {
                    $ctrl.getImportStatus();
                }, 1000);
            }
        });
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
