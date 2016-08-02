/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['require'], function(require) {
    'use strict';

    var watchListChart = function($mdMedia, $timeout) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
                to: '=',
                from: '=',
                addChecked: '=',
                datePreset: '=',
                rollupType: '=',
                rollupIntervalNumber: '=',
                rollupIntervalPeriod: '='
            },
            templateUrl: 'directives/watchList/watchListChart.html',
            link: function link(scope, element, attrs) {

                scope.parseInt = parseInt; // Make parseInt availble to scope
                scope.stats = []; // Set up array for storing stats
                scope.points = []; // Set up array for storing charted points
                //scope.addPoints = [];

                scope.initQuery = scope.data.type;

                scope.$mdMedia = $mdMedia;


                scope.$watchCollection('addChecked', function(newValues, oldValues) {
                    if (newValues === undefined || newValues === oldValues) return;

                    // Enables the ability to add points to the drill down chart by checking the item in the big table
                    //console.log('addChecked:', newValues);
                    //scope.addPoints.push.apply(scope.addPoints, newValues);

                    // In this new method we just assign the chart's points equal to the checked from table


                    // Refresh stats
                    scope.stats = [];

                    scope.points = newValues;




                });

                // Changes to resource type will trigger chart to change graph type and rollup
                scope.$watch('data.type', function(newValue, oldValue) {
                    if (newValue === undefined || newValue === oldValue) return;

                    console.log('data type changed', newValue);

                    // Clear checked
                    scope.addChecked = [];

                    // Clear selected points in chart and stats
                    //scope.addPoints = [];
                    scope.points = [];
                    scope.stats = [];

                    // Refresh query for campus level init chart NEED TIMEOUT TO WAIT FOR ADDCHECKED TO Clear
                    $timeout(function() {
                        scope.initQuery = newValue;
                    }, 200);


                    if (newValue == 'power' || newValue == 'water+') {
                        scope.chartType = 'smoothedLine';
                        scope.rollupType = 'AVERAGE';
                    } else {
                        scope.chartType = 'column';
                        scope.rollupType = 'DELTA';
                    }

                    updateRollup();
                });

                function updateRollup() {
                    //console.log('Update Rollup called');
                    if (scope.datePreset == 'DAY_SO_FAR' || scope.datePreset == 'PREVIOUS_DAY') {
                        if (scope.rollupType == 'DELTA') {
                            scope.rollupIntervalNumber = 1;
                            scope.rollupIntervalPeriod = 'HOURS';
                        } else {
                            scope.rollupIntervalNumber = 5;
                            scope.rollupIntervalPeriod = 'MINUTES';
                            scope.rollupType = 'AVERAGE';
                        }
                    } else if (scope.datePreset == 'LAST_6_HOURS') {
                        if (scope.rollupType == 'DELTA') {
                            scope.rollupIntervalNumber = 1;
                            scope.rollupIntervalPeriod = 'HOURS';
                        } else {
                            scope.rollupIntervalNumber = 1;
                            scope.rollupIntervalPeriod = 'MINUTES';
                            scope.rollupType = 'AVERAGE';
                        }
                    } else if (scope.datePreset == 'LAST_3_HOURS' || scope.datePreset == 'LAST_1_HOURS') {
                        if (scope.rollupType == 'DELTA') {
                            scope.rollupIntervalNumber = 10;
                            scope.rollupIntervalPeriod = 'MINUTES';
                        } else {
                            scope.rollupType = 'NONE';
                        }
                    } else if (scope.datePreset == 'LAST_15_MINUTES') {
                        if (scope.rollupType == 'DELTA') {
                            scope.rollupIntervalNumber = 1;
                            scope.rollupIntervalPeriod = 'MINUTES';
                        } else {
                            scope.rollupType = 'NONE';
                        }
                    } else if (scope.datePreset == 'WEEK_SO_FAR' || scope.datePreset == 'PREVIOUS_WEEK' || scope.datePreset == 'MONTH_SO_FAR' || scope.datePreset == 'PREVIOUS_MONTH') {
                        if (scope.rollupType == 'DELTA') {
                            scope.rollupIntervalNumber = 1;
                            scope.rollupIntervalPeriod = 'DAYS';
                        } else {
                            scope.rollupIntervalNumber = 1;
                            scope.rollupIntervalPeriod = 'HOURS';
                            scope.rollupType = 'AVERAGE';
                        }
                    } else if (scope.datePreset == 'YEAR_SO_FAR') {
                        if (scope.rollupType == 'DELTA') {
                            scope.rollupIntervalNumber = 1;
                            scope.rollupIntervalPeriod = 'MONTHS';
                        } else {
                            scope.rollupIntervalNumber = 6;
                            scope.rollupIntervalPeriod = 'HOURS';
                            scope.rollupType = 'AVERAGE';
                        }
                    }
                };

                // Watch for changes to date preset to update rollup interval
                scope.$watch('datePreset', function(newValue, oldValue) {
                    if (newValue === undefined || newValue === oldValue) return;
                    //console.log('date preset changed', newValue);

                    updateRollup();
                });



            }
        };
    };

    watchListChart.$inject = ['$mdMedia', '$timeout'];

    return watchListChart;

}); // define