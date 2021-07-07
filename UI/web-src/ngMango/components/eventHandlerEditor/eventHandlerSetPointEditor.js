/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
    }

    changeTargetPoint() {
        if (this.targetPoint) {
            this.$scope.editor.eventHandler.targetPointXid = this.targetPoint.xid;
        }
    }

    changeActivePoint() {
        if (this.activePoint) {
            this.$scope.editor.eventHandler.activePointXid = this.activePoint.xid;
        }
    }

    changeInactivePoint() {
        if (this.inactivePoint) {
            this.$scope.editor.eventHandler.inactivePointXid = this.inactivePoint.xid;
        }
    }

    targetPointIs(dataType) {
        if (this.targetPoint) {
            return this.targetPoint.dataType === dataType;
        } else {
            return dataType === 'ALPHANUMERIC';
        }
    }

    clearActiveActionInputs() {
        this.changeActivePoint();
        this.$scope.editor.eventHandler.activeValueToSet = null;
        this.$scope.editor.eventHandler.activeScript = null;
    }

    clearInactiveActionInputs() {
        this.changeInactivePoint();
        this.$scope.editor.eventHandler.inactiveValueToSet = null;
        this.$scope.editor.eventHandler.inactiveScript = null;
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