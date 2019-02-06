/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

flattenValues.$inject = ['$parse', 'maMultipleValues'];
function flattenValues($parse, MultipleValues) {
    return {
        require: ['ngModel', '^?mdInputContainer'],
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs, [ngModel, containerCtrl]) {
            let expression;
            if ($attrs.maFlattenValues) {
                expression = $parse($attrs.maFlattenValues);
            }
            
            ngModel.$formatters.push(function multipleValueFormatter(value) {
                if (value instanceof MultipleValues) {
                    let result;
                    if (expression) {
                        result = expression($scope, {$values: value});
                    }
                    if (containerCtrl) {
                        // the mdInputContainer adds a formatter which runs before this one which sets the
                        // .md-input-has-value class, work around by setting it again
                        containerCtrl.setHasValue(!ngModel.$isEmpty(result));
                    }
                    return result;
                }
                return value;
            });
        }
    };
}

export default flattenValues;