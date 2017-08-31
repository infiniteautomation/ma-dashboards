/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['require', 'moment-timezone', 'angular'], function(require, moment, angular) {
'use strict';

watchListTableRow.$inject = ['$mdMedia', 'maUserNotes', '$state', 'maStatsDialog', 'maSetPointDialog'];
function watchListTableRow($mdMedia, UserNotes, $state, maStatsDialog, maSetPointDialog) {
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