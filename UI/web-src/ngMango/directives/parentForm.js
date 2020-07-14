/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

parentFormDirective.$inject = [];
function parentFormDirective() {
    return {
        restrict: 'A',
        scope: false,
        require: {
            ngModel: '?ngModel',
            form: '?form'
        },
        link: function($scope, $element, $attrs, controllers) {
            const ngModel = controllers.ngModel;
            const form = controllers.form;

            $scope.$watch($attrs.maParentForm, (parentForm) => {
                if (ngModel) {
                    ngModel.$$parentForm.$removeControl(ngModel);
                    if (parentForm) {
                        parentForm.$addControl(ngModel);
                    }
                }
                if (form) {
                    form.$$parentForm.$removeControl(form);
                    if (parentForm) {
                        parentForm.$addControl(form);
                    }
                }
            });
        }
    };
}

export default parentFormDirective;