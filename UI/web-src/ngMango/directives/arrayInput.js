/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

arrayInput.$inject = [];
function arrayInput() {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function($scope, $element, $attrs, ngModel) {
            ngModel.$parsers.push(function toArray(viewValue) {
                if (typeof viewValue !== 'string') return viewValue;
                if (!viewValue.trim().length) return [];
                return viewValue.split($attrs.arrayDelimiter || ',').map(p => p.trim());
            });
            
            ngModel.$formatters.push(function fromArray(modelValue) {
                if (!Array.isArray(modelValue)) return modelValue;
                return modelValue.map(p => p.trim()).join($attrs.arrayDelimiter || ', ');
            });
        }
    };
}

export default arrayInput;