/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import userNotesTableTemplate from './userNotesTable.html';
import moment from 'moment-timezone';

/**
 * @ngdoc directive
 * @name ngMango.directive:maUserNotesTable
 * @restrict E
 * @description
 * `<ma-user-notes-table></ma-user-notes-table>`
 * - Displays a list of User Notes in a table
 * - Can be configured to load a specific `reference-id`
 *
 * @param {number=} reference-id Query via referenceId
 * @param {string} comment-type Can be `POINT` or `EVENT`
 * @param {string} timezone Timezone for displaying time stamps
 * @param {string} limit Set the initial limit of the pagination
 * @param {boolean=} [disabled=false] Set to `true` to turn off the ability to add new user notes.
 *
 * @usage
 * <ma-user-notes-table></ma-user-notes-table>
 *
 */
userNotesTable.$inject = ['maUserNotes', '$injector', 'MA_DATE_FORMATS'];
function userNotesTable(UserNotes, $injector, mangoDateFormats) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            referenceId: '=?',
            commentType: '@',
            timezone: '@',
            disabled: '=?',
            addNote: '=?'
        },
        designerInfo: {
            translation: 'ui.components.maUserNotesTable',
            icon: 'people'
        },
        template: userNotesTableTemplate,
        link: function ($scope, $element, attrs) {
            
            $scope.addNote = (event) => {
                UserNotes.addNote(event, $scope.commentType, $scope.referenceId).then(note => {
                    $scope.userNotes.push(note);
                });
            };

            $scope.formatDate = function(date) {
                const m = moment(date);
                if ($scope.timezone) {
                    m.tz($scope.timezone);
                }
                return m.format(mangoDateFormats.shortDateTime);
            };
            
            $scope.$watch('referenceId', function(newValue, oldValue) {
                if (newValue === undefined) return;
                // console.log(newValue);
                UserNotes.query({
                    commentType: $scope.commentType, 
                    referenceId: newValue
                }).$promise.then(function(notes) {
                    // console.log(notes);
                    $scope.userNotes = notes;
                }, function(error) {
                    console.log(error);
                    $scope.userNotes = [];
                });
            });
            
        }
    };
}

export default userNotesTable;

