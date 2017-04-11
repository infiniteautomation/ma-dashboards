/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['amcharts/gauge', 'jquery'], function(AmCharts, $) {
'use strict';

function gaugeChart() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
          value: '=',
          point: '=',
          options: '=?',
          start: '@',
          end: '@',
          band1End: '@',
          band1Color: '@',
          band2End: '@',
          band2Color: '@',
          band3End: '@',
          band3Color: '@',
          interval: '@'
        },
        template: '<div ng-class="classes" class="amchart"></div>',
        link: function ($scope, $element, attributes) {
        	$scope.classes = {};
        	
            var options = defaultOptions();
            $.extend(options, $scope.options);
            axisChanged();
            var chart = AmCharts.makeChart($element[0], options);
            
            function axisChanged() {
                if ($scope.options && $scope.options.axes.length) {
                    return;
                }
                var axis = options.axes[0];
                axis.bands = [];
                axis.startValue = parseFloat($scope.start) || 0;
                axis.endValue = parseFloat($scope.end) || 100;
                if ($scope.band1End) {
                    var stop1 = parseFloat($scope.band1End);
                    axis.bands.push({
                        id: 'band1',
                        color: $scope.band1Color || "#84b761",
                        startValue: axis.startValue,
                        endValue: stop1
                    });
                    if (!$scope.end)
                        axis.endValue = stop1;
                }
                if ($scope.band1End && $scope.band2End) {
                    var stop2 = parseFloat($scope.band2End);
                    axis.bands.push({
                        id: 'band2',
                        color: $scope.band2Color || "#fdd400",
                        startValue: axis.bands[0].endValue,
                        endValue: stop2
                    });
                    if (!$scope.end)
                        axis.endValue = stop2;
                }
                if ($scope.band1End && $scope.band2End && $scope.band3End) {
                    var stop3 = parseFloat($scope.band3End);
                    axis.bands.push({
                        id: 'band3',
                        color: $scope.band3Color || "#cc4748",
                        startValue: axis.bands[1].endValue,
                        endValue: stop3
                    });
                    if (!$scope.end)
                        axis.endValue = stop3;
                }
                axis.valueInterval = parseFloat($scope.interval) || (axis.endValue - axis.startValue) / 5;
                if (chart) chart.validateNow();
            }
            
            $scope.$watchGroup(['start', 'end', 'band1End', 'band2End', 'band3End', 'end', 'interval',
                                'band1Color', 'band2Color', 'band3Color'], axisChanged);
            
            $scope.$watch('value', function(newValue, oldValue) {
                chart.arrows[0].setValue(newValue || 0);
                chart.axes[0].setBottomText(typeof newValue === 'number' ? newValue.toFixed(2) : '');
            });
            
            $scope.$watch('point.value', function(newValue, oldValue) {
                chart.arrows[0].setValue(newValue || 0);
                var rendered;
                if ($scope.point && typeof $scope.point.renderedValue === 'string') {
                    rendered = $scope.point.renderedValue;
                } else if (typeof newValue === 'number') {
                    rendered = newValue.toFixed(2);
                } else {
                    rendered = '';
                }
                chart.axes[0].setBottomText(rendered);
            });

            $scope.$watch('point.enabled', function(newValue) {
            	var disabled = newValue !== undefined && !newValue;
            	$scope.classes['point-disabled'] = disabled;
            });
        }
    };
}

function defaultOptions() {
    return {
        type: "gauge",
        theme: "light",
        addClassNames: true,
        axes: [{
            axisThickness: 1,
            axisAlpha: 0.5,
            tickAlpha: 0.5,
            startValue: 0,
            endValue: 100,
            bands: [],
            bottomText: "",
            bottomTextYOffset: -20
        }],
        arrows: [{}]
    };
}

return gaugeChart;

}); // define
