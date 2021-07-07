/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

greaterThan.$inject = [];
function greaterThan() {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function($scope, $element, $attrs, ngModel) {
            let greaterThan;
            
            $attrs.$observe('maGreaterThan', val => {
                const value = typeof val === 'string' ? Number.parseFloat(val) : val;
                greaterThan = typeof value === 'number' && !Number.isNaN(value) ? value : undefined;
                ngModel.$validate();
            });
            
            ngModel.$validators.greaterThan = function(modelValue, viewValue) {
                return viewValue == null || !viewValue.length || greaterThan == null || viewValue > greaterThan;
            };
        }
    };
}

export default greaterThan;