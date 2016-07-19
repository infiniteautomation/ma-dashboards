/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['./maServices',
        './maFilters',
        './directives/pointList',
        './directives/filteringPointList',
        './directives/pointValue',
        './directives/pointValues',
        './directives/pointStatistics',
        './directives/tankLevel',
        './directives/gaugeChart',
        './directives/serialChart',
        './directives/pieChart',
        './directives/clock',
        './directives/stateChart',
        './directives/copyBlurred',
        './directives/tr',
        './directives/datePicker',
        './directives/dateRangePicker',
        './directives/statisticsTable',
        './directives/startsAndRuntimesTable',
        './directives/setPointValue',
        './directives/switchImg',
        './directives/calc',
        './directives/intervalPicker',
        './directives/intervalTypePicker',
        './directives/pointQuery',
        './directives/getPointValue',
        './directives/jsonStore',
        './directives/focusOn',
        './directives/enter',
        './directives/now',
        './directives/fn',
        './directives/pointHierarchy',
        './directives/pagingPointList',
        './directives/dataSourceList',
        './directives/deviceNameList',
        './directives/dataSourceQuery',
        './directives/deviceNameQuery',
        './filters/trFilter',
        'angular',
        'require'
], function(maServices, maFilters, pointList, filteringPointList, pointValue, pointValues, pointStatistics,
        tankLevel, gaugeChart, serialChart, pieChart, clock, stateChart, copyBlurred, tr,
        datePicker, dateRangePicker, statisticsTable, startsAndRuntimesTable, setPointValue, switchImg, calc,
        intervalPicker, intervalTypePicker, pointQuery, getPointValue,
        jsonStore, focusOn, enter, now, fn, pointHierarchy, pagingPointList, dataSourceList, deviceNameList,
        dataSourceQuery, deviceNameQuery, trFilter, angular, require) {
'use strict';
/**
 * @ngdoc overview
 * @name maDashboards
 *
 *
 * @description
 * The maDashboards module handles loading of the custom directives used for creating a Mango 3.0 dashboard.
 *
 *
**/
var maDashboards = angular.module('maDashboards', ['maServices', 'maFilters']);

maDashboards.directive('maFilteringPointList', filteringPointList);
maDashboards.directive('maPointList', pointList);
maDashboards.directive('maPointValue', pointValue);
maDashboards.directive('maPointValues', pointValues);
maDashboards.directive('maPointStatistics', pointStatistics);
maDashboards.directive('maTankLevel', tankLevel);
maDashboards.directive('maGaugeChart', gaugeChart);
maDashboards.directive('maSerialChart', serialChart);
maDashboards.directive('maPieChart', pieChart);
maDashboards.directive('maClock', clock);
maDashboards.directive('maStateChart', stateChart);
maDashboards.directive('maCopyBlurred', copyBlurred);
maDashboards.directive('maTr', tr);
maDashboards.directive('maDatePicker', datePicker);
maDashboards.directive('maDateRangePicker', dateRangePicker);
maDashboards.directive('maStatisticsTable', statisticsTable);
maDashboards.directive('maStartsAndRuntimesTable', startsAndRuntimesTable);
maDashboards.directive('maSetPointValue', setPointValue);
maDashboards.directive('maSwitchImg', switchImg);
maDashboards.directive('maCalc', calc);
maDashboards.directive('maIntervalPicker', intervalPicker);
maDashboards.directive('maIntervalTypePicker', intervalTypePicker);
maDashboards.directive('maPointQuery', pointQuery);
maDashboards.directive('maGetPointValue', getPointValue);
maDashboards.directive('maJsonStore', jsonStore);
maDashboards.directive('maFocusOn', focusOn);
maDashboards.directive('maEnter', enter);
maDashboards.directive('maNow', now);
maDashboards.directive('maFn', fn);
maDashboards.directive('maPointHierarchy', pointHierarchy);
maDashboards.directive('maPagingPointList', pagingPointList);
maDashboards.directive('maDataSourceList', dataSourceList);
maDashboards.directive('maDeviceNameList', deviceNameList);
maDashboards.directive('maDataSourceQuery', dataSourceQuery);
maDashboards.directive('maDeviceNameQuery', deviceNameQuery);
maDashboards.filter('tr', trFilter);

maDashboards.constant('maDashboardsInsertCss', true);

maDashboards.config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('mangoHttpInterceptor');
}]);

