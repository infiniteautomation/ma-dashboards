/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */


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
  *
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

define(['require', 'angular'], function(require, angular) {
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

WatchListChartController.$inject = [];
function WatchListChartController() {
    this.chartOptions = {};
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
    var selectedPoints = chartConfig.selectedPoints || [];
    
	// convert old object with point names as keys to array form
	if (!Array.isArray(selectedPoints)) {
		var newSelectedPointArray = [];
		for (var ptName in selectedPoints) {
			var config = selectedPoints[ptName];
			config.name = ptName;
			newSelectedPointArray.push(config);
		}
		selectedPoints = chartConfig.selectedPoints = newSelectedPointArray;
	}
	
	var selectedPointConfigsByName = {};
    var selectedPointConfigsByXid = {};
    selectedPoints.forEach(function(ptConfig) {
    	selectedPointConfigsByName[ptConfig.name] = ptConfig;
    	if (ptConfig.xid) {
    		selectedPointConfigsByXid[ptConfig.xid] = ptConfig;
    	}
    });
    
    var pointNameCounts = {};
    allPoints.forEach(function(pt) {
    	var count = pointNameCounts[pt.name];
    	pointNameCounts[pt.name] = (count || 0) + 1;
    });
    
    var graphOptions = this.graphOptions = [];
    this.chartedPoints = allPoints.filter(function(point) {
        var pointOptions = selectedPointConfigsByXid[point.xid];
        if (!pointOptions && pointNameCounts[point.name] === 1) {
        	pointOptions = selectedPointConfigsByName[point.name];
        }
        if (pointOptions) {
            const graphOption = Object.assign({}, pointOptions);
            const fields = [];
            
            let deviceTagAdded;
            let nameTagAdded;

            if (Array.isArray(watchList.data.selectedTags)) {
                watchList.data.selectedTags.forEach(tagKey => {
                    if (tagKey === 'device') deviceTagAdded = true;
                    if (tagKey === 'name') nameTagAdded = true;
                    fields.push(point.tags[tagKey]);
                });
            }
            if (!deviceTagAdded) {
                fields.push(point.deviceName);
            }
            if (!nameTagAdded) {
                fields.push(point.name);
            }
            graphOption.title = fields.join(' \u2014 ');
            
            graphOptions.push(graphOption);
            return true;
        }
    });
};

WatchListChartController.prototype.buildOptions = function() {
    this.chartOptions = {};
    if (!this.watchList) {
        return;
    }

    var chartConfig = this.watchList.data.chartConfig || {};
    var valueAxes = chartConfig.valueAxes || {};
    
    this.chartOptions.valueAxes = [];
    ['left', 'right', 'left-2', 'right-2'].forEach(function(axisName) {
        var axis = valueAxes[axisName] || {};
        this.chartOptions.valueAxes.push({
            axisColor: axis.color || '',
            color: axis.color || '',
            stackType: axis.stackType || 'none',
            title: axis.title || ''
        });
    }.bind(this));
};

WatchListChartController.prototype.valuesUpdatedHandler = function(values) {
    if (this.onValuesUpdated)
        this.onValuesUpdated({$values: values});
};

return watchListChart;

}); // define