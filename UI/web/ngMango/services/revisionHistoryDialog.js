/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

revisionHistoryDialogFactory.$inject = ['$mdDialog', '$mdMedia'];
function revisionHistoryDialogFactory($mdDialog, $mdMedia) {
    
    const revisionHistoryDialog = {
        show(event, options) {
            
            return $mdDialog.show({
                controller: function() {
                    this.cancel = function($event) {
                        $mdDialog.cancel();
                    };
                    
                    this.ok = function($event) {
                        $mdDialog.hide(this.revision);
                    };

                    if (typeof options.filterValues === 'function') {
                        this.filterValues = options.filterValues;
                    } else {
                        this.filterValues = () => true;
                    }
                },
                templateUrl: require.toUrl('./revisionHistoryDialog.html'),
                parent: angular.element(document.body),
                targetEvent: event,
                fullscreen: false,
                clickOutsideToClose: true,
                controllerAs: '$ctrl',
                bindToController: true,
                locals: options
            });
        }
    };

    return Object.freeze(revisionHistoryDialog);
}

return revisionHistoryDialogFactory;

}); // define
