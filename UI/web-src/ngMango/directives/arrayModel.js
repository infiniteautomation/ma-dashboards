/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

arrayModel.$inject = ['$parse'];
function arrayModel($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function($scope, $element, $attrs, ngModel) {
            const fnName = $attrs.maArrayModel || 'map';

            const parseExpression = $parse($attrs.maArrayModelParse);
            const formatExpression = $parse($attrs.maArrayModelFormat);

            ngModel.$parsers.push(value => {
                if (!Array.isArray(value)) return value;

                return value[fnName](($item, $index, $array) => {
                    return parseExpression($scope, {$item, $index, $array});
                });
            });
            
            ngModel.$formatters.push(value => {
                if (!Array.isArray(value)) return value;

                return value[fnName](($item, $index, $array) => {
                    return formatExpression($scope, {$item, $index, $array});
                });
            });
        }
    };
}

export default arrayModel;