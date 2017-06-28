/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

setPointDialog.$inject = ['$mdDialog', '$mdMedia'];
function setPointDialog($mdDialog, $mdMedia) {
    var SetPointDialog = {};

    SetPointDialog.show = function(ev, point) {
    	return $mdDialog.show({
            controller: function() {
                this.point = point;
                console.log()
                this.cancel = function cancel() {
                    $mdDialog.cancel();
                };
            },
            templateUrl: require.toUrl('./setPointDialog.html'),
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

return setPointDialog;

}); // define
