/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

permissionExpressionDirective.$inject = [];
function permissionExpressionDirective() {
    return {
        require: ['ngModel', '^?mdInputContainer'],
        restrict: 'A',
        link: function($scope, $element, $attrs, [ngModel, containerCtrl]) {
            ngModel.$parsers.push(function toArray(viewValue) {
                if (typeof viewValue !== 'string') return viewValue;

                return viewValue.trim().split(/\s*,\s*/)
                    .map(str => str.split(/\s*[&]\s*/).filter(r => !!r))
                    .filter(minterm => minterm.length);
            });
            
            ngModel.$formatters.push(function fromArray(modelValue) {
                if (!Array.isArray(modelValue)) return modelValue;
                
                const result = modelValue.map(minterm => {
                    if (typeof minterm === 'string') {
                        return minterm;
                    }
                    return minterm.join(' & ');
                }).join(', ');
                
                if (containerCtrl) {
                    // the mdInputContainer adds a formatter which runs before this one which sets the
                    // .md-input-has-value class, work around by setting it again
                    containerCtrl.setHasValue(!ngModel.$isEmpty(result));
                }
                return result;
            });
        }
    };
}

export default permissionExpressionDirective;