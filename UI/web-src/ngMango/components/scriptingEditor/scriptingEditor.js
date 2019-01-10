/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './scriptingEditor.html';
import angular from 'angular';

const $inject = Object.freeze(['$scope', 'maScriptingEditor', 'maDialogHelper']);

class scriptingEditorController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, maScriptingEditor, maDialogHelper) {
        this.$scope = $scope;
        this.maScriptingEditor = maScriptingEditor;
        this.maDialogHelper = maDialogHelper;
   }

    $onInit() {
        this.ngModelCtrl.$render = () => this.render(); 
    }

    $onChanges(changes) {
    }

    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.scriptData.script);
    }

    render() {
        this.scriptData = new this.maScriptingEditor();
        this.scriptData.script = this.ngModelCtrl.$viewValue;
    }

    validate() {
        this.scriptData.context = this.context;

        if (this.resultDataType) {
            this.scriptData.resultDataType = this.resultDataType;
        }

        if (this.wrapInFunction) {
            this.scriptData.wrapInFunction = this.wrapInFunction;
        }

        if (this.permissions) {
            this.scriptData.permissions = this.permissions;
        }

        this.scriptErrors = null;
        this.scriptActions = null;
        this.scriptOutput = null;

        this.scriptData.validate().then(response => {
            this.scriptErrors = response.errors;
            this.scriptActions = response.actions;
            this.scriptOutput = response.scriptOutput;

            this.maDialogHelper.toastOptions({
                textTr: ['scriptingEditor.ui.scriptValidated'],
                hideDelay: 5000
            });
        }, error => {
            this.scriptErrors = error.data.result.messages;

            this.maDialogHelper.toastOptions({
                textTr: ['scriptingEditor.ui.scriptError'],
                hideDelay: 5000
            });
        });
    }

}

export default {
    bindings: {
        context: '<',
        resultDataType: '<?',
        wrapInFunction: '<?',
        permissions: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    controller: scriptingEditorController,
    template: componentTemplate
};