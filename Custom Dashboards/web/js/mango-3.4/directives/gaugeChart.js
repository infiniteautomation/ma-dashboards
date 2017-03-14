/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['amcharts/gauge', 'require', 'angular', './PointValueController'], function(AmCharts, require, angular, PointValueController) {
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
        template: '<div ng-class="classes" class="amchart"></div>',
        scope: {},
        controller: GaugeChartController,
        controllerAs: '$ctrl',
        bindToController: {
          point: '<?',
          pointXid: '@?',
          start: '<?',
          end: '<?',
          interval: '<?',
          band1End: '<?',
          band1Color: '@',
          band2End: '<?',
          band2Color: '@',
          band3End: '<?',
          band3Color: '@',
          radius: '@',
          valueOffset: '<?',
          valueFontSize: '<?',
          axisLabelFontSize: '<?',
          axisThickness: '<?',
          tickInterval: '<?',
          arrowInnerRadius: '<?',
          arrowAlpha: '<?',
          axisAlpha: '<?',
          options: '<?',
          value: '<?'
        },
        designerInfo: {
            translation: 'dashboards.v3.components.gaugeChart',
            icon: 'donut_large',
            category: 'pointValue',
            size: {
                width: '200px',
                height: '200px'
            },
            attributes: {
                point: {nameTr: 'dashboards.v3.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'dashboards.v3.components.dataPointXid', type: 'datapoint-xid'},
                band1Color: {type: 'color'},
                band2Color: {type: 'color'},
                band3Color: {type: 'color'}
            }
        }
    };
}


GaugeChartController.$inject = PointValueController.$inject;
function GaugeChartController() {
    PointValueController.apply(this, arguments);
    
    this.chartOptions = defaultOptions();
}

GaugeChartController.prototype = Object.create(PointValueController.prototype);
GaugeChartController.prototype.constructor = GaugeChartController;

GaugeChartController.prototype.$onInit = function() {
    this.chart = AmCharts.makeChart(this.$element.find('.amchart')[0], this.chartOptions);
    this.setGaugeValue();
};

GaugeChartController.prototype.$onChanges = function(changes) {
    var optionsChanged = false;
    for (var key in changes) {
        if (key !== 'value') {
            optionsChanged = true;
            break;
        }
    }
    
    if (optionsChanged) {
        this.updateGauge();
    }
    
    PointValueController.prototype.$onChanges.apply(this, arguments);
};

GaugeChartController.prototype.valueChangeHandler = function() {
    PointValueController.prototype.valueChangeHandler.apply(this, arguments);
    this.setGaugeValue();
};

GaugeChartController.prototype.setGaugeValue = function() {
    if (!this.chart) return;
    
    var value = this.getValue();
    var textValue = this.getTextValue();
    
    this.chart.arrows[0].setValue(value || 0);
    this.chart.axes[0].setBottomText(textValue);
};

GaugeChartController.prototype.updateGauge = function() {
    var options = angular.merge(this.chartOptions, this.options);
    var axis = options.axes[0];
    var arrow = options.arrows[0];
    
    axis.bands = [];
    axis.startValue = asNumber(this.start);
    axis.endValue = asNumber(this.end, 100);
    
    // jshint eqnull:true
    if (this.band1End != null) {
        var stop1 = asNumber(this.band1End);
        axis.bands.push({
            id: 'band1',
            color: this.band1Color || "#84b761",
            startValue: axis.startValue,
            endValue: stop1
        });
        if (!this.end)
            axis.endValue = stop1;
    }
    if (this.band1End != null && this.band2End != null) {
        var stop2 = asNumber(this.band2End);
        axis.bands.push({
            id: 'band2',
            color: this.band2Color || "#fdd400",
            startValue: axis.bands[0].endValue,
            endValue: stop2
        });
        if (!this.end)
            axis.endValue = stop2;
    }
    if (this.band1End != null && this.band2End != null && this.band3End != null) {
        var stop3 = asNumber(this.band3End);
        axis.bands.push({
            id: 'band3',
            color: this.band3Color || "#cc4748",
            startValue: axis.bands[1].endValue,
            endValue: stop3
        });
        if (!this.end)
            axis.endValue = stop3;
    }
    axis.valueInterval = asNumber(this.interval, (axis.endValue - axis.startValue) / 5);
    
    axis.radius = this.radius || '100%';
    axis.bottomTextYOffset =  asNumber(this.valueOffset, -20);
    axis.bottomTextFontSize =  asNumber(this.valueFontSize, 12);
    axis.axisThickness =  asNumber(this.axisThickness, 1);
    axis.axisAlpha =  asNumber(this.axisAlpha, 0.5);
    axis.tickAlpha =  asNumber(this.axisAlpha, 0.5);
    
    if (this.axisLabelFontSize != null) {
        axis.fontSize = asNumber(this.axisLabelFontSize);
    }
    if (this.tickInterval != null) {
        axis.minorTickInterval = asNumber(this.tickInterval);
    }
    
    arrow.nailRadius = asNumber(this.arrowInnerRadius, 8);
    arrow.innerRadius = arrow.nailRadius + 3;
    arrow.alpha = asNumber(this.arrowAlpha, 1);
    arrow.nailBorderAlpha = arrow.alpha;

    if (this.chart) {
        this.chart.validateNow();
    }
};

function asNumber(value, defaultValue) {
    if (typeof value === 'number' && isFinite(value)) {
        return value;
    } else if (typeof value === 'string') {
        try {
            return parseFloat(value);
        } catch (e) {}
    }
    return defaultValue || 0;
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
