/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */




bracketEscape.$inject = [];
function bracketEscape() {
    var escapeRegExp = /{{(.*?)}}/g;
    var unescapeRegExp = /%7B%7B(.*?)%7D%7D/gi;
    
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function($scope, $element, $attrs, ngModel) {
            ngModel.$parsers.unshift(function toArray(viewValue) {
                return (typeof viewValue === 'string') ? viewValue.replace(escapeRegExp, '%7B%7B$1%7D%7D') : viewValue;
            });
            
            ngModel.$formatters.push(function fromArray(modelValue) {
                return (typeof modelValue === 'string') ? modelValue.replace(unescapeRegExp, '{{$1}}') : modelValue;
            });
        }
    };
}

export default bracketEscape;


