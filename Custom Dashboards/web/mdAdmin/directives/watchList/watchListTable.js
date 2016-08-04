/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['require'], function(require) {
    'use strict';

    var watchListTable = function($mdMedia, $mdDialog) {
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
                    scope.rows = []; // Set up array for storing rows
                    scope.page.points = [];
                    scope.page.searchQuery = "xid=like=*" + scope.data + "*";
                    scope.sparkType = 'val';
                    scope.$mdMedia = $mdMedia;
                    

                    scope.showSetPoint = function(ev, point) {
                        $mdDialog.show({
                                controller: setDialogController,
                                templateUrl: require.toUrl('./setPointDialog.html'),
                                parent: angular.element(document.body),
                                targetEvent: ev,
                                fullscreen: true,
                                clickOutsideToClose: true,
                                locals : {
                                    point : point
                                }
                            })
                            .then(function(answer) {
                                //$scope.status = 'You said the information was "' + answer + '".';
                            }, function() {
                                //$scope.status = 'You cancelled the dialog.';
                            });
                    }
                    
                    scope.showStats = function(ev, point, from, to) {
                        $mdDialog.show({
                                controller: setStatsController,
                                templateUrl: require.toUrl('./statsDialog.html'),
                                parent: angular.element(document.body),
                                targetEvent: ev,
                                fullscreen: true,
                                clickOutsideToClose: true,
                                locals : {
                                    point : point,
                                    from: from,
                                    to: to
                                }
                            })
                            .then(function(answer) {
                                //$scope.status = 'You said the information was "' + answer + '".';
                            }, function() {
                                //$scope.status = 'You cancelled the dialog.';
                            });
                    }

                    function setDialogController(scope, $mdDialog, point) {
                        scope.point = point;
                        
                        scope.hide = function() {
                            $mdDialog.hide();
                        };
                        scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };
                    }
                    
                    function setStatsController(scope, $mdDialog, point, from, to) {
                        scope.point = point;
                        scope.from = from;
                        scope.to = to;
                        scope.hide = function() {
                            $mdDialog.hide();
                        };
                        scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                        scope.answer = function(answer) {
                            $mdDialog.hide(answer);
                        };
                    }

                    scope.$watch('page.points', function(newValue, oldValue) {
                        if (newValue === undefined || newValue === oldValue) return;
                        //console.log('Table Points', newValue);
                        scope.rows = []; // Clears rows if points are updated
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

    watchListTable.$inject = ['$mdMedia', '$mdDialog'];

    return watchListTable;

}); // define