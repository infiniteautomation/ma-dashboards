/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

import angular from 'angular';
import setPointDialogTemplate from './setPointDialog.html';

setPointDialog.$inject = ['$mdDialog', '$mdMedia'];
function setPointDialog($mdDialog, $mdMedia) {
    var SetPointDialog = {};

    SetPointDialog.show = function(ev, point) {
    	return $mdDialog.show({
            controller: function() {
                this.point = point;
                this.cancel = function cancel() {
                    $mdDialog.cancel();
                };
            },
            template: setPointDialogTemplate,
            parent: angular.element(document.body),
            targetEvent: ev,
            fullscreen: false,
            clickOutsideToClose: true,
            controllerAs: '$ctrl'
        })
        .then(function(answer) {

        }, function() {

        });
    };

    return SetPointDialog;
}

export default setPointDialog;


