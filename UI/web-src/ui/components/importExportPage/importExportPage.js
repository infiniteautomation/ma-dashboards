/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import importExportPageTemplate from './importExportPage.html';

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
    for (let i = 0; i < this.sectionList.length; i++) {
        const sectionName = this.sectionList[i];
        this.sectionsForExport[sectionName] = this.selectAll;
    }
    this.selectAllIndeterminate = false;
};

ImportExportPageController.prototype.checkIndeterminate = function() {
    let allChecked = true;
    let anyChecked = false;
    for (let i = 0; i < this.sectionList.length; i++) {
        const sectionName = this.sectionList[i];
        const sectionSelected = !!this.sectionsForExport[sectionName];
        allChecked = allChecked && sectionSelected;
        anyChecked = anyChecked || sectionSelected;
    }
    this.selectAllIndeterminate = anyChecked && !allChecked;
    this.selectAll = anyChecked;
};

ImportExportPageController.prototype.doExport = function(download) {
    const sectionNames = [];
    for (const sectionName in this.sectionsForExport) {
        if (this.sectionsForExport[sectionName]) {
            sectionNames.push(sectionName);
        }
    }
    
    const options = {
        timeout: 0
    };
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
    const types = data.getDataTransferTypes();
    if (types.includes('Files')) {
        const transfer = data.getDataTransfer();
        if (transfer.length) {
            const file = transfer[0];
            if (!file.type || file.type === 'application/json' || file.type.indexOf('text/') === 0) {
                this.importFile(file);
            }
        }
    }
};

ImportExportPageController.prototype.fileSelected = function($event) {
    const fileInput = $event.target;
    if (fileInput.files && fileInput.files.length) {
        this.importFile(fileInput.files[0]);
        fileInput.value = null;
    }
};

ImportExportPageController.prototype.importFile = function(file) {
    delete this.importStatus;

    this.ImportExport.importData(file, {timeout: 0}).then(function(importStatus) {
        this.importStatus = importStatus;
        this.getImportStatus();
    }.bind(this));
};

ImportExportPageController.prototype.getImportStatus = function() {
    const $ctrl = this;
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

export default {
    controller: ImportExportPageController,
    template: importExportPageTemplate
};


