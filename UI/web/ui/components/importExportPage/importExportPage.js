/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

ImportExportPageController.$inject = ['maImportExport', '$timeout', 'maUtil', 'maTranslate', '$mdColors'];
function ImportExportPageController(ImportExport, $timeout, Util, Translate, $mdColors) {
    this.ImportExport = ImportExport;
    this.$timeout = $timeout;
    this.Util = Util;
    this.Translate = Translate;
    
    this.downloadStatus = {};
    this.sectionsForExport = {};
    this.selectAllIndeterminate = false;
    this.indent = 3;
    this.accentColor = $mdColors.getThemeColor('accent');
}

ImportExportPageController.prototype.$onInit = function() {
    this.ImportExport.list().then(function(sectionList) {
        this.sectionList = sectionList;
    }.bind(this));
};

ImportExportPageController.prototype.selectAllChanged = function() {
    for (var i = 0; i < this.sectionList.length; i++) {
        var sectionName = this.sectionList[i];
        this.sectionsForExport[sectionName] = this.selectAll;
    }
    this.selectAllIndeterminate = false;
};

ImportExportPageController.prototype.checkIndeterminate = function() {
    var allChecked = true;
    var anyChecked = false;
    for (var i = 0; i < this.sectionList.length; i++) {
        var sectionName = this.sectionList[i];
        var sectionSelected = !!this.sectionsForExport[sectionName];
        allChecked = allChecked && sectionSelected;
        anyChecked = anyChecked || sectionSelected;
    }
    this.selectAllIndeterminate = anyChecked && !allChecked;
    this.selectAll = anyChecked;
};

ImportExportPageController.prototype.doExport = function(download) {
    var sectionNames = [];
    for (var sectionName in this.sectionsForExport) {
        if (this.sectionsForExport[sectionName]) {
            sectionNames.push(sectionName);
        }
    }
    
    var options = {};
    if (download) {
        options.responseType = 'blob';
    }
    
    this.downloadStatus.error = null;
    this.downloadStatus.downloading = download ? 'download' : 'export';
    
    this.downloadStatus.queryPromise = this.ImportExport.exportSections(sectionNames, options).then(function(exportedData) {
        this.downloadStatus.downloading = false;
        if (download) {
            this.Util.downloadBlob(exportedData, 'export.json');
        } else {
            this.exportedData = exportedData;
            this.writeIndentedJson();
        }
    }.bind(this), function(response) {
        this.downloadStatus.error = response.mangoStatusText;
        this.downloadStatus.downloading = false;
        console.log(response);
    }.bind(this));
};

ImportExportPageController.prototype.cancelExport = function() {
    if (this.downloadStatus.queryPromise) {
        this.downloadStatus.queryPromise.cancel();
    }
};

ImportExportPageController.prototype.fileDropped = function(data) {
    var types = data.getDataTransferTypes();
    if (types.length && types[0] === 'Files') {
        var transfer = data.getDataTransfer();
        if (transfer.length) {
            var file = transfer[0];
            if (!file.type || file.type === 'application/json' || file.type.indexOf('text/') === 0) {
                this.importFile(file);
            }
        }
    }
};

ImportExportPageController.prototype.fileSelected = function($event) {
    var fileInput = $event.target;
    if (fileInput.files && fileInput.files.length) {
        this.importFile(fileInput.files[0]);
        fileInput.value = null;
    }
};

ImportExportPageController.prototype.importFile = function(file) {
    delete this.importStatus;

    this.ImportExport.importData(file).then(function(importStatus) {
        this.importStatus = importStatus;
        this.getImportStatus();
    }.bind(this));
};

ImportExportPageController.prototype.getImportStatus = function() {
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

ImportExportPageController.prototype.cancelImport = function() {
    if (this.importStatus) {
        this.importStatus.cancel();
    }
};

ImportExportPageController.prototype.writeIndentedJson = function() {
    if (this.exportedData) {
        this.jsonString = angular.toJson(this.exportedData, this.indent);
    }
};

ImportExportPageController.prototype.clear = function() {
    delete this.exportedData;
    this.jsonString = '';
};

ImportExportPageController.prototype.editorChanged = function() {
    delete this.exportedData;
};

ImportExportPageController.prototype.copyToClipboard = function() {
    this.doCopy = {};
};

return {
    controller: ImportExportPageController,
    templateUrl: require.toUrl('./importExportPage.html')
};

}); // define
