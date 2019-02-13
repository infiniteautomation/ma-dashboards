/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

parseArray.$inject = ['$parse'];
function parseArray($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function($scope, $element, $attrs, ngModel) {
            if (!$attrs.maParseArray) return;
            
            const expression = $parse($attrs.maParseArray);
            const method = $attrs.maParseArrayMethod || 'map';

            ngModel.$parsers.push(value => {
                if (!Array.isArray(value)) return value;

                return value[method](($item, $index, $array) => {
                    return expression($scope, {$item, $index, $array, $args: arguments});
                });
            });
        }
    };
}

export default parseArray;