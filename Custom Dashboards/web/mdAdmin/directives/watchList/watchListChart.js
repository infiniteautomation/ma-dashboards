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
                scope.parseFloat = parseFloat; // Make parseFloat availble to scope
                scope.stats = []; // Set up array for storing stats for stats tab
                scope.points = []; // Set up array for storing charted points
                scope.$mdMedia = $mdMedia; // Make $mdMedia service availble to scope


                scope.$watchCollection('addChecked', function(newValues, oldValues) {
                    if (newValues === undefined || newValues === oldValues) return;

                    // Enables the ability to add points to the drill down chart by checking items in the table
                    //console.log('addChecked:', newValues);

                    // Clear Stats Tab
                    scope.stats = [];
                    
                    // assign the chart's points equal to the checked from table
                    scope.points = newValues;
                });
                
                
                // Watch for changes to date preset to update rollup interval
                scope.$watch('datePreset', function(newValue, oldValue) {
                    if (newValue === undefined || newValue === oldValue) return;
                    //console.log('date preset changed', newValue);

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
                }; // End updateRollup()


            } // End Link
        }; // End return
    }; // End DDO

    watchListChart.$inject = ['$mdMedia', '$timeout'];

    return watchListChart;

}); // define