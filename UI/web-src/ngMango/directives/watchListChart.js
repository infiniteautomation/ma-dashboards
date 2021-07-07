/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import watchListChartTemplate from './watchListChart.html';

 /**
  * @ngdoc directive
  * @name ngMango.directive:maWatchListChart
  * @restrict E
  * @description
  * `<ma-watch-list-chart></ma-watch-list-chart>`
  * - Use `<ma-watch-list-chart>` to display the watch list's custom chart on a custom page.
  * - Use with `<ma-watch-list-select>` and pass in data from a watch list object.
  *
  * @param {object[]} points Array of points to add to the chart (`myWatchlist.data.selectedPoints`).
  * @param {object} watch-list Watch list object, passed in from `watch-list-get`
  * @param {expression} to Should evaluate to a date, moment, or timestamp. Time to start charting. Can be from `dateBar` or `<ma-date-range-picker>`.
  * @param {expression} from Should evaluate to a date, moment, or timestamp. Time to end charting. Can be from `dateBar` or `<ma-date-range-picker>`.
  * @param {string} rollup-type Rollup type.
  * @param {number} rollup-intervals Rollup interval number.
  * @param {expression} rollup-interval-period Should evaluate to string. Rollup interval unit. e.g. 'seconds'
  * @param {string} chart-height Height of the chart. Specify with px or % (`400px`).
  * @param {boolean=} edit-mode Set to `true` to display chart customization controls. (Defaults to `false`).
  * @param {boolean=} stats-tab Set to `true` to display stats tab. (Defaults to `false`_.
  * @param {boolean=} export Set to `true` to display chart export and annotation options. Defaults to `false`.
  * @param {object=} options extend AmCharts configuration object for customizing design of the chart
  *     (see [amCharts](https://docs.amcharts.com/3/javascriptcharts/AmSerialChart))
  * @param {boolean=} legend Set to false to hide the legend. (Defaults to `true`)
  * @param {boolean=} balloon  Set to false to hide the balloon. (Defaults to `true`)
  * @param {function=} on-values-updated Pass in a function or expression to be evaluated when the values update. (eg.
  * `on-values-updated="$ctrl.valuesUpdated($values)"`)
  *
  * 
  * @usage
  * <ma-watch-list-select no-select="true" watch-list-xid="WatchList323" watch-list="myWatchlist"></ma-watch-list-select>
  * <ma-watch-list-chart flex add-checked="myWatchlist.data.selectedPoints" chart-config="myWatchlist.data.chartConfig"
  *     to="dateBar.to" from="dateBar.from" rollup-type="dateBar.rollupType" rollup-interval-number="dateBar.rollupIntervals"
  *     rollup-interval-period="dateBar.rollupIntervalPeriod" chart-height="450px"></watch-list-chart>
  *
  */

watchListChart.$inject = ['maUtil'];
function watchListChart(Util) {

    class WatchListChartController {
        static get $$ngIsClass() { return true; }
        
        constructor() {
            this.chartOptions = {};
        }
    
        $onInit() {
            //if (this['export'] === undefined) this['export'] = true;
            if (this.legend === undefined) this.legend = true;
            if (this.balloon === undefined) this.balloon = true;
        }
    
        $onChanges(changes) {
            if (changes.watchList || changes.points) {
                this.filterPoints();
                this.buildOptions();
            }
    //        if (changes.parameters && this.watchList) {
    //            this.watchList.getPoints(this.parameters).then(function(points) {
    //                this.points = points;
    //            }.bind(this));
    //        }
        }
    
        filterPoints() {
            if (!this.watchList || !Array.isArray(this.points)) {
                this.chartedPoints = [];
                return;
            }
            
            // ensure the watch list point configs are up to date
            this.watchList.updatePointConfigs();
    
            // select points based on the watch list data chart config
            this.chartedPoints = this.watchList.findSelectedPoints(this.points);
            
            const selectedTags = this.watchList.selectedTagKeys();
            
            this.graphOptions = this.chartedPoints.map(point => {
                const pointOptions = point.watchListConfig;
    
                const fields = selectedTags.map(tagKey => {
                    return point.getTag(tagKey);
                });
                
                const graphOption = Object.assign({}, pointOptions);
                graphOption.title = fields.join(' \u2014 ');
                
                return graphOption;
            });
        }
    
        buildOptions() {
            this.chartOptions = {};
            if (!this.watchList) {
                return;
            }
    
            const chartConfig = this.watchList.data.chartConfig || {};
            const valueAxes = chartConfig.valueAxes || {};
            
            let anyMinOrMaxSet = false;
            
            this.chartOptions.valueAxes = [];
            ['left', 'right', 'left-2', 'right-2'].forEach(axisName => {
                const axis = valueAxes[axisName] || {};
    
                const valueAxis = {
                    axisColor: axis.color || '',
                    color: axis.color || '',
                    stackType: axis.stackType || 'none',
                    title: axis.title || ''
                };
    
                if (isFinite(axis.minimum)) {
                    valueAxis.minimum = axis.minimum;
                    valueAxis.strictMinMax = true;
                    anyMinOrMaxSet = true;
                }
                if (isFinite(axis.maximum)) {
                    valueAxis.maximum = axis.maximum;
                    valueAxis.strictMinMax = true;
                    anyMinOrMaxSet = true;
                }
                if (isFinite(axis.gridCount)) {
                    valueAxis.gridCount = axis.gridCount;
                    valueAxis.autoGridCount = false;
                }
                
                this.chartOptions.valueAxes.push(valueAxis);
            });
            
            if (anyMinOrMaxSet) {
                this.chartOptions.synchronizeGrid = false;
            }
            Util.deepMerge(this.chartOptions, this.options);
        }
    
        valuesUpdatedHandler(values) {
            if (this.onValuesUpdated)
                this.onValuesUpdated({$values: values});
        }
    }
    
    return {
        restrict: 'E',
        template: watchListChartTemplate,
        scope: {},
        controller: WatchListChartController,
        controllerAs: '$ctrl',
        bindToController: {
            options: '<?',
            watchList: '<',
            points: '<',
            'export': '<?',
            legend: '<?',
            balloon: '<?',
            from: '<?',
            to: '<?',
            rollupType: '<?',
            rollupIntervals: '<?',
            rollupIntervalPeriod: '<?',
            simplifyTolerance: '<?',
            onValuesUpdated: '&?'
        },
        designerInfo: {
            translation: 'ui.components.watchListChart',
            icon: 'remove_red_eye',
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
                simplifyTolerance: {defaultValue: 'dateBar.simplifyTolerance'}
            }
        }
    };
}

export default watchListChart;
