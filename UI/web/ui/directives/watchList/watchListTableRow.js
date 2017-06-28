/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['require', 'moment-timezone', 'angular'], function(require, moment, angular) {
'use strict';

var FLASH_CLASS = 'flash-on-change';

watchListTableRow.$inject = ['$mdMedia', '$timeout', 'maUserNotes', '$state', 'maUiDateBar', 'localStorageService', 'maStatsDialog', 'maSetPointDialog'];
function watchListTableRow($mdMedia, $timeout, UserNotes, $state, maUiDateBar, localStorageService, maStatsDialog, maSetPointDialog) {
    return {
        templateUrl: require.toUrl('./watchListTableRow.html'),
        link: watchListTableRowLink
    };

    function watchListTableRowLink(scope, element, attrs) {
        scope.$mdMedia = $mdMedia;
        scope.Updated = false;
        scope.addNote = UserNotes.addNote;
        scope.showSetPoint = maSetPointDialog.show;
        scope.showStats = maStatsDialog.show;
        
        scope.openPage = function(state, param) {
            $state.go(state, { pointXid: param });
        };
    }
}

return watchListTableRow;

}); // define