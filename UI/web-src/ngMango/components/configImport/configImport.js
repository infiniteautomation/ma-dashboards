/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import configImportTemplate from './configImport.html';

ConfigImportController.$inject = ['maDialogHelper', '$mdColors'];
function ConfigImportController(maDialogHelper, $mdColors) {
    this.maDialogHelper = maDialogHelper;
    
    this.accentColor = $mdColors.getThemeColor('accent');
}

ConfigImportController.prototype.$onInit = function() {
};

ConfigImportController.prototype.fileDropped = function(data) {
    const types = data.getDataTransferTypes();
    if (types.includes('Files')) {
        const transfer = data.getDataTransfer();
        if (transfer.length) {
            const file = transfer[0];
            if (!file.type || file.type === 'application/json' || file.type.indexOf('text/') === 0) {
                this.maDialogHelper.showConfigImportDialog(file);
            }
        }
    }
};

ConfigImportController.prototype.fileSelected = function($event) {
    const fileInput = $event.target;
    if (fileInput.files && fileInput.files.length) {
        this.maDialogHelper.showConfigImportDialog(fileInput.files[0], $event);
        fileInput.value = '';
    }
};

ConfigImportController.prototype.doImport = function($event) {
    let data;
    try {
        data = angular.fromJson(this.jsonString);
    } catch (e) {
        data = e;
    }
    this.maDialogHelper.showConfigImportDialog(data, $event);
};

export default {
    controller: ConfigImportController,
    template: configImportTemplate,
    bindings: {
        jsonString: '<?'
    },
    designerInfo: {
        translation: 'ui.components.configImport',
        icon: 'import_export',
        hideFromMenu: true
    }
};


