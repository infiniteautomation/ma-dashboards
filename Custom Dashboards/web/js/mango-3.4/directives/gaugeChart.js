/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['amcharts/gauge', 'jquery'], function(AmCharts, $) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maGaugeChart
 * @restrict E
 * @description
 * `<ma-gauge-chart point="myPoint" style="width:100%; height:200px"></ma-gauge-chart>`
 * - This directive will display a gauge that can be tied to a data point's live value.
 * - You must use `<ma-get-point-value>` to provide a point value to `<ma-gauge-chart>`
 * - Note, you will need to set a width and height on the element.
 * - Options have been exposed via attributes, allowing you to set colors and ranges of multiple bands.
 * - <a ui-sref="dashboard.examples.singleValueDisplays.gauges">View Demo</a>
 *

 * @param {object} point The point object with the live value provided by `<ma-get-point-value>`.
 * @param {number=} value Allows you to set the gauge to a value that is not provided by the `point` attribute. Only use without the `point` attribute.
 * @param {number=} start Sets the starting value for the gauge.
 * @param {number=} end Sets the ending value for the gauge.
 * @param {number=} band-1-end Sets the ending value for the first band.
 * @param {string=} band-1-color Sets the color for the first band.
 * @param {number=} band-2-end Sets the ending value for the second band.
 * @param {string=} band-2-color Sets the color for the second band.
 * @param {number=} band-3-end Sets the ending value for the third band.
 * @param {string=} band-3-color Sets the color for the third band.
 * @param {number=} radius Sets the radius of the axis circled around the gauge. (default: 95%)
 * @param {number=} value-offset Sets the vertical offset of the value text. Negative moves the value up. (default: -20)
 * @param {number=} value-font-size Sets the fontsize of the value text. (default: 12)
 * @param {number=} axis-label-font-size Sets the fontsize of the labels around the axis.
 * @param {number=} axis-thickness Sets the thickness of the axis circle. (default: 1)
 * @param {number=} interval Sets the interval for each numbered tick on the gauge. (default: 6 evenly distributed numbered ticks)
 * @param {number=} tick-interval Sets the interval for the minor ticks. Divide this number into the numbered tick interval to get the number of minor ticks per numbered interval. (default: 5 evenly distributed minor ticks per numbered interval)
 * @param {number=} arrow-inner-radius Radius of the ring the arrow is attached to. (default: 8)
 * @param {number=} arrow-alpha Opacity of the arrow and the arrow ring. Ranges 0-1 as a decimal. (default: 1)
 * @param {number=} axis-alpha Opacity of the circular axis. Ranges 0-1 as a decimal. (default: 0.5)
 * @param {object=} options Extend [amCharts](https://www.amcharts.com/demos/angular-gauge/) configuration object for customizing design of the gauge.
 
 *
 * @usage
 * 
<md-input-container flex>
    <label>Choose a point</label>
    <ma-point-list limit="200" ng-model="myPoint"></ma-point-list>
</md-input-container>

<ma-get-point-value point="myPoint"></ma-get-point-value>

<p>Basic (defaults to 0-100)</p>
<ma-gauge-chart point="myPoint" style="width:100%; height:200px"></ma-gauge-chart>

<p>Set axis interval and start and end value</p>
<ma-gauge-chart point="myPoint" interval="10" start="-20" end="120"
style="width:100%; height:200px"></ma-gauge-chart>

<p>Set color bands</p>
<ma-gauge-chart point="myPoint" start="-20" interval="20" band-1-end="20"
band-2-end="80" band-2-color="yellow" band-3-end="100" style="width:100%; height:200px">
</ma-gauge-chart>

 *
 */
function gaugeChart() {
    return {
        restrict: 'E',
        replace: true,
        designerInfo: {
            translation: 'dashboards.v3.components.gaugeChart',
            icon: 'donut_large',
            category: 'pointValue'
        },
        scope: {
          value: '=?',
          pointXid: '@?',
          point: '<?',
          options: '=?',
          start: '@',
          end: '@',
          band1End: '@',
          band1Color: '@',
          band2End: '@',
          band2Color: '@',
          band3End: '@',
          band3Color: '@',
          interval: '@',
          radius: '@',
          valueOffset: '@',
          valueFontSize: '@',
          axisLabelFontSize: '@',
          axisThickness: '@',
          tickInterval: '@',
          arrowInnerRadius: '@',
          arrowAlpha: '@',
          axisAlpha: '@' 
        },
        template: '<div ng-class="classes" class="amchart"></div>',
        link: function ($scope, $element, attributes) {
        	$scope.classes = {
    	        'live-value': true
        	};

            var options = defaultOptions();
            $.extend(options, $scope.options);
            axisChanged();
            var chart = AmCharts.makeChart($element[0], options);

            function axisChanged() {
                if ($scope.options && $scope.options.axes.length) {
                    return;
                }
                var axis = options.axes[0];
                var arrow = options.arrows[0];
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
				
				axis.radius = $scope.radius || '95%';
				axis.bottomTextYOffset =  parseFloat($scope.valueOffset) || -20;
                axis.bottomTextFontSize =  parseFloat($scope.valueFontSize) || 12;
                axis.axisThickness =  parseFloat($scope.axisThickness) || 1;
                axis.axisAlpha =  parseFloat($scope.axisAlpha) || 0.5;
                axis.tickAlpha =  parseFloat($scope.axisAlpha) || 0.5;
                
                if ($scope.axisLabelFontSize) {
                    axis.fontSize = parseFloat($scope.axisLabelFontSize);
                }
                if ($scope.tickInterval) {
                    axis.minorTickInterval = parseFloat($scope.tickInterval);
                }
                
                arrow.nailRadius = parseFloat($scope.arrowInnerRadius) || 8;
                arrow.innerRadius = parseFloat($scope.arrowInnerRadius)+3 || 10;
                arrow.alpha = parseFloat($scope.arrowAlpha) || 1;
                arrow.nailBorderAlpha = parseFloat($scope.arrowAlpha) || 1;
                
                if (chart) chart.validateNow();
            }

            $scope.$watchGroup(['start', 'end', 'band1End', 'band2End', 'band3End', 'end', 'interval',
                                'band1Color', 'band2Color', 'band3Color'], axisChanged);

            $scope.$watch('value', function(newValue, oldValue) {
                chart.arrows[0].setValue(newValue || 0);
                chart.axes[0].setBottomText(typeof newValue === 'number' ? newValue.toFixed(2) : '');
            });

            $scope.$watch('point.value', function(newValue, oldValue) {
                // if gauge already has value set and newValue is undefined just ignore
                if (newValue === undefined && chart.arrows[0].value) return;

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
            startValue: 0,
            endValue: 100,
            bands: [],
            bottomText: ""
        }],
        arrows: [{
            nailAlpha: 0,
            borderAlpha: 0,
            nailBorderThickness: 6
        }]
    };
}

return gaugeChart;

}); // define
