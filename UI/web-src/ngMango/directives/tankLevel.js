/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import AmCharts from 'amcharts/serial';import angular from 'angular';
import PointValueController from './PointValueController';

/**
 * @ngdoc directive
 * @name ngMango.directive:maTankLevel
 * @restrict E
 * @description
 * `<ma-tank-level point="myPoint" color="" max="" style="width:300px; height:200px;"></ma-tank-level>`
 * - This directive will display a custom data visualization which represents a tank.
 * - The volume of 'liquid' within the tank increases in height with increases in point value.
 * - Note: you must set a width and height on the element.
 * - <a ui-sref="ui.examples.singleValueDisplays.tanks">View Demo</a>

 * @param {object=} point A data point object from a watch list, the `maPoint` service, or `<ma-get-point-value>` component.
 * @param {string=} point-xid Instead of supplying a data point object, you can supply it's XID.
 * @param {number=} max Sets the max value for a 100% filled tank.
 * @param {string=} color Sets the fill color for the tank visualization.
 * @param {object=} options Extend [amCharts](https://www.amcharts.com/) configuration object for customizing the design of the tank.
 * @param {number=} value Allows you to set the tank's fill height to a value that is not provided by the `point` attribute.
 *     Only use without the `point` attribute.
 *
 * @usage
 * <ma-tank-level point="myPoint" color="{{choosenColor}}" max="max" style="width:300px; height:200px;">
</ma-tank-level>
 *
 */
function tankLevel() {
    return {
        restrict: 'E',
        template: '<div class="amchart"></div>',
        scope: {},
        controller: TankLevelController,
        bindToController: {
          point: '<?',
          pointXid: '@?',
          max: '<?',
          min: '<?',
          color: '@?',
          value: '<?',
          renderValue: '&?',
          options: '<?'
        },
        designerInfo: {
            translation: 'ui.components.tankLevel',
            icon: 'battery_full',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid'},
                color: {type: 'color'}
            },
            size: {
                width: '200px',
                height: '200px'
            }
        }
    };
}

TankLevelController.$inject = PointValueController.$inject;
function TankLevelController() {
    PointValueController.apply(this, arguments);
    
    this.chartOptions = defaultOptions();
}

TankLevelController.prototype = Object.create(PointValueController.prototype);
TankLevelController.prototype.constructor = TankLevelController;

TankLevelController.prototype.$onInit = function() {
    this.updateChart();
    this.chart = AmCharts.makeChart(this.$element.find('.amchart')[0], this.chartOptions);
    this.updateChartValue();
};

TankLevelController.prototype.$onChanges = function(changes) {
    PointValueController.prototype.$onChanges.apply(this, arguments);
    
    if (changes.max && !changes.max.isFirstChange() || changes.min && !changes.min.isFirstChange()) {
        this.updateChartValue();
    }
    if (changes.color && !changes.color.isFirstChange() || changes.options && !changes.options.isFirstChange()) {
        this.updateChart();
    }
};

TankLevelController.prototype.valueChangeHandler = function() {
    PointValueController.prototype.valueChangeHandler.apply(this, arguments);
    this.updateChartValue();
};

TankLevelController.prototype.updateChartValue = function() {
    if (!this.chart) return;
    
    var value = this.getValue() || 0;
    var textValue = this.getTextValue();

    var max = this.max != null ? this.max : 100;
    var min = this.min != null ? this.min : 0;
    var range = max - min;
    
    var tankLevel = (value - min) / range * 100;
    var remainder = 100 - tankLevel;
    
    this.chart.dataProvider[0].tankLevel = tankLevel;
    this.chart.dataProvider[0].remainder = remainder;
    this.chart.dataProvider[0].renderedValue = textValue;
    this.chart.validateData();
};

TankLevelController.prototype.updateChart = function() {
    var options = angular.merge(this.chartOptions, this.options);

    if (this.color) {
        options.graphs[0].fillColors = this.color;
    }
    
    if (this.chart) {
        this.chart.validateNow();
    }
};

function defaultOptions() {
    return {
        type: 'serial',
        theme: 'light',
        addClassNames: true,
        dataProvider: [{
            tank: 'tank1',
            remainder: 100.0,
            tankLevel: 0.0
        }],
        valueAxes: [{
            axisAlpha: 0.0,
            gridAlpha: 0.0,
            labelsEnabled: false,
            stackType: '100%'
        }],
        categoryAxis: {
            gridPosition: 'start',
            axisAlpha: 0.0,
            gridAlpha: 0.0,
            labelsEnabled: false
        },
        depth3D: 100,
        angle: 30,
        startDuration: 0,
        graphs: [{
            id: 'tank-level',
            type: 'column',
            valueField: 'tankLevel',
            balloonText: '',
            fillAlphas: 0.8,
            lineAlpha: 0.5,
            lineThickness: 2,
            columnWidth: 1,
            topRadius: 1,
            lineColor: '#cdcdcd',
            fillColors: '#67b7dc'
            //showOnAxis: true,
            //clustered: false,
            //labelText: '[[percents]] %',
            //labelPosition: 'top'
        },{
            id: 'tank-remainder',
            type: 'column',
            valueField: 'remainder',
            balloonText: '',
            fillAlphas: 0.3,
            lineAlpha: 0.5,
            lineThickness: 2,
            columnWidth: 1,
            topRadius: 1,
            lineColor: '#cdcdcd'
            //showOnAxis: true
        }],
        plotAreaFillAlphas: 0.0,
        categoryField: 'tank',
        'export': {
            enabled: false
        }
    };
}

export default tankLevel;


