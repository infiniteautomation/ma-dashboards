/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

lessThan.$inject = [];
function lessThan() {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function($scope, $element, $attrs, ngModel) {
            let lessThan;
            
            $attrs.$observe('maLessThan', val => {
                const value = typeof val === 'string' ? Number.parseFloat(val) : val;
                lessThan = typeof value === 'number' && !Number.isNaN(value) ? value : undefined;
                ngModel.$validate();
            });
            
            ngModel.$validators.lessThan = function(modelValue, viewValue) {
                return viewValue == null || !viewValue.length || lessThan == null || viewValue < lessThan;
            };
        }
    };
}

export default lessThan;