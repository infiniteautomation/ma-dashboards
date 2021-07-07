/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maFormName
 * @restrict A
 * @description Simple directive that sets the form control name.
 */

class FormNameController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }

    $onChanges(changes) {
        if (changes.formName) {
            this.formCtrl.$maName = this.formName || '';
        }
    }
}

formNameDirective.$inject = [];
function formNameDirective() {
    return {
        restrict: 'A',
        require: {
            formCtrl: 'form'
        },
        controller: FormNameController,
        bindToController: {
            formName: '@maFormName'
        }
    };
}

export default formNameDirective;