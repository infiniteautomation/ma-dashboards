/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

function arrayInput() {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function($scope, $element, $attrs, ngModel) {
            ngModel.$parsers.push(function toArray(viewValue) {
                return (typeof viewValue === 'string') ? viewValue.split($attrs.arrayDelimiter || ',') : viewValue;
            });
            
            ngModel.$formatters.push(function fromArray(modelValue) {
                return angular.isArray(modelValue) ? modelValue.join($attrs.arrayDelimiter || ',') : modelValue;
            });
        }
    };
}

arrayInput.$inject = [];

return arrayInput;

}); // define
