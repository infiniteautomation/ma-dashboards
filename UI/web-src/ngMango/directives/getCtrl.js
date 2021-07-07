/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

getCtrl.$inject = [];
function getCtrl() {

    class GetCtrlController {
        $onInit() {
            this.initCallback({
                $ngModel: this.ngModel,
                $ngForm: this.ngForm
            });
        }
    }
    
    return {
        restrict: 'A',
        scope: false,
        controller: GetCtrlController,
        require: {
            ngModel: '?ngModel',
            ngForm: '?form'
        },
        bindToController: {
            initCallback: '&maGetCtrl'
        }
    };
}

export default getCtrl;