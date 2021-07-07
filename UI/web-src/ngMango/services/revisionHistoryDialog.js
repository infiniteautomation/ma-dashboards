/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import revisionHistoryDialogTemplate from './revisionHistoryDialog.html';

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
                template: revisionHistoryDialogTemplate,
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

export default revisionHistoryDialogFactory;


