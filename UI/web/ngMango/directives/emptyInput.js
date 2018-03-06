/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

function emptyInput($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs, ngModel) {
            var emptyValueGetter = $parse($attrs.maEmptyInput);
            var wasUndefined = false;
            
            ngModel.$parsers.unshift(function (viewValue) {
                if (viewValue === '') {
                    var newValue = emptyValueGetter($scope);
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


