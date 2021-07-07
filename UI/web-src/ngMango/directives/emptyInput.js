/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

function emptyInput($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs, ngModel) {
            const emptyValueGetter = $parse($attrs.maEmptyInput);
            let wasUndefined = false;
            
            ngModel.$parsers.unshift(function (viewValue) {
                if (viewValue === '') {
                    const newValue = emptyValueGetter($scope);
                    if (newValue === undefined) {
                        wasUndefined = true;
                    }
                    return newValue;
                }
                return viewValue;
            });

            ngModel.$viewChangeListeners.push(function() {
                if (wasUndefined) {
                    ngModel.$setValidity('parse', true);
                    wasUndefined = false;
                }
            });
        }
    };
}

emptyInput.$inject = ['$parse'];

export default emptyInput;


