/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

inheritNgModel.$inject = [];
function inheritNgModel() {
    return {
        require: '^ngModel',
        restrict: 'A',
        priority: 1,
        link: {
            pre: function($scope, $element, $attrs, ngModel) {
                $element.data('$ngModelController', ngModel);
            }
        }
    };
}

export default inheritNgModel;