/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import fileStoreDialogTemplate from './fileStoreDialog.html';

fileStoreDialog.$inject = ['$mdDialog', '$mdMedia'];
function fileStoreDialog($mdDialog, $mdMedia) {
    function FileStoreDialog() {
    }

    FileStoreDialog.prototype.show = function($event, path, options) {
        return $mdDialog.show({
            controller: function() {
                this.close = function(event) {
                    $mdDialog.cancel();
                };
                
                this.done = function(event) {
                    if (this.editingFile) {
                        this.saveEditFile(event).then(() => {
                            $mdDialog.hide(this.path);
                        });
                    } else {
                        $mdDialog.hide(this.path);
                    }
                };
            },
            template: fileStoreDialogTemplate,
            targetEvent: $event,
            clickOutsideToClose: true,
            escapeToClose: true,
            fullscreen: $mdMedia('xs') || $mdMedia('sm'),
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                path: path,
                options: options
            }
        });
    };

    return new FileStoreDialog();
}

export default fileStoreDialog;


