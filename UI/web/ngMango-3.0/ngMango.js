/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['./ngMangoServices',
        './ngMangoFilters',
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
        './directives/trAriaLabel',
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
        './directives/dataSourceScrollList',
        './directives/deviceNameList',
        './directives/deviceNameScrollList',
        './directives/dataSourceQuery',
        './directives/deviceNameQuery',
        './directives/userNotesTable',
        './directives/eventsTable',
        './directives/watchListGet',
        './directives/watchListSelect',
        './directives/arrayInput',
        './directives/emptyInput',
        './directives/watchListList',
        './directives/watchListChart',
        './directives/pointHierarchySelect',
        './directives/filteringDeviceNameList',
        './directives/filteringDataSourceList',
        './directives/filteringPointHierarchySelect',
        './directives/accordion',
        './directives/accordionSection',
        './directives/draggable',
        './directives/dropzone',
        './directives/barDisplay',
        './directives/indicator',
        './directives/validationMessages',
        './directives/scaleTo',
        './directives/change',
        './directives/switch',
        './components/queryBuilder/queryBuilder',
        './components/queryBuilder/queryGroup',
        './components/queryBuilder/queryPredicate',
        './components/pointHierarchyBrowser/pointHierarchyBrowser',
        './components/pointHierarchyBrowser/pointHierarchyPointSelector',
        './components/pointHierarchyBrowser/pointHierarchyFolder',
        './components/watchListParameters/watchListParameters',
        './components/imageSlider/imageSlider',
        './components/userEditor/userEditor',
        './components/userSelect/userSelect',
        './components/systemSettingEditor/systemSettingEditor',
        './components/permissionsMenu/permissionsMenu',
        './components/configExport/configExport',
        './components/configImport/configImport',
        './components/configImportDialog/configImportDialog',
        './components/maMap/maMap',
        'ng-map',
        './animations/slideUp',
        'angular',
        'require',
        'moment-timezone'
], function(ngMangoServices, ngMangoFilters, pointList, filteringPointList, pointValue, pointValues, pointStatistics,
        tankLevel, gaugeChart, serialChart, pieChart, clock, stateChart, copyBlurred, tr, trAriaLabel,
        datePicker, dateRangePicker, statisticsTable, startsAndRuntimesTable, setPointValue, switchImg, calc,
        intervalPicker, intervalTypePicker, pointQuery, getPointValue,
        jsonStore, focusOn, enter, now, fn, pointHierarchy, pagingPointList, dataSourceList,
        dataSourceScrollList, deviceNameList, deviceNameScrollList, dataSourceQuery, deviceNameQuery, userNotesTable,
        eventsTable, watchListGet, watchListSelect, arrayInput, emptyInput, watchListList, watchListChart, pointHierarchySelect,
        filteringDeviceNameList, filteringDataSourceList, filteringPointHierarchySelect, accordion, accordionSection, draggable,
        dropzone, barDisplay, indicator, validationMessages, scaleTo, change, switchDirective,
        queryBuilder, queryGroup, queryPredicate, pointHierarchyBrowser, pointHierarchyPointSelector, pointHierarchyFolder, watchListParameters,
        imageSlider, userEditor, userSelect, systemSettingEditor, permissionsMenu, configExport, configImport, configImportDialog,
        maMap, ngMap, slideUp, angular, require, moment) {
'use strict';
/**
 * @ngdoc overview
 * @name ngMango
 *
 *
 * @description
 * The ngMango module handles loading of the custom directives used for creating a Mango 3.0 dashboard.
 *
 *
**/
var ngMango = angular.module('ngMango', ['ngMangoServices', 'ngMangoFilters', 'ngMap']);

ngMango.directive('maFilteringPointList', filteringPointList);
ngMango.directive('maPointList', pointList);
ngMango.directive('maPointValue', pointValue);
ngMango.directive('maPointValues', pointValues);
ngMango.directive('maPointStatistics', pointStatistics);
ngMango.directive('maTankLevel', tankLevel);
ngMango.directive('maGaugeChart', gaugeChart);
ngMango.directive('maSerialChart', serialChart);
ngMango.directive('maPieChart', pieChart);
ngMango.directive('maClock', clock);
ngMango.directive('maStateChart', stateChart);
ngMango.directive('maCopyBlurred', copyBlurred);
ngMango.directive('maTr', tr);
ngMango.directive('maTrAriaLabel', trAriaLabel);
ngMango.directive('maDatePicker', datePicker);
ngMango.directive('maDateRangePicker', dateRangePicker);
ngMango.directive('maStatisticsTable', statisticsTable);
ngMango.directive('maStartsAndRuntimesTable', startsAndRuntimesTable);
ngMango.directive('maSetPointValue', setPointValue);
ngMango.directive('maSwitchImg', switchImg);
ngMango.directive('maCalc', calc);
ngMango.directive('maIntervalPicker', intervalPicker);
ngMango.directive('maIntervalTypePicker', intervalTypePicker);
ngMango.directive('maPointQuery', pointQuery);
ngMango.directive('maGetPointValue', getPointValue);
ngMango.directive('maJsonStore', jsonStore);
ngMango.directive('maFocusOn', focusOn);
ngMango.directive('maEnter', enter);
ngMango.directive('maNow', now);
ngMango.directive('maFn', fn);
ngMango.directive('maPointHierarchy', pointHierarchy);
ngMango.directive('maPagingPointList', pagingPointList);
ngMango.directive('maDataSourceList', dataSourceList);
ngMango.directive('maDataSourceScrollList', dataSourceScrollList);
ngMango.directive('maDeviceNameList', deviceNameList);
ngMango.directive('maDeviceNameScrollList', deviceNameScrollList);
ngMango.directive('maDataSourceQuery', dataSourceQuery);
ngMango.directive('maDeviceNameQuery', deviceNameQuery);
ngMango.directive('maUserNotesTable', userNotesTable);
ngMango.directive('maEventsTable', eventsTable);
ngMango.directive('maArrayInput', arrayInput);
ngMango.directive('maEmptyInput', emptyInput);
ngMango.directive('maWatchListGet', watchListGet);
ngMango.directive('maWatchListSelect', watchListSelect);
ngMango.directive('maWatchListList', watchListList);
ngMango.directive('maWatchListChart', watchListChart);
ngMango.directive('maPointHierarchySelect', pointHierarchySelect);
ngMango.directive('maFilteringDeviceNameList', filteringDeviceNameList);
ngMango.directive('maFilteringDataSourceList', filteringDataSourceList);
ngMango.directive('maFilteringPointHierarchySelect', filteringPointHierarchySelect);
ngMango.directive('maAccordion', accordion);
ngMango.directive('maAccordionSection', accordionSection);
ngMango.directive('maDraggable', draggable);
ngMango.directive('maDropzone', dropzone);
ngMango.directive('maBarDisplay', barDisplay);
ngMango.directive('maIndicator', indicator);
ngMango.directive('maValidationMessages', validationMessages);
ngMango.directive('maScaleTo', scaleTo);
ngMango.directive('maChange', change);
ngMango.directive('maSwitch', switchDirective);
ngMango.component('maQueryBuilder', queryBuilder);
ngMango.component('maQueryGroup', queryGroup);
ngMango.component('maQueryPredicate', queryPredicate);
ngMango.component('maPointHierarchyBrowser', pointHierarchyBrowser);
ngMango.component('maPointHierarchyPointSelector', pointHierarchyPointSelector);
ngMango.component('maPointHierarchyFolder', pointHierarchyFolder);
ngMango.component('maWatchListParameters', watchListParameters);
ngMango.component('maImageSlider', imageSlider);
ngMango.component('maUserEditor', userEditor);
ngMango.component('maUserSelect', userSelect);
ngMango.component('maSystemSettingEditor', systemSettingEditor);
ngMango.component('maPermissionsMenu', permissionsMenu);
ngMango.component('maConfigExport', configExport);
ngMango.component('maConfigImport', configImport);
ngMango.component('maConfigImportDialog', configImportDialog);
ngMango.component('maMap', maMap);
ngMango.animation('.ma-slide-up', slideUp);

ngMango.constant('ngMangoInsertCss', true);

ngMango.constant('MA_DATE_RANGE_PRESETS', [
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
]);

ngMango.constant('MA_ROLLUP_TYPES', [
 {type: 'POINT_DEFAULT', nonNumeric: true, label: 'Point default', translation: 'common.rollup.pointDefault'},
 {type: 'NONE', nonNumeric: true, label: 'None', translation: 'common.rollup.none'},
 {type: 'AVERAGE', nonNumeric: false, label: 'Average', translation: 'common.rollup.average'},
 {type: 'DELTA', nonNumeric: false, label: 'Delta', translation: 'common.rollup.delta'},
 {type: 'MINIMUM', nonNumeric: false, label: 'Minimum', translation: 'common.rollup.minimum'},
 {type: 'MAXIMUM', nonNumeric: false, label: 'Maximum', translation: 'common.rollup.maximum'},
 {type: 'ACCUMULATOR', nonNumeric: false, label: 'Accumulator', translation: 'common.rollup.accumulator'},
 {type: 'SUM', nonNumeric: false, label: 'Sum', translation: 'common.rollup.sum'},
 {type: 'FIRST', nonNumeric: true, label: 'First', translation: 'common.rollup.first'},
 {type: 'LAST', nonNumeric: true, label: 'Last', translation: 'common.rollup.last'},
 {type: 'COUNT', nonNumeric: true, label: 'Count', translation: 'common.rollup.count'},
 {type: 'INTEGRAL', nonNumeric: false, label: 'Integral', translation: 'common.rollup.integral'}
 //{name: 'FFT', nonNumeric: false}
]);

ngMango.constant('MA_TIME_PERIOD_TYPES', [
 {type: 'SECONDS', label: 'Seconds'},
 {type: 'MINUTES', label: 'Minutes'},
 {type: 'HOURS', label: 'Hours'},
 {type: 'DAYS', label: 'Days'},
 {type: 'WEEKS', label: 'Weeks'},
 {type: 'MONTHS', label: 'Months'},
 {type: 'YEARS', label: 'Years'}
]);

ngMango.constant('MA_CHART_TYPES', [
 {type: 'line', label: 'Line'},
 {type: 'smoothedLine', label: 'Smoothed'},
 {type: 'step', label: 'Step'},
 {type: 'column', label: 'Bar'}
]);

ngMango.constant('MA_RELATIVE_DATE_TYPES', [
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
]);

ngMango.factory('MA_AMCHARTS_DATE_FORMATS', ['mangoDateFormats', function(mangoDateFormats) {
    return {
        categoryAxis: [
            {period: 'fff', format: mangoDateFormats.timeSeconds},
            {period: 'ss', format: mangoDateFormats.timeSeconds},
            {period: 'mm', format: mangoDateFormats.time},
            {period: 'hh', format: mangoDateFormats.time},
            {period: 'DD', format: mangoDateFormats.monthDay},
            {period: 'WW', format: mangoDateFormats.monthDay},
            {period: 'MM', format: mangoDateFormats.monthDay},
            {period: 'YYYY', format: mangoDateFormats.year}
        ],
        categoryBalloon: mangoDateFormats.shortDateTimeSeconds
    };
}]);

ngMango.constant('MA_DEFAULT_TIMEZONE', '');
ngMango.constant('MA_DEFAULT_LOCALE', '');

ngMango.run([
    '$rootScope',
    'mangoWatchdog',
    'ngMangoInsertCss',
    'cssInjector',
    'MA_ROLLUP_TYPES',
    'MA_TIME_PERIOD_TYPES',
    'MA_CHART_TYPES',
    'MA_RELATIVE_DATE_TYPES',
    'MA_DATE_RANGE_PRESETS',
    'MA_DEFAULT_TIMEZONE',
    'MA_DEFAULT_LOCALE',
    'User',
function($rootScope, mangoWatchdog, ngMangoInsertCss, cssInjector, MA_ROLLUP_TYPES, MA_TIME_PERIOD_TYPES,
        MA_CHART_TYPES, MA_RELATIVE_DATE_TYPES, MA_DATE_RANGE_PRESETS, MA_DEFAULT_TIMEZONE, MA_DEFAULT_LOCALE, User) {
	$rootScope.Math = Math;
    $rootScope.mangoWatchdog = mangoWatchdog;
    
    User.loginInterceptors.push(function(data) {
        mangoWatchdog.setStatus({
            status: 'LOGGED_IN',
            user: data.resource
        });
    });
    
    User.logoutInterceptors.push(function(data) {
        mangoWatchdog.setStatus({
            status: 'API_UP',
            wasLogout: true
        });
    });

	if (ngMangoInsertCss) {
	    cssInjector.injectLink(require.toUrl('./ngMango.css'));
	}

	$rootScope.range = function(start, end) {
		var result = [];
		for (var i = start; i <= end; i++)
			result.push(i);
		return result;
	};

    $rootScope.rollupTypes = MA_ROLLUP_TYPES;
    $rootScope.timePeriodTypes = MA_TIME_PERIOD_TYPES;
    $rootScope.chartTypes = MA_CHART_TYPES;
    $rootScope.relativeDateTypes = MA_RELATIVE_DATE_TYPES;
    $rootScope.dateRangePresets = MA_DATE_RANGE_PRESETS;

    moment.tz.setDefault(MA_DEFAULT_TIMEZONE || moment.tz.guess());
    moment.locale(MA_DEFAULT_LOCALE || window.navigator.languages || window.navigator.language);

    require(['amcharts/amcharts'], function(AmCharts) {
        AmCharts._formatDate = AmCharts.formatDate;
        AmCharts.formatDate = function(date, format, chart) {
            return moment(date).format(format);
        };
    
        AmCharts._resetDateToMin = AmCharts.resetDateToMin;
        AmCharts.resetDateToMin = function(date, period, count, firstDateOfWeek) {
            var m = moment(date);
            switch(period) {
            case 'YYYY':
                m.year(roundDownToNearestX(m.year(), count));
                m.startOf('year');
                break;
            case 'MM':
                m.month(roundDownToNearestX(m.month(), count));
                m.startOf('month');
                break;
            case 'WW':
                m.week(roundDownToNearestX(m.week(), count));
                m.startOf('week');
                break;
            case 'DD':
                //m.date(roundDownToNearestX(m.date(), count));
                m.startOf('day');
                break;
            case 'hh':
                m.hour(roundDownToNearestX(m.hour(), count));
                m.startOf('hour');
                break;
            case 'mm':
                m.minute(roundDownToNearestX(m.minute(), count));
                m.startOf('minute');
                break;
            case 'ss':
                m.second(roundDownToNearestX(m.second(), count));
                m.startOf('second');
                break;
            case 'fff':
                m.millisecond(roundDownToNearestX(m.millisecond(), count));
                break;
            }
            return m.toDate();
    
            function roundDownToNearestX(a,x) {
                return a - a % x;
            }
        };
    });
}]);

return ngMango;

}); // require