maDashboards.run(['$rootScope', 'mangoWatchdog', 'maDashboardsInsertCss', 'cssInjector',
                  function($rootScope, mangoWatchdog, maDashboardsInsertCss, cssInjector) {
	$rootScope.Math = Math;
    $rootScope.mangoWatchdog = mangoWatchdog;
	mangoWatchdog.reset();

	if (maDashboardsInsertCss) {
	    cssInjector.injectLink(require.toUrl('./maDashboards.css'));
	}

	$rootScope.range = function(start, end) {
		var result = [];
		for (var i = start; i <= end; i++)
			result.push(i);
		return result;
	};

    $rootScope.rollupTypes = [
        {type: 'NONE', nonNumeric: true, label: 'None'},
        {type: 'AVERAGE', nonNumeric: false, label: 'Average'},
        {type: 'DELTA', nonNumeric: false, label: 'Delta'},
        {type: 'MINIMUM', nonNumeric: false, label: 'Minimum'},
        {type: 'MAXIMUM', nonNumeric: false, label: 'Maximum'},
        {type: 'ACCUMULATOR', nonNumeric: false, label: 'Accumulator'},
        {type: 'SUM', nonNumeric: false, label: 'Sum'},
        {type: 'FIRST', nonNumeric: true, label: 'First'},
        {type: 'LAST', nonNumeric: true, label: 'Last'},
        {type: 'COUNT', nonNumeric: true, label: 'Count'},
        {type: 'INTEGRAL', nonNumeric: false, label: 'Integral'}
        //{name: 'FFT', nonNumeric: false}
    ];

    $rootScope.timePeriodTypes = [
        {type: 'SECONDS', label: 'Seconds'},
        {type: 'MINUTES', label: 'Minutes'},
        {type: 'HOURS', label: 'Hours'},
        {type: 'DAYS', label: 'Days'},
        {type: 'WEEKS', label: 'Weeks'},
        {type: 'MONTHS', label: 'Months'},
        {type: 'YEARS', label: 'Years'}
    ];

    $rootScope.chartTypes = [
        {type: 'line', label: 'Line'},
        {type: 'smoothedLine', label: 'Smoothed'},
        {type: 'step', label: 'Step'},
        {type: 'column', label: 'Bar'}
    ];

    $rootScope.relativeDateTypes = [
        {type: "", label: 'Now'},
        {type: "moment:'subtract':5:'minutes'", label: '5 minutes ago'},
        {type: "moment:'subtract':15:'minutes'", label: '15 minutes ago'},
        {type: "moment:'subtract':30:'minutes'", label: '30 minutes ago'},
        {type: "moment:'subtract':1:'hours'", label: '1 hour ago'},
        {type: "moment:'subtract':3:'hours'", label: '3 hours ago'},
        {type: "moment:'subtract':5:'hours'", label: '6 hours ago'},
        {type: "moment:'subtract':12:'hours'", label: '12 hours ago'},
        {type: "moment:'startOf':'day'", label: 'Start of day'},
        {type: "moment:'subtract':1:'days'|moment:'startOf':'day'", label: 'Start of previous day'},
        {type: "moment:'subtract':1:'days'", label: '1 day ago'},
        {type: "moment:'startOf':'week'", label: 'Start of week'},
        {type: "moment:'subtract':1:'weeks'|moment:'startOf':'week'", label: 'Start of last week'},
        {type: "moment:'subtract':1:'weeks'", label: '1 week ago'},
        {type: "moment:'subtract':2:'weeks'", label: '2 weeks ago'},
        {type: "moment:'startOf':'month'", label: 'Start of month'},
        {type: "moment:'subtract':1:'months'|moment:'startOf':'month'", label: 'Start of last month'},
        {type: "moment:'subtract':1:'months'", label: '1 month ago'},
        {type: "moment:'subtract':3:'months'", label: '3 months ago'},
        {type: "moment:'subtract':6:'months'", label: '6 months ago'},
        {type: "moment:'startOf':'year'", label: 'Start of year'},
        {type: "moment:'subtract':1:'years'|moment:'startOf':'year'", label: 'Start of last year'},
        {type: "moment:'subtract':1:'years'", label: '1 year ago'}
    ];

    $rootScope.dateRangePresets = [
        {type: "LAST_5_MINUTES", label: 'Last 5 minutes'},
        {type: "LAST_15_MINUTES", label: 'Last 15 minutes'},
        {type: "LAST_30_MINUTES", label: 'Last 30 minutes'},
        {type: "LAST_1_HOURS", label: 'Last 1 hours'},
        {type: "LAST_3_HOURS", label: 'Last 3 hours'},
        {type: "LAST_6_HOURS", label: 'Last 6 hours'},
        {type: "LAST_12_HOURS", label: 'Last 12 hours'},
        {type: "LAST_1_DAYS", label: 'Last 1 days'},
        {type: "LAST_1_WEEKS", label: 'Last 1 weeks'},
        {type: "LAST_2_WEEKS", label: 'Last 2 weeks'},
        {type: "LAST_1_MONTHS", label: 'Last 1 months'},
        {type: "LAST_3_MONTHS", label: 'Last 3 months'},
        {type: "LAST_6_MONTHS", label: 'Last 6 months'},
        {type: "LAST_1_YEARS", label: 'Last 1 years'},
        {type: "LAST_2_YEARS", label: 'Last 2 years'},
        {type: "DAY_SO_FAR", label: 'Today so far'},
        {type: "WEEK_SO_FAR", label: 'This week so far'},
        {type: "MONTH_SO_FAR", label: 'This month so far'},
        {type: "YEAR_SO_FAR", label: 'This year so far'},
        {type: "PREVIOUS_DAY", label: 'Yesterday'},
        {type: "PREVIOUS_WEEK", label: 'Previous week'},
        {type: "PREVIOUS_MONTH", label: 'Previous month'},
        {type: "PREVIOUS_YEAR", label: 'Previous year'}
    ];
}]);

return maDashboards;

}); // require
