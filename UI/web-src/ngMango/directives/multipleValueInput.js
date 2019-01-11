/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

multipleValueInput.$inject = ['$parse'];
function multipleValueInput($parse) {
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
                if (value != null && typeof value.isAllEqual === 'function') {
                    if (expression) {
                        return expression($scope, {$multiple: value});
                    }
                    return undefined;
                }
                return value;
            });
        }
    };
}

export default multipleValueInput;