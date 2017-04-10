/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';

DialogHelperFactory.$inject = ['$mdDialog', '$mdMedia'];
function DialogHelperFactory($mdDialog, $mdMedia) {
    function DialogHelper() {
    }
    
    DialogHelper.prototype.showDialog = function(templateUrl, locals, $event) {
        return $mdDialog.show({
            controller: function() {},
            templateUrl: templateUrl,
            targetEvent: $event,
            clickOutsideToClose: false,
            escapeToClose: false,
            fullscreen: $mdMedia('xs') || $mdMedia('sm'),
            controllerAs: '$ctrl',
            bindToController: true,
            locals: locals
        });
    };
    
    DialogHelper.prototype.showConfigImportDialog = function(importData, $event) {
        var locals = {importData: importData};
        var templateUrl = require.toUrl('../components/configImportDialog/configImportDialogContainer.html');
        return this.showDialog(templateUrl, locals, $event);
    };
    
    return new DialogHelper();
}

return DialogHelperFactory;

});
