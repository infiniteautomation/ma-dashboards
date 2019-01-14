/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

flattenValues.$inject = ['$parse', 'maMultipleValues'];
function flattenValues($parse, MultipleValues) {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs, ngModel) {
            
            let expression;
            if ($attrs.maMultipleValue) {
                expression = $parse($attrs.maMultipleValue);
            }
            
            ngModel.$formatters.push(function multipleValueFormatter(value) {
                if (value instanceof MultipleValues) {
                    if (expression) {
                        return expression($scope, {$values: value});
                    }
                    return undefined;
                }
                return value;
            });
        }
    };
}

export default flattenValues;