/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

formatModelValue.$inject = ['$parse'];
function formatModelValue($parse) {
    return {
        require: ['ngModel', '^?mdInputContainer'],
        restrict: 'A',
        link: function($scope, $element, $attrs, [ngModel, containerCtrl]) {
            if (!$attrs.maFormatModelValue) return;
            
            const expression = $parse($attrs.maFormatModelValue);
            ngModel.$formatters.push(function(value) {
                const result = expression($scope, {$modelValue: value});
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

export default formatModelValue;