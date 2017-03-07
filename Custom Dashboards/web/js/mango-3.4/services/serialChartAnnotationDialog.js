/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['require', 'angular'], function(require, angular) {
'use strict';


function serialChartAnnotationDialogFactory($mdDialog) {
    function serialChartAnnotationDialog() {
    }

    serialChartAnnotationDialog.prototype.addNote = function(locals, callBack) {
        // Appending dialog to document.body to cover sidenav in docs app
        $mdDialog.show({
            controller: function() {
                this.cancel = function cancel() {
                    $mdDialog.cancel();
                };

                this.addNote = function addNote() {
                    $mdDialog.hide({
                        title: this.title,
                        description: this.description
                    });
                };
            },
            templateUrl: require.toUrl('./serialChartAnnotationDialog.html'),
            parent: angular.element(document.body),
            fullscreen: false,
            clickOutsideToClose: true,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: locals
        })
        .then(function(data) {
            if (callBack) {
                callBack(data);
            }
        }, function() {

        });
  };

    return new serialChartAnnotationDialog;
}

serialChartAnnotationDialogFactory.$inject = ['$mdDialog'];
return serialChartAnnotationDialogFactory;

}); // define
