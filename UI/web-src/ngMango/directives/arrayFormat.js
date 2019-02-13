/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

arrayFormat.$inject = ['$parse'];
function arrayFormat($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function($scope, $element, $attrs, ngModel) {
            const expression = $parse($attrs.maArrayFormat);
            const method = $attrs.maArrayFormatMethod || 'map';

            ngModel.$formatters.push(value => {
                if (!Array.isArray(value)) return value;

                return value[method](($item, $index, $array) => {
                    return expression($scope, {$item, $index, $array, $args: arguments});
                });
            });
        }
    };
}

export default arrayFormat;