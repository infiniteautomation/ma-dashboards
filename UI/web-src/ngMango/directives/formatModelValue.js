/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

formatModelValue.$inject = ['$parse'];
function formatModelValue($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function($scope, $element, $attrs, ngModel) {
            let expression;
            if ($attrs.formatModelValue) {
                expression = $parse($attrs.formatModelValue);
            }
            
            ngModel.$formatters.push(function(value) {
                if (expression) {
                    return expression($scope, {$modelValue: value});
                }
                return value;
            });
        }
    };
}

export default formatModelValue;