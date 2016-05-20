/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['amcharts/serial', 'jquery', 'moment'], function(AmCharts, $, moment) {
'use strict';

function serialChart() {
	var MAX_SERIES = 10;
	
	var scope = {
		options: '=?',
	    timeFormat: '@',
	    stackType: '@',
	    values: '=?',
	    points: '=?',
	    defaultType: '@',
	    defaultColor: '@',
        defaultAxis: '@'
	};
	
	for (var j = 1; j <= MAX_SERIES; j++) {
		scope['series' + j + 'Values'] = '=';
		scope['series' + j + 'Type'] = '@';
		scope['series' + j + 'Title'] = '@';
		scope['series' + j + 'Color'] = '@';
		scope['series' + j + 'Point'] = '=?';
		scope['series' + j + 'Axis'] = '@';
	}
	
    return {
        restrict: 'E',
        replace: true,
        scope: scope,
        template: '<div class="amchart"></div>',
        link: function ($scope, $element, attrs) {
            var options = defaultOptions();

            if ($scope.timeFormat) {
                options.categoryAxis.parseDates = false;
            }
            
            if ($scope.stackType) {
                options.valueAxes[0].stackType = $scope.stackType;
            }
            
            var valueArray = !!attrs.values;
            
            $.extend(true, options, $scope.options);
            
            var chart = AmCharts.makeChart($element[0], options);
            
            $scope.$watch('options', function(newValue, oldValue) {
            	if (newValue === undefined) return;
            	$.extend(true, chart, newValue);
            	chart.validateNow();
            }, true);
            
            $scope.$watchGroup([
                'defaultType',
                'defaultColor',
                'defaultAxis'
            ], typeOrTitleChanged.bind(null, null));
            
            var i;
            if (valueArray) {
            	$scope.$watchCollection('values', watchValues);
            	$scope.$watchCollection('points', watchPoints);
            	
            	for (i = 1; i <= MAX_SERIES; i++) {
	        		$scope.$watchGroup([
	        		    'series' + i + 'Type',
	        		    'series' + i + 'Title',
	        		    'series' + i + 'Color',
	        		    'series' + i + 'Axis'
	        		], typeOrTitleChanged.bind(null, i));
	        	}
            } else {
            	for (i = 1; i <= MAX_SERIES; i++) {
	        		$scope.$watchGroup([
	        		    'series' + i + 'Type',
	        		    'series' + i + 'Title',
	        		    'series' + i + 'Color',
	        		    'series' + i + 'Point',
	        		    'series' + i + 'Axis'
	        		], typeOrTitleChanged.bind(null, i));
	        		
	        		$scope.$watchCollection('series' + i + 'Values', valuesChanged.bind(null, i));
	        	}
            }
            
            function watchValues(newValues, oldValues) {
                chart.dataProvider = newValues;
                chart.validateData();
            }
            
            function watchPoints(newPoints, oldPoints) {
            	var i, point, graphNum;
            	chart.graphs = [];
            	
            	if (newPoints) {
	            	for (i = 0; i < newPoints.length; i++) {
	            		point = newPoints[i];
	            		if (!point) continue;
	            		setupGraph(i + 1, point);
	            	}
            	}
            	
            	sortGraphs();
                chart.validateData();
            }

            function findGraph(propName, prop, removeGraph) {
                for (var i = 0; i < chart.graphs.length; i++) {
                    if (chart.graphs[i][propName] === prop) {
                    	var graph = chart.graphs[i];
                    	if (removeGraph) chart.graphs.splice(i, 1);
                    	return graph;
                    }
                }
            }
            
            function typeOrTitleChanged(graphNum, values) {
            	if (isAllUndefined(values)) return;
            	
            	if (graphNum === null) {
            	    for (var i = 0; i < chart.graphs.length; i++) {
            	        setupGraph(i + 1); // we number the graphs from 1
            	    }
            	} else {
            	    setupGraph(graphNum);
            	}
            	
            	sortGraphs();
            	chart.validateData();
            }
            
            function valuesChanged(graphNum, newValues, oldValues) {
            	if (newValues === oldValues && newValues === undefined) return;
            	
            	if (!newValues) {
            		findGraph('graphNum', graphNum, true);
            	} else  {
                	setupGraph(graphNum);
                	sortGraphs();
                }
                updateValues();
            }

            function setupGraph(graphNum, point) {
            	if (!point) {
                	if (valueArray) {
                		point = $scope.points[graphNum - 1];
                	} else {
                		point = $scope['series' + graphNum + 'Point'];
                	}
                }
            	
                var graph = findGraph('graphNum', graphNum);
                
                var graphType = $scope['series' + graphNum + 'Type'] || $scope.defaultType ||
                	(point && point.plotType && point.plotType.toLowerCase()) ||
                	'smoothedLine';
                
                // change mango plotType to amCharts graphType
                // step and line are equivalent
                if (graphType === 'spline') {
                	graphType = 'smoothedLine';
                }

                if (!graph) {
                    graph = {};
                    chart.graphs.push(graph);
                }
                $.extend(graph, graphType === 'column' ? defaultColumnGraph() : defaultLineGraph());

                graph.graphNum = graphNum;
                graph.id = 'series-' + graphNum;
                graph.xid = point ? point.xid : null;
                graph.valueField = valueArray && point ? 'value_' + point.xid : 'value' + graphNum;
                graph.title = $scope['series' + graphNum + 'Title'] ||
                	(point && point.name) ||
                	('Series ' + graphNum);
                graph.type = graphType;
                graph.lineColor = $scope['series' + graphNum + 'Color'] || $scope.defaultColor ||
                	(point && point.chartColour) ||
                	null;
                graph.valueAxis = $scope['series' + graphNum + 'Axis'] ||  $scope.defaultAxis || 'left';
                var stackType = options.valueAxes[0].stackType;
                if (stackType && stackType !== 'none') {
                	graph.fillAlphas = 0.8;
                }
            }
            
            function sortGraphs() {
            	chart.graphs.sort(function(a, b) {
                    return a.graphNum - b.graphNum;
                });
            }
            
            function combine(output, newValues, valueField) {
                if (!newValues) return;
                
                for (var i = 0; i < newValues.length; i++) {
                    var value = newValues[i];
                    var timestamp = $scope.timeFormat ?
                            moment(value.timestamp).format($scope.timeFormat) :
                            value.timestamp;
                    
                    if (!output[timestamp]) {
                        output[timestamp] = {timestamp: timestamp};
                    }
                    
                    output[timestamp][valueField] = value.value;
                }
            }
            
            function updateValues() {
            	var values = $scope.timeFormat ? {} : [];
            	
            	for (var i = 1; i <= MAX_SERIES; i++) {
            		var seriesValues = $scope['series' + i + 'Values'];
            		combine(values, seriesValues, 'value' + i);
            	}
                
                // normalize sparse array or object into dense array
                var output = [];
                for (var timestamp in values) {
                    output.push(values[timestamp]);
                }
                
                // XXX sparse array to dense array doesnt result in sorted array
                // manually sort here
                if (output.length && typeof output[0].timestamp === 'number') {
                    output.sort(function(a,b) {
                        return a.timestamp - b.timestamp;
                    });
                }
                
                chart.dataProvider = output;
                chart.validateData();
            }
            
            function isAllUndefined(a) {
            	for (var i = 0; i < a.length; i++) {
            		if (a[i] !== undefined) return false;
            	}
            	return true;
            }
        }
    };
}

function defaultLineGraph() {
    return {
        fillAlphas: 0,
        lineAlpha: 0.8,
        lineThickness: 2.0
    };
}

function defaultColumnGraph() {
    return {
        fillAlphas: 0.8,
        lineAlpha: 0.9,
        lineThickness: 1
    };
}

function defaultOptions() {
    return {
        type: "serial",
        theme: "light",
        addClassNames: true,
        dataProvider: [],
        valueAxes: [{
        	id: "left",
            position: "left"
        },{
        	id: "right",
            position: "right"
        },{
        	id: "left-2",
            position: "left",
            offset: 50
        },{
        	id: "right-2",
            position: "right",
            offset: 50
        }],
        categoryAxis: {
            parseDates: true,
            minPeriod: 'fff',
            equalSpacing: true
        },
        startDuration: 0,
        graphs: [],
        plotAreaFillAlphas: 0.0,
        categoryField: "timestamp",
        'export': {
            enabled: false
        }
    };
}

return serialChart;

}); // define
