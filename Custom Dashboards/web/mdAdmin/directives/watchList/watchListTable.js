/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['require'], function(require) {
    'use strict';

    var watchListTable = function($mdMedia) {
        return {
            restrict: 'E',
            scope: {
                data: '@',
                to: '=',
                from: '=',
                selected: '='
            },
            templateUrl: 'directives/watchList/watchListTable.html',
            link: function link(scope, element, attrs) {

                scope.parseInt = parseInt; // Make parseInt availble to scope
                scope.parseFloat = parseFloat; // Make parseFloat availble to scope
                scope.stats = []; // Set up array for storing stats
                scope.page.points = [];
                scope.page.searchQuery = "xid=like=*" + scope.data + "*";
                scope.sparkType = 'val';
                scope.$mdMedia = $mdMedia;

                scope.$watch('page.points', function(newValue, oldValue) {
                    if (newValue === undefined || newValue === oldValue) return;
                    //console.log('Table Points', newValue);
                    scope.stats = []; // Clears stats if points are updated
                });
                
                // scope.$watch('stats', function(newValue, oldValue) {
                //     if (newValue === undefined || newValue === oldValue) return;
                //     console.log('Stats', newValue);
                //     scope.selected = newValue; // Sets selected to all new stats
                // });

                // Allows changing of sorting on stat to effect Ranking bar data
                scope.$watch('page.tableOrder', function(newValue, oldValue) {
                    if (newValue === undefined || newValue === oldValue) return;

                    //console.log('page.tableOrder', newValue);

                    if (newValue == 'val' || newValue == '-val') {
                        scope.sparkType = 'val';
                    } else if (newValue == 'avg' || newValue == '-avg') {
                        scope.sparkType = 'avg';
                    } else if (newValue == 'avg' || newValue == '-avg') {
                        scope.sparkType = 'avg';
                    } else if (newValue == 'min' || newValue == '-min') {
                        scope.sparkType = 'min';
                    } else if (newValue == 'max' || newValue == '-max') {
                        scope.sparkType = 'max';
                    } else if (newValue == 'sum' || newValue == '-sum') {
                        scope.sparkType = 'sum';
                    } else if (newValue == 'delta' || newValue == '-delta') {
                        scope.sparkType = 'delta';
                    }
                });

                
            } // End Link
        }; // End return
    }; // End DDO

    watchListTable.$inject = ['$mdMedia'];

    return watchListTable;

}); // define