/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

formExclude.$inject = [];
function formExclude() {
    return {
        require: {
            modelCtrl: '?ngModel',
            formCtrl: '?form'
        },
        restrict: 'A',
        link: function($scope, $element, $attrs, ctrls) {
            const modelCtrl = ctrls.modelCtrl;
            const formCtrl = ctrls.formCtrl;
            
            if (modelCtrl) {
                modelCtrl.$$parentForm.$removeControl(modelCtrl);
            }
            if (formCtrl) {
                formCtrl.$$parentForm.$removeControl(formCtrl);
            }
        }
    };
}

export default formExclude;
