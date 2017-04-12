/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */


 /**
  * @ngdoc directive
  * @name ngMango.maWatchListChart
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

watchListChart.$inject = [];
function watchListChart() {
    return {
        restrict: 'E',
        templateUrl: require.toUrl('./watchListChart.html'),
        scope: {},
        controller: WatchListChartController,
        controllerAs: '$ctrl',
        bindToController: {
            watchList: '<',
            //parameters: '<?',
            points: '<',
            'export': '<?',
            legend: '<?',
            balloon: '<?',
            from: '<?',
            to: '<?',
            rollupType: '<?',
            rollupIntervals: '<?',
            rollupIntervalPeriod: '<?',
            onValuesUpdated: '&?'
        },
        designerInfo: {
            translation: 'ui.components.watchListChart',
            icon: 'show_chart',
            category: 'watchLists',
            size: {
                width: '400px',
                height: '200px'
            },
            attributes: {
                watchList: {defaultValue: 'designer.watchList'},
                points: {defaultValue: 'designer.points'},
                from: {defaultValue: 'dateBar.from'},
                to: {defaultValue: 'dateBar.to'},
                rollupType: {defaultValue: 'dateBar.rollupType'},
                rollupIntervals: {defaultValue: 'dateBar.rollupIntervals'},
                rollupIntervalPeriod: {defaultValue: 'dateBar.rollupIntervalPeriod'},
            }
        }
    };
}

WatchListChartController.$inject = ['uiSettings'];
function WatchListChartController(uiSettings) {
    this.chartOptions = {};

    this.defaultAxisColor = uiSettings.theming.THEMES[uiSettings.activeTheme].isDark ? '#FFFFFF' : '#000000';
}

WatchListChartController.prototype.$onInit = function() {
    //if (this['export'] === undefined) this['export'] = true;
    if (this.legend === undefined) this.legend = true;
    if (this.balloon === undefined) this.balloon = true;
};

WatchListChartController.prototype.$onChanges = function(changes) {
    if (changes.watchList || changes.points) {
        this.filterPoints();
        this.buildOptions();
    }
//    if (changes.parameters && this.watchList) {
//        this.watchList.getPoints(this.parameters).then(function(points) {
//            this.points = points;
//        }.bind(this));
//    }
};

WatchListChartController.prototype.filterPoints = function() {
    var watchList = this.watchList || {data:{}};
    var allPoints = this.points || [];
    var chartConfig = watchList.data.chartConfig || {};
    var selectedPoints = chartConfig.selectedPoints || {};
    var graphOptions = this.graphOptions = [];
    
    this.chartedPoints = allPoints.filter(function(point) {
        var pointOptions = selectedPoints[point.name];
        if (pointOptions) {
            graphOptions.push(pointOptions);
            return true;
        }
    });
};

WatchListChartController.prototype.buildOptions = function() {
    this.chartOptions = {};
    if (!this.watchList) {
        return;
    }
    var defaultColor = this.defaultAxisColor;
    var chartConfig = this.watchList.data.chartConfig || {};
    var valueAxes = chartConfig.valueAxes || {};
    
    this.chartOptions.valueAxes = [];
    ['left', 'right', 'left-2', 'right-2'].forEach(function(axisName) {
        var axis = valueAxes[axisName] || {};
        this.chartOptions.valueAxes.push({
            axisColor: axis.color || defaultColor,
            color: axis.color || defaultColor,
            stackType: axis.stackType || 'none'
        });
    }.bind(this));
};

WatchListChartController.prototype.valuesUpdatedHandler = function(values) {
    if (this.onValuesUpdated)
        this.onValuesUpdated({$values: values});
};

return watchListChart;

}); // define