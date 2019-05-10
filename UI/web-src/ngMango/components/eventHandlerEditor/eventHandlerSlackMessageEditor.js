/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './eventHandlerSlackMessageEditor.html';

const $inject = Object.freeze(['$scope']);

class eventHandlerSlackEditorController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope) {
        this.$scope = $scope;
    }

    $onInit() {
        this.$scope.editor = this.editor;
    }

    

}

export default {
    bindings: {},
    require: {
        editor: '^maEventHandlerEditor'
    },
    controller: eventHandlerSlackEditorController,
    template: componentTemplate
};