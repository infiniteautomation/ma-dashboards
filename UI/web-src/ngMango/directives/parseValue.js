/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

parseValue.$inject = ['$parse'];
function parseValue($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function($scope, $element, $attrs, ngModel) {
            if (!$attrs.maParseValue) return;
            
            const expression = $parse($attrs.maParseValue);

            ngModel.$parsers.push(value => {
                return expression($scope, {$value: value});
            });
        }
    };
}

export default parseValue;