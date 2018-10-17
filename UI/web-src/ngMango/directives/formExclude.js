/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

formExclude.$inject = [];
function formExclude() {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function($scope, $element, $attrs, modelCtrl) {
            if (modelCtrl.$$parentForm) {
                modelCtrl.$$parentForm.$removeControl(modelCtrl);
            }
        }
    };
}

export default formExclude;
