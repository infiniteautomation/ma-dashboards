/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['require', 'moment-timezone', 'angular'], function(require, moment, angular) {
'use strict';

var FLASH_CLASS = 'flash-on-change';

watchListTableRow.$inject = ['$mdMedia', '$mdDialog', '$timeout', 'maUserNotes', '$state', 'maUiDateBar', 'localStorageService'];
function watchListTableRow($mdMedia, $mdDialog, $timeout, UserNotes, $state, maUiDateBar, localStorageService) {
    return {
        templateUrl: require.toUrl('./watchListTableRow.html'),
        link: watchListTableRowLink
    };

    function watchListTableRowLink(scope, element, attrs) {
        scope.$mdMedia = $mdMedia;
        scope.Updated = false;
        scope.addNote = UserNotes.addNote;
        
        scope.openPage = function(state, param) {
            $state.go(state, { pointXid: param });
        };

        scope.showSetPoint = function(ev) {
            $mdDialog.show({
                    controller: function() {
                        this.parent = scope;
                        this.cancel = function cancel() {
                            $mdDialog.cancel();
                        };
                    },
                    templateUrl: require.toUrl('./setPointDialog.html'),
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    fullscreen: false,
                    clickOutsideToClose: true,
                    controllerAs: 'ctrl'
                })
                .then(function(answer) {
                    //$scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    //$scope.status = 'You cancelled the dialog.';
                });
        };

        scope.showStats = function(ev) {
            $mdDialog.show({
                controller: function() {
                    this.dateBar = maUiDateBar;

                    this.retrievePreferences = function() {
                        var defaults = {
                            numValues: 100,
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
                    
                    this.parent = scope;
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
                //$scope.status = 'You said the information was "' + answer + '".';
            }, function() {
                //$scope.status = 'You cancelled the dialog.';
            });
        };
    }
}

return watchListTableRow;

}); // define