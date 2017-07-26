/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function emptyInput($parse) {
    var UNDEFINED = {};
    
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
                    if (angular.isUndefined(newValue)) {
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

return emptyInput;

}); // define
