/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

getCtrl.$inject = [];
function getCtrl() {

    class GetCtrlController {
        $onInit() {
            this.initCallback({
                $ngModel: this.ngModel
            });
        }
    }
    
    return {
        restrict: 'A',
        scope: false,
        controller: GetCtrlController,
        require: {
            ngModel: '?ngModel'
        },
        bindToController: {
            initCallback: '&maGetCtrl'
        }
    };
}

export default getCtrl;