/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */


 /**
  * @ngdoc directive
  * @name maDashboards.maWatchListChart
  * @restrict E
  * @description
  * `<ma-watch-list-chart></ma-watch-list-chart>`
  * - Use `<ma-watch-list-chart>` to display the watch list's custom chart on a custom page.
  * - Use with `<ma-watch-list-select>` and pass in data from a watch list object.
  *
  * @param {array} add-checked Array of points to add to the chart (`myWatchlist.data.selectedPoints`).
  * @param {object} chart-config Chart config object from the watchlist object (`myWatchlist.data.chartConfig`).
  * @param {string} to Timestamp to start charting. Can be from `dateBar` or `<ma-date-range-picker>`.
  * @param {string} from Timestamp to end charting. Can be from `dateBar` or `<ma-date-range-picker>`.
  * @param {string} rollup-type Rollup type.
  * @param {string} rollup-interval-number Rollup inteval number.
  * @param {number} rollup-interval-period Rollup interval unit.
  * @param {string} chart-height Height of the chart. Specify with px or % (`400px`). 
  * @param {boolean} edit-mode Set to `true` to display chart customization controls. Defaults to `false`. 
  * @param {boolean} stats-tab Set to `true` to display stats tab. Defaults to `false`. 
  * @param {boolean} export Set to `true` to display chart export and annotation options. Defaults to `false`. 
  * 
  * @usage
  * <ma-watch-list-select no-select="true" watch-list-xid="WatchList323" watch-list="myWatchlist"></ma-watch-list-select>
  * <ma-watch-list-chart flex add-checked="myWatchlist.data.selectedPoints" chart-config="myWatchlist.data.chartConfig" to="dateBar.to" from="dateBar.from" rollup-type="dateBar.rollupType" rollup-interval-number="dateBar.rollupIntervals" rollup-interval-period="dateBar.rollupIntervalPeriod" chart-height="450px"></watch-list-chart>
  *
  */

define(['require'], function(require) {
    'use strict';

    watchListChart.$inject = ['$mdMedia', '$timeout','mdAdminSettings'];
    function watchListChart($mdMedia, $timeout, mdAdminSettings) {
        return {
            restrict: 'E',
            templateUrl: require.toUrl('./watchListChart.html'),
            scope: {
                addChecked: '=',
                chartConfig: '=',
                editMode: '=',
                statsTab: '=',
                'export': '=',
                to: '=',
                from: '=',
                rollupType: '=',
                rollupIntervalNumber: '=',
                rollupIntervalPeriod: '=',
                chartHeight: '@'
            },
            designerInfo: {
                translation: 'dashboards.v3.components.watchListChart',
                icon: 'show_chart',
                category: 'pointValuesAndCharts',
                size: {
                    width: '400px',
                    height: '200px'
                }
            },
            link: function link(scope, element, attrs) {
                var defaultAxisColor = mdAdminSettings.theming.THEMES[mdAdminSettings.activeTheme].isDark ? '#FFFFFF' : '#000000';
                var defaultChartConfig = {
                    graphOptions: [],
                    selectedAxis: 'left',
                    selectedColor: '#C2185B',
                    assignColors: false,
                    chartType: 'smoothedLine',
                    stackType: {
                        selected: 'none',
                        left: 'none',
                        right: 'none',
                        'left-2': 'none',
                        'right-2': 'none'
                    },
                    axisColors: { 
                        left2AxisColor: defaultAxisColor,
                        leftAxisColor: defaultAxisColor,
                        right2AxisColor: defaultAxisColor,
                        rightAxisColor: defaultAxisColor
                    }
                };
                
                scope.parseInt = parseInt; // Make parseInt available to scope
                scope.parseFloat = parseFloat; // Make parseFloat available to scope
                scope.stats = []; // Set up array for storing stats for stats tab
                scope.points = []; // Set up array for storing charted points
                scope.$mdMedia = $mdMedia; // Make $mdMedia service available to scope
                
                scope.clearChart = function() {
                    scope.points=[]; 
                    scope.stats=[]; 
                    scope.addChecked=[]; 
                    scope.chartConfig = defaultChartConfig;
                };

                if (scope.editMode) {
                    scope.$watch('chartConfig.stackType.selected', function(newValue, oldValue) {
                        if (newValue === undefined || newValue === oldValue) return;
                        // console.log('stackType Updated:', newValue, scope.chartConfig.selectedAxis);
                        
                        scope.chartConfig.stackType[scope.chartConfig.selectedAxis] = newValue;

                        // console.log(scope.chartConfig);
                    });

                    scope.$watch('chartConfig.chartType', function(newValue, oldValue) {
                        if (newValue === undefined || newValue === oldValue) return;
                        // console.log('chartType Updated:', newValue, scope.chartConfig.selectedAxis);
                        
                        scope.chartConfig.graphOptions.filter(function(obj) {
                            return obj.valueAxis === scope.chartConfig.selectedAxis;
                        }).forEach(function(obj) {
                            obj.type = newValue;
                        });

                        // console.log(scope.chartConfig);
                    });

                    scope.$watch('chartConfig.selectedAxis', function(newValue, oldValue) {
                        if (newValue === undefined || newValue === oldValue) return;
                        // console.log('selectedAxis Updated:', newValue);
                        
                        // Set stackType control to that matching axis selected
                        scope.chartConfig.stackType.selected = scope.chartConfig.stackType ? scope.chartConfig.stackType[newValue] : 'none';

                        // Set chartType control to that matching axis selected
                        var selectedAxisGraphOption = scope.chartConfig.graphOptions.filter(function(obj) {
                            return obj.valueAxis === newValue;
                        })[0];
                        scope.chartConfig.chartType = selectedAxisGraphOption ? selectedAxisGraphOption.type : 'smoothedLine';

                        // console.log(scope.chartConfig);
                    });
                }
                
                

                scope.$watchCollection('addChecked', function(newValues, oldValues) {
                    if (newValues === undefined || (oldValues === undefined && newValues.length === 0) || !scope.chartConfig) return;
                    // console.log('addChecked Watcher:', newValues, oldValues);
                    
                    // Clear Stats before new ones are generated
                    scope.stats = [];
                    
                    // assign the chart's points equal to the checked from table
                    scope.points = newValues;

                    // If cleared clear chartConfig.graphOptions
                    if (newValues.length === 0) {
                        scope.chartConfig.graphOptions = [];
                    }
                    
                    // Only add graph option if it isn't already in the chartConfig, compare to last item of newValues
                    var xidExists = scope.chartConfig.graphOptions.some(function(obj) {
                        return obj.xid === newValues[newValues.length-1].xid;
                    });

                    // Check if adding or removing before updating graphOptions array
                    if ( (oldValues === undefined && newValues.length >= 0 && !xidExists && scope.editMode) || (oldValues !== undefined && newValues.length > oldValues.length && !xidExists  && scope.editMode) ) {

                        // Set graphOption with current selcted Axis and newest added xid
                        var graphOption = {valueAxis: scope.chartConfig.selectedAxis, xid: newValues[newValues.length-1].xid};
                        
                        // Set type to selected chartType
                        graphOption.type = scope.chartConfig.chartType;

                        // If assignColors checkbox is turned on use next line color option
                        if (scope.chartConfig.assignColors) {
                            graphOption.lineColor = scope.chartConfig.selectedColor;
                        }
                        
                        // push it to the chartConfig.graphOptions array
                        scope.chartConfig.graphOptions.push(graphOption);
                        // console.log('Adding', newValues[newValues.length-1].xid);
                    }
                    else if (oldValues !== undefined && newValues.length < oldValues.length && scope.editMode) {
                        var arrayDiff = oldValues.filter(function(x) {
                            return newValues.indexOf(x) < 0;
                        });
                        var removedXid = arrayDiff[0].xid;
                        var removedIndex = oldValues.map(function(x) {
                            return x.xid;
                        }).indexOf(removedXid);
                        
                        scope.chartConfig.graphOptions.splice(removedIndex, 1);
                        // console.log('Removed', removedXid, 'at index', removedIndex);
                    }
                    // console.log('Graph Options', scope.chartConfig.graphOptions);
                });

            } // End Link
        }; // End return
    } // End DDO

    return watchListChart;

}); // define