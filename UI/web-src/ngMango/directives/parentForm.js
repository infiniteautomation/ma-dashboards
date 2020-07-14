/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

parentFormDirective.$inject = [];
function parentFormDirective() {

    class ParentFormController {
        $onChanges(changes) {
            if (changes.parentForm) {
                if (changes.parentForm.isFirstChange()) {
                    // for the first change we are running before the ngModelPreLink function
                    if (this.parentForm) {
                        // just set the $$parentForm property and let ngModelPreLink call $addControl()
                        this.ngModel.$$parentForm = this.parentForm;
                    }
                } else {
                    // ensure the control is removed from the previous form
                    this.ngModel.$$parentForm.$removeControl(this.ngModel);
                    if (this.parentForm) {
                        this.parentForm.$addControl(this.ngModel);
                    }
                }
            }
        }
    }
    
    return {
        restrict: 'A',
        scope: false,
        controller: ParentFormController,
        bindToController: {
            parentForm: '<maParentForm'
        },
        require: {
            ngModel: 'ngModel'
        }
    };
}

export default parentFormDirective;