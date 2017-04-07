/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['amcharts/serial', 'jquery'], function(AmCharts, $) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maTankLevel
 * @restrict E
 * @description
 * `<ma-tank-level point="myPoint" color="" max="" style="width:300px; height:200px;"></ma-tank-level>`
 * - This directive will display a custom data visualization which represents a tank.
 * - The volume of 'liquid' within the tank increases in height with increases in point value.
 * - Note: you must set a width and height on the element.
 * - <a ui-sref="dashboard.examples.singleValueDisplays.tanks">View Demo</a>

 * @param {object} point The point object with the live value provided by `<ma-get-point-value>`.
 * @param {number=} max Sets the max value for a 100% filled tank.
 * @param {string=} color Sets the fill color for the tank visualization.
 * @param {object=} options Extend [amCharts](https://www.amcharts.com/) configuration object for customizing the design of the tank.
 * @param {number=} value Allows you to set the tank's fill height to a value that is not provided by the `point` attribute. Only use without the `point` attribute.
 *
 * @usage
 * <ma-tank-level point="myPoint" color="{{choosenColor}}" max="{{max}}" style="width:300px; height:200px; position:absolute; top:0; left:0px; z-index:2">
</ma-tank-level>
 *
 */
function tankLevel(maDashboardsInsertCss, cssInjector) {
    var cssContent = '.amcharts-graph-tank-remainder .amcharts-graph-column-bottom {display: none}';

    return {
        restrict: 'E',
        replace: true,
        scope: {
          value: '=',
          point: '=',
          options: '=?',
          max: '@',
          color: '@'
        },
        template: '<div class="amchart" ng-class="classes"></div>',
        compile: function($element, attributes) {
            if (maDashboardsInsertCss) {
                cssInjector.injectStyle(cssContent, this.name);
            }

            // post-link
            return function ($scope, $element, attributes) {
                $scope.classes = {
                    'live-value': true
                };

                var options = defaultOptions();
                var chart = AmCharts.makeChart($element[0], $.extend(options, $scope.options));
                var max = 100;
                var tankLevel = 0;

                $scope.$watch('max', function(newValue, oldValue) {
                	if (newValue === undefined) return;
                	max = parseFloat(newValue);
                    chart.dataProvider[0].remainder = max - tankLevel;
                    chart.validateData();
                });

                $scope.$watch('color', function(newValue, oldValue) {
                	if (newValue === undefined) return;
                	options.graphs[0].fillColors = newValue;
                    chart.validateData();
                });

                $scope.$watch('value', function(newValue, oldValue) {
                    tankLevel = newValue || 0;
                    chart.dataProvider[0].tankLevel = tankLevel;
                    chart.dataProvider[0].remainder = max - tankLevel;
                    chart.validateData();
                });

                $scope.$watch('point.value', function(newValue, oldValue) {
                    // if gauge already has value set and newValue is undefined just ignore
                    if (newValue === undefined) return;
                    
                    var rendered;
                    if ($scope.point && typeof $scope.point.renderedValue === 'string') {
                        rendered = $scope.point.renderedValue;
                    } else if (typeof newValue === 'number') {
                        rendered = newValue.toFixed(2);
                    } else {
                        rendered = '';
                    }
                    tankLevel = newValue || 0;

                    chart.dataProvider[0].tankLevel = tankLevel;
                    chart.dataProvider[0].remainder = max - tankLevel;
                    chart.dataProvider[0].renderedValue = rendered;
                    chart.validateData();
                });

                $scope.$watch('point.enabled', function(newValue) {
                	var disabled = newValue !== undefined && !newValue;
                	$scope.classes['point-disabled'] = disabled;
                });
            };
        }
    };
}

function defaultOptions() {
    return {
        type: "serial",
        theme: "light",
        addClassNames: true,
        dataProvider: [{
            tank: "tank1",
            remainder: 100.0,
            tankLevel: 0.0
        }],
        valueAxes: [{
            axisAlpha: 0.0,
            gridAlpha: 0.0,
            labelsEnabled: false,
            stackType: "100%"
        }],
        categoryAxis: {
            gridPosition: "start",
            axisAlpha: 0.0,
            gridAlpha: 0.0,
            labelsEnabled: false
        },
        depth3D: 100,
        angle: 30,
        startDuration: 0,
        graphs: [{
            id: "tank-level",
            type: "column",
            valueField: "tankLevel",
            balloonText: "",
            fillAlphas: 0.8,
            lineAlpha: 0.5,
            lineThickness: 2,
            columnWidth: 1,
            topRadius: 1,
            lineColor: '#cdcdcd',
            fillColors: "#67b7dc"
            //showOnAxis: true,
            //clustered: false,
            //labelText: "[[percents]] %",
            //labelPosition: "top"
        },{
            id: "tank-remainder",
            type: "column",
            valueField: "remainder",
            balloonText: "",
            fillAlphas: 0.3,
            lineAlpha: 0.5,
            lineThickness: 2,
            columnWidth: 1,
            topRadius: 1,
            lineColor: '#cdcdcd'
            //showOnAxis: true
        }],
        plotAreaFillAlphas: 0.0,
        categoryField: "tank",
        'export': {
            enabled: false
        }
    };
}

tankLevel.$inject = ['maDashboardsInsertCss', 'cssInjector'];

return tankLevel;

}); // define
