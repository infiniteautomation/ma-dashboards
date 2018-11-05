/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventHandlerEmailEditorTemplate from './eventHandlerEmailEditor.html';

class EventHandlerEmailEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope']; }
    
    constructor($scope) {
        this.$scope = $scope;
    }
    
    $onInit() {
        this.$scope.editor = this.editor;
    }
    
    $onChanges(changes) {
    }
}

export default {
    template: eventHandlerEmailEditorTemplate,
    controller: EventHandlerEmailEditorController,
    bindings: {
    },
    require: {
        editor: '^maEventHandlerEditor'
    }
};
