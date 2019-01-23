/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './eventHandlerSetPointEditor.html';

const $inject = Object.freeze(['$scope']);

class eventHandlerSetPointEditorController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope) {
        this.$scope = $scope;
    }

    $onInit() {
        this.$scope.editor = this.editor;
        console.log(this.editor.eventHandler.targetPointXid);
    }

}

export default {
    bindings: {},
    require: {
        editor: '^maEventHandlerEditor'
    },
    controller: eventHandlerSetPointEditorController,
    template: componentTemplate
};