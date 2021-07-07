/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
