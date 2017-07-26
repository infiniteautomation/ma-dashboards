/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

ConfigImportController.$inject = ['maDialogHelper', '$mdColors'];
function ConfigImportController(maDialogHelper, $mdColors) {
    this.maDialogHelper = maDialogHelper;
    
    this.accentColor = $mdColors.getThemeColor('accent');
}

ConfigImportController.prototype.$onInit = function() {
};

ConfigImportController.prototype.fileDropped = function(data) {
    var types = data.getDataTransferTypes();
    if (types.length && types[0] === 'Files') {
        var transfer = data.getDataTransfer();
        if (transfer.length) {
            var file = transfer[0];
            if (!file.type || file.type === 'application/json' || file.type.indexOf('text/') === 0) {
                this.maDialogHelper.showConfigImportDialog(file);
            }
        }
    }
};

ConfigImportController.prototype.fileSelected = function($event) {
    var fileInput = $event.target;
    if (fileInput.files && fileInput.files.length) {
        this.maDialogHelper.showConfigImportDialog(fileInput.files[0], $event);
        fileInput.value = '';
    }
};

ConfigImportController.prototype.doImport = function($event) {
    var data;
    try {
        data = angular.fromJson(this.jsonString);
    } catch (e) {
        data = e;
    }
    this.maDialogHelper.showConfigImportDialog(data, $event);
};

return {
    controller: ConfigImportController,
    templateUrl: require.toUrl('./configImport.html'),
    bindings: {
        jsonString: '<?'
    },
    designerInfo: {
        translation: 'ui.components.configImport',
        icon: 'import_export',
        hideFromMenu: true
    }
};

}); // define
