/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

statsDialog.$inject = ['$mdDialog', '$mdMedia', 'maUiDateBar', 'localStorageService'];
function statsDialog($mdDialog, $mdMedia, maUiDateBar, localStorageService) {
    var StatsDialog = {};

    StatsDialog.show = function(ev, point) {
    	return $mdDialog.show({
            controller: function() {
                this.dateBar = maUiDateBar;

                this.retrievePreferences = function() {
                    var defaults = {
                        numberOfPointValues: 100,
                        realtimeMode: true,
                        showCachedData: false
                    };
                    var preferences = angular.merge(defaults, localStorageService.get('uiPreferences'));
                    this.numValues = preferences.numberOfPointValues;
                    this.realtimeMode = preferences.realtimeMode;
                    this.showCachedData = preferences.showCachedData;
                };

                this.updatePreferences = function() {
                    var preferences = localStorageService.get('uiPreferences');
                    preferences.numberOfPointValues = this.numValues;
                    preferences.realtimeMode = this.realtimeMode;
                    preferences.showCachedData = this.showCachedData;
                    localStorageService.set('uiPreferences', preferences);
                };

                this.retrievePreferences();

                this.point = point;
                this.timeRange = moment.duration(moment(this.dateBar.to).diff(moment(this.dateBar.from))).humanize();
                this.cancel = function cancel() {
                    $mdDialog.cancel();
                };
            },
            templateUrl: require.toUrl('./statsDialog.html'),
            parent: angular.element(document.body),
            targetEvent: ev,
            fullscreen: true,
            clickOutsideToClose: true,
            controllerAs: '$ctrl'
        })
        .then(function(answer) {

        }, function() {

        });
    };

    return StatsDialog;
}

return statsDialog;

}); // define
