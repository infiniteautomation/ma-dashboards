/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import statsDialogTemplate from './statsDialog.html';
import moment from 'moment-timezone';

statsDialog.$inject = ['$mdDialog', '$mdMedia', '$injector', 'localStorageService'];
function statsDialog($mdDialog, $mdMedia, $injector, localStorageService) {
    const statsDialog = {
        show(ev, point, tab) {
            return $mdDialog.show({
                controller: function() {
                    this.dateBar = $injector.has('maUiDateBar') && $injector.get('maUiDateBar');

                    this.retrievePreferences = function() {
                        const defaults = {
                            numberOfPointValues: 100,
                            realtimeMode: true,
                            showCachedData: false
                        };
                        const preferences = angular.merge(defaults, localStorageService.get('uiPreferences'));
                        this.numValues = preferences.numberOfPointValues;
                        this.realtimeMode = preferences.realtimeMode;
                        this.showCachedData = preferences.showCachedData;
                    };

                    this.updatePreferences = function() {
                        const preferences = localStorageService.get('uiPreferences') || {};
                        preferences.numberOfPointValues = this.numValues;
                        preferences.realtimeMode = this.realtimeMode;
                        preferences.showCachedData = this.showCachedData;
                        localStorageService.set('uiPreferences', preferences);
                    };

                    this.retrievePreferences();

                    this.point = point;
                    this.tab = tab;
                    this.timeRange = moment.duration(moment(this.dateBar.to).diff(moment(this.dateBar.from))).humanize();
                    this.cancel = function cancel() {
                        $mdDialog.cancel();
                    };
                },
                template: statsDialogTemplate,
                parent: angular.element(document.body),
                targetEvent: ev,
                fullscreen: true,
                clickOutsideToClose: true,
                controllerAs: '$ctrl'
            }).then(angular.noop, angular.noop);
        }
    };

    return Object.freeze(statsDialog);
}

export default statsDialog;


