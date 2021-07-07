/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import durationEditorTemplate from './durationEditor.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDurationEditor
 * @restrict E
 * @description Displays an editor for a duration object with periods and type properties
 */

class DurationEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['MA_TIME_PERIOD_TYPES']; }
    
    constructor(MA_TIME_PERIOD_TYPES) {
        this.allTypes = MA_TIME_PERIOD_TYPES;
        this.types = MA_TIME_PERIOD_TYPES.slice();
        
        this.min = 0;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
        if (changes.allowedTypes) {
            if (Array.isArray(this.allowedTypes)) {
                this.types = this.allTypes.filter(t => this.allowedTypes.includes(t.type));
            } else {
                this.types = [];
            }
        }
        
        // work around for https://github.com/angular/material/issues/11679
        if (changes.requiredAttr) {
            this.required = this.requiredAttr;
        }
    }
    
    inputChanged() {
        this.ngModelCtrl.$setViewValue(Object.assign({}, this.duration));
    }
    
    render() {
        this.duration = this.ngModelCtrl.$viewValue;
    }
}

export default {
    template: durationEditorTemplate,
    controller: DurationEditorController,
    bindings: {
        allowedTypes: '<?',
        min: '<?',
        requiredAttr: '@?required',
        disabled: '@?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    transclude: {
        periodsLabel: '?maPeriodsLabel',
        typeLabel: '?maTypeLabel'
    },
    designerInfo: {
        translation: 'ui.components.durationEditor',
        icon: 'access_time'
    }
};
