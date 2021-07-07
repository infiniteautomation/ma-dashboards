/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

arrayInput.$inject = [];
function arrayInput() {
    return {
        require: ['ngModel', '^?mdInputContainer'],
        restrict: 'A',
        link: function($scope, $element, $attrs, [ngModel, containerCtrl]) {
            ngModel.$parsers.push(function toArray(viewValue) {
                if (typeof viewValue !== 'string') return viewValue;
                if (!viewValue.trim().length) return [];
                return viewValue.split($attrs.arrayDelimiter || ',').map(p => p.trim());
            });
            
            ngModel.$formatters.push(function fromArray(modelValue) {
                if (!Array.isArray(modelValue)) return modelValue;
                const result = modelValue.map(p => p.trim()).join($attrs.arrayDelimiter || ', ');
                if (containerCtrl) {
                    // the mdInputContainer adds a formatter which runs before this one which sets the
                    // .md-input-has-value class, work around by setting it again
                    containerCtrl.setHasValue(!ngModel.$isEmpty(result));
                }
                return result;
            });
        }
    };
}

export default arrayInput;