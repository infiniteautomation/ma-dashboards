/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './eventHandlerProcessEditor.html';

const $inject = Object.freeze(['$scope', 'maEventHandler', 'maDialogHelper']);

class eventHandlerProcessEditorController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, maEventHandler, maDialogHelper) {
        this.$scope = $scope;
        this.maEventHandler = maEventHandler;
        this.maDialogHelper = maDialogHelper;
   }

    $onInit() {
        this.$scope.editor = this.editor;
    }

    runActiveCommand() {
        this.runCommand(
            this.$scope.editor.eventHandler.activeProcessCommand,
            this.$scope.editor.eventHandler.activeProcessTimeout
        );
    }

    runInactiveCommand() {
        this.runCommand(
            this.$scope.editor.eventHandler.inactiveProcessCommand,
            this.$scope.editor.eventHandler.inactiveProcessTimeout
        );
    }

    runCommand(command, timeout) {
        this.commandResponse = null;

        this.maEventHandler.runCommand(command, timeout).then(
            response => {
                this.maDialogHelper.toast(['eventHandlers.commandExcuted']);
                this.commandResponse = response;
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['eventHandlers.commandError', error.data.cause],
                classes: 'md-warn'
            }); 
        });
    }

}

export default {
    bindings: {},
    require: {
        editor: '^maEventHandlerEditor'
    },
    controller: eventHandlerProcessEditorController,
    template: componentTemplate
};