/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import configExportTemplate from './configExport.html';
import angular from 'angular';

ConfigExportController.$inject = ['maImportExport', 'maUtil', 'maTranslate'];
function ConfigExportController(ImportExport, Util, Translate) {
    this.ImportExport = ImportExport;
    this.Util = Util;
    this.Translate = Translate;
    
    this.downloadStatus = {};
    this.sectionsForExport = {};
    this.selectAllIndeterminate = false;
    this.indent = 2;
    this.noSectionsSelected = true;
}

ConfigExportController.prototype.$onInit = function() {
    this.ImportExport.list().then(function(sectionList) {
        this.sectionList = sectionList;
    }.bind(this));
};

ConfigExportController.prototype.selectAllChanged = function() {
    for (let i = 0; i < this.sectionList.length; i++) {
        const sectionName = this.sectionList[i].value;
        this.sectionsForExport[sectionName] = this.selectAll;
    }
    this.selectAllIndeterminate = false;
    this.noSectionsSelected = !this.selectAll;
};

ConfigExportController.prototype.checkIndeterminate = function() {
    let allChecked = true;
    let anyChecked = false;
    for (let i = 0; i < this.sectionList.length; i++) {
        const sectionName = this.sectionList[i].value;
        const sectionSelected = !!this.sectionsForExport[sectionName];
        allChecked = allChecked && sectionSelected;
        anyChecked = anyChecked || sectionSelected;
    }
    this.selectAllIndeterminate = anyChecked && !allChecked;
    this.selectAll = anyChecked;
    this.noSectionsSelected = !anyChecked;
};

ConfigExportController.prototype.doExport = function(download) {
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

ConfigExportController.prototype.cancelExport = function() {
    if (this.downloadStatus.queryPromise) {
        this.downloadStatus.queryPromise.cancel();
    }
};

ConfigExportController.prototype.writeIndentedJson = function() {
    if (this.exportedData) {
        this.jsonString = angular.toJson(this.exportedData, this.indent);
        if (this.onExport) {
            this.onExport({$json: this.jsonString});
        }
        delete this.exportedData;
    }
};

export default {
    controller: ConfigExportController,
    template: configExportTemplate,
    bindings: {
        onExport: '&?'
    },
    designerInfo: {
        translation: 'ui.components.configExport',
        icon: 'import_export',
        hideFromMenu: true
    }
};


