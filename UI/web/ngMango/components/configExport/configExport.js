/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

ConfigExportController.$inject = ['maImportExport', 'maUtil', 'maTranslate'];
function ConfigExportController(ImportExport, Util, Translate) {
    this.ImportExport = ImportExport;
    this.Util = Util;
    this.Translate = Translate;
    
    this.downloadStatus = {};
    this.sectionsForExport = {};
    this.selectAllIndeterminate = false;
    this.indent = 2;
}

ConfigExportController.prototype.$onInit = function() {
    this.ImportExport.list().then(function(sectionList) {
        this.sectionList = sectionList;
    }.bind(this));
};

ConfigExportController.prototype.selectAllChanged = function() {
    for (var i = 0; i < this.sectionList.length; i++) {
        var sectionName = this.sectionList[i].value;
        this.sectionsForExport[sectionName] = this.selectAll;
    }
    this.selectAllIndeterminate = false;
};

ConfigExportController.prototype.checkIndeterminate = function() {
    var allChecked = true;
    var anyChecked = false;
    for (var i = 0; i < this.sectionList.length; i++) {
        var sectionName = this.sectionList[i].value;
        var sectionSelected = !!this.sectionsForExport[sectionName];
        allChecked = allChecked && sectionSelected;
        anyChecked = anyChecked || sectionSelected;
    }
    this.selectAllIndeterminate = anyChecked && !allChecked;
    this.selectAll = anyChecked;
};

ConfigExportController.prototype.doExport = function(download) {
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
        this.downloadStatus.error = response.statusText || response.message || (response.status === -1 ?
                this.Translate.trSync('ui.app.cancelledOrNoResponse') :
                response.toString());
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

return {
    controller: ConfigExportController,
    templateUrl: require.toUrl('./configExport.html'),
    bindings: {
        onExport: '&?'
    },
    designerInfo: {
        translation: 'ui.components.configExport',
        icon: 'import_export',
        hideFromMenu: true
    }
};

}); // define
