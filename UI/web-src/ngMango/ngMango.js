/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import './ngMangoServices';
import './ngMangoFilters';
import pointList from './directives/pointList';
import filteringPointList from './directives/filteringPointList';
import pointValue from './directives/pointValue';
import pointValues from './directives/pointValues';
import pointStatistics from './directives/pointStatistics';
import tankLevel from './directives/tankLevel';
import gaugeChart from './directives/gaugeChart';
import serialChart from './directives/serialChart';
import pieChart from './directives/pieChart';
import clock from './directives/clock';
import stateChart from './directives/stateChart';
import copyBlurred from './directives/copyBlurred';
import tr from './directives/tr';
import trAriaLabel from './directives/trAriaLabel';
import datePicker from './directives/datePicker';
import dateRangePicker from './directives/dateRangePicker';
import statisticsTable from './directives/statisticsTable';
import startsAndRuntimesTable from './directives/startsAndRuntimesTable';
import setPointValue from './directives/setPointValue';
import switchImg from './directives/switchImg';
import calc from './directives/calc';
import intervalPicker from './directives/intervalPicker';
import intervalTypePicker from './directives/intervalTypePicker';
import pointQuery from './directives/pointQuery';
import getPointValue from './directives/getPointValue';
import jsonStore from './directives/jsonStore';
import focusOn from './directives/focusOn';
import enter from './directives/enter';
import now from './directives/now';
import fn from './directives/fn';
import pointHierarchy from './directives/pointHierarchy';
import pagingPointList from './directives/pagingPointList';
import dataSourceList from './directives/dataSourceList';
import dataSourceScrollList from './directives/dataSourceScrollList';
import deviceNameList from './directives/deviceNameList';
import deviceNameScrollList from './directives/deviceNameScrollList';
import dataSourceQuery from './directives/dataSourceQuery';
import deviceNameQuery from './directives/deviceNameQuery';
import userNotesTable from './directives/userNotesTable';
import eventsTable from './directives/eventsTable';
import watchListGet from './directives/watchListGet';
import watchListSelect from './directives/watchListSelect';
import arrayInput from './directives/arrayInput';
import emptyInput from './directives/emptyInput';
import watchListList from './directives/watchListList';
import watchListChart from './directives/watchListChart';
import pointHierarchySelect from './directives/pointHierarchySelect';
import filteringDeviceNameList from './directives/filteringDeviceNameList';
import filteringDataSourceList from './directives/filteringDataSourceList';
import filteringPointHierarchySelect from './directives/filteringPointHierarchySelect';
import accordion from './directives/accordion';
import accordionSection from './directives/accordionSection';
import draggable from './directives/draggable';
import dropzone from './directives/dropzone';
import barDisplay from './directives/barDisplay';
import indicator from './directives/indicator';
import validationMessages from './directives/validationMessages';
import scaleTo from './directives/scaleTo';
import change from './directives/change';
import switchDirective from './directives/switch';
import svgDirective from './directives/svg';
import chooseFile from './directives/chooseFile';
import aceEditor from './directives/aceEditor';
import dateInput from './directives/dateInput';
import eventHandler from './directives/eventHandler';
import jsonModel from './directives/jsonModel';
import jwtInput from './directives/jwtInput';
import plotly from './directives/plotly';
import stateParams from './directives/stateParams';
import fixSortIcons from './directives/fixSortIcons';
import momentary from './directives/momentary';
import loadModules from './directives/loadModules';
import autofocusDirective from './directives/autofocus';
import formExclude from './directives/formExclude';
import getCtrl from './directives/getCtrl';
import dialog from './directives/dialog';
import queryBuilder from './components/queryBuilder/queryBuilder';
import queryGroup from './components/queryBuilder/queryGroup';
import queryPredicate from './components/queryBuilder/queryPredicate';
import pointHierarchyBrowser from './components/pointHierarchyBrowser/pointHierarchyBrowser';
import pointHierarchyPointSelector from './components/pointHierarchyBrowser/pointHierarchyPointSelector';
import pointHierarchyFolder from './components/pointHierarchyBrowser/pointHierarchyFolder';
import watchListParameters from './components/watchListParameters/watchListParameters';
import imageSlider from './components/imageSlider/imageSlider';
import userEditor from './components/userEditor/userEditor';
import userSelect from './components/userSelect/userSelect';
import userList from './components/userList/userList';
import systemSettingEditor from './components/systemSettingEditor/systemSettingEditor';
import permissionsMenu from './components/permissionsMenu/permissionsMenu';
import configExport from './components/configExport/configExport';
import configImport from './components/configImport/configImport';
import configImportDialog from './components/configImportDialog/configImportDialog';
import maMap from './components/maMap/maMap';
import button from './components/button/button';
import fileStoreBrowser from './components/fileStoreBrowser/fileStoreBrowser';
import maSlider from './components/maSlider/maSlider';
import jsonStoreTable from './components/jsonStoreTable/jsonStoreTable';
import jsonStoreEditor from './components/jsonStoreEditor/jsonStoreEditor';
import eventHandlerEditor from './components/eventHandlerEditor/eventHandlerEditor';
import eventHandlerEmailEditor from './components/eventHandlerEditor/eventHandlerEmailEditor';
import eventHandlerList from './components/eventHandlerList/eventHandlerList';
import eventHandlerSelect from './components/eventHandlerSelect/eventHandlerSelect';
import eventAudio from './components/eventAudio/eventAudio';
import dataPointTagSelect from './components/dataPointTagSelect/dataPointTagSelect';
import dataPointTagKeySelect from './components/dataPointTagKeySelect/dataPointTagKeySelect';
import getService from './components/getService/getService';
import pointEventDetector from './components/pointEventDetector/pointEventDetector';
import userAuthTokens from './components/userAuthTokens/userAuthTokens';
import bulkDataPointTasks from './components/bulkDataPointTasks/bulkDataPointTasks';
import pointBrowser from './components/pointBrowser/pointBrowser';
import dataPointTagGroup from './components/dataPointTagGroup/dataPointTagGroup';
import revisionSelect from './components/revisionSelect/revisionSelect';
import cronPattern from './components/cronPattern/cronPattern';
import dailySchedule from './components/dailySchedule/dailySchedule';
import weeklySchedule from './components/weeklySchedule/weeklySchedule';
import emailRecipients from './components/emailRecipients/emailRecipients';
import mailingListList from './components/mailingLists/mailingListList';
import mailingListSelect from './components/mailingLists/mailingListSelect';
import mailingListSetup from './components/mailingLists/mailingListSetup';
import eventTypeList from './components/eventTypeList/eventTypeList';
import dataSourceEditor from './components/dataSourceEditor/dataSourceEditor';
import 'ngmap';
import slideUp from './animations/slideUp';
import angular from 'angular';

import '../shims/exportAMD.js';
import './ngMango.css';

/**
 * @ngdoc overview
 * @name ngMango
 *
 *
 * @description
 * The ngMango module handles loading of the custom directives used for creating a Mango 3.x dashboard.
 *
 *
**/
const ngMango = angular.module('ngMango', ['ngMangoServices', 'ngMangoFilters', 'ngMap']);

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
ngMango.directive('maSvg', svgDirective);
ngMango.directive('maChooseFile', chooseFile);
ngMango.directive('maAceEditor', aceEditor);
ngMango.directive('maDateInput', dateInput);
ngMango.directive('maJsonModel', jsonModel);
ngMango.directive('maJwtInput', jwtInput);
ngMango.directive('maPlotly', plotly);
ngMango.directive('maStateParams', stateParams);
ngMango.directive('maFixSortIcons', fixSortIcons);
ngMango.directive('maMomentary', momentary);
ngMango.directive('maLoadModules', loadModules);
ngMango.directive('maAutofocus', autofocusDirective);
ngMango.directive('maFormExclude', formExclude);
ngMango.directive('maGetCtrl', getCtrl);
ngMango.directive('maDialog', dialog);
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
ngMango.component('maUserList', userList);
ngMango.component('maSystemSettingEditor', systemSettingEditor);
ngMango.component('maPermissionsMenu', permissionsMenu);
ngMango.component('maConfigExport', configExport);
ngMango.component('maConfigImport', configImport);
ngMango.component('maConfigImportDialog', configImportDialog);
ngMango.component('maMap', maMap);
ngMango.component('maButton', button);
ngMango.component('maFileStoreBrowser', fileStoreBrowser);
ngMango.component('maSlider', maSlider);
ngMango.component('maJsonStoreTable', jsonStoreTable);
ngMango.component('maEventHandlerEditor', eventHandlerEditor);
ngMango.component('maEventHandlerEmailEditor', eventHandlerEmailEditor);
ngMango.component('maEventHandlerList', eventHandlerList);
ngMango.component('maEventHandlerSelect', eventHandlerSelect);
ngMango.component('maJsonStoreEditor', jsonStoreEditor);
ngMango.component('maEventAudio', eventAudio);
ngMango.component('maDataPointTagSelect', dataPointTagSelect);
ngMango.component('maDataPointTagKeySelect', dataPointTagKeySelect);
ngMango.component('maGetService', getService);
ngMango.component('maPointEventDetector', pointEventDetector);
ngMango.component('maUserAuthTokens', userAuthTokens);
ngMango.component('maBulkDataPointTasks', bulkDataPointTasks);
ngMango.component('maPointBrowser', pointBrowser);
ngMango.component('maDataPointTagGroup', dataPointTagGroup);
ngMango.component('maRevisionSelect', revisionSelect);
ngMango.component('maCronPattern', cronPattern);
ngMango.component('maDailySchedule', dailySchedule);
ngMango.component('maWeeklySchedule', weeklySchedule);
ngMango.component('maEmailRecipients', emailRecipients);
ngMango.component('maMailingListList', mailingListList);
ngMango.component('maMailingListSelect', mailingListSelect);
ngMango.component('maMailingListSetup', mailingListSetup);
ngMango.component('maEventTypeList', eventTypeList);
ngMango.component('maDataSourceEditor', dataSourceEditor);
ngMango.animation('.ma-slide-up', slideUp);

// add some additional event handlers which aren't in Angular by default
'touchstart touchend touchmove touchcancel'.split(' ').forEach((eventName) => {
    const directiveName = 'ma' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
    const fn = eventHandler.bind(null, eventName, directiveName);
    fn.$inject = eventHandler.$inject;
    ngMango.directive(directiveName, fn);
});

ngMango.constant('MA_INSERT_CSS', true);

ngMango.constant('MA_DATE_RANGE_PRESETS', [
   {type: 'LAST_5_MINUTES', label: 'Last 5 minutes'},
   {type: 'LAST_15_MINUTES', label: 'Last 15 minutes'},
   {type: 'LAST_30_MINUTES', label: 'Last 30 minutes'},
   {type: 'LAST_1_HOURS', label: 'Last 1 hours'},
   {type: 'LAST_3_HOURS', label: 'Last 3 hours'},
   {type: 'LAST_6_HOURS', label: 'Last 6 hours'},
   {type: 'LAST_12_HOURS', label: 'Last 12 hours'},
   {type: 'LAST_1_DAYS', label: 'Last 1 days'},
   {type: 'LAST_1_WEEKS', label: 'Last 1 weeks'},
   {type: 'LAST_2_WEEKS', label: 'Last 2 weeks'},
   {type: 'LAST_1_MONTHS', label: 'Last 1 months'},
   {type: 'LAST_3_MONTHS', label: 'Last 3 months'},
   {type: 'LAST_6_MONTHS', label: 'Last 6 months'},
   {type: 'LAST_1_YEARS', label: 'Last 1 years'},
   {type: 'LAST_2_YEARS', label: 'Last 2 years'},
   {type: 'DAY_SO_FAR', label: 'Today so far'},
   {type: 'WEEK_SO_FAR', label: 'This week so far'},
   {type: 'MONTH_SO_FAR', label: 'This month so far'},
   {type: 'YEAR_SO_FAR', label: 'This year so far'},
   {type: 'PREVIOUS_DAY', label: 'Yesterday'},
   {type: 'PREVIOUS_WEEK', label: 'Previous week'},
   {type: 'PREVIOUS_MONTH', label: 'Previous month'},
   {type: 'PREVIOUS_YEAR', label: 'Previous year'}
]);

ngMango.constant('MA_ROLLUP_TYPES', [
 {type: 'POINT_DEFAULT', nonNumeric: true, label: 'Point default', translation: 'common.rollup.pointDefault'},
 {type: 'NONE', nonNumeric: true, label: 'None', translation: 'common.rollup.none'},
 {type: 'SIMPLIFY', nonNumeric: false, label: 'Simplify', translation: 'ui.app.simplify'},
 {type: 'AVERAGE', nonNumeric: false, label: 'Average', translation: 'common.rollup.average'},
 {type: 'DELTA', nonNumeric: false, label: 'Delta', translation: 'common.rollup.delta'},
 {type: 'MINIMUM', nonNumeric: false, label: 'Minimum', translation: 'common.rollup.minimum'},
 {type: 'MAXIMUM', nonNumeric: false, label: 'Maximum', translation: 'common.rollup.maximum'},
 {type: 'ACCUMULATOR', nonNumeric: false, label: 'Accumulator', translation: 'common.rollup.accumulator'},
 {type: 'SUM', nonNumeric: false, label: 'Sum', translation: 'common.rollup.sum'},
 {type: 'START', nonNumeric: true, label: 'Start', translation: 'common.rollup.start'},
 {type: 'FIRST', nonNumeric: true, label: 'First', translation: 'common.rollup.first'},
 {type: 'LAST', nonNumeric: true, label: 'Last', translation: 'common.rollup.last'},
 {type: 'COUNT', nonNumeric: true, label: 'Count', translation: 'common.rollup.count'},
 {type: 'INTEGRAL', nonNumeric: false, label: 'Integral', translation: 'common.rollup.integral'}
 //{name: 'FFT', nonNumeric: false}
]);

ngMango.constant('MA_DATE_TIME_FORMATS', [
    {
        translation: 'ui.app.timeFormat.iso',
        format: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX'
    },
    {
        translation: 'ui.app.timeFormat.excelCompatible',
        format: 'yyyy-MM-dd HH:mm:ss'
    },
    {
        translation: 'ui.app.timeFormat.excelCompatibleMs',
        format: 'yyyy-MM-dd HH:mm:ss.SSS'
    },
    {
        translation: 'ui.app.timeFormat.epoch',
        format: ''
    }
]);

ngMango.constant('MA_TIME_PERIOD_TYPES', [
 {type: 'MILLISECONDS', label: 'Milliseconds', translation: 'dateAndTime.milliseconds'},
 {type: 'SECONDS', label: 'Seconds', translation: 'dateAndTime.seconds'},
 {type: 'MINUTES', label: 'Minutes', translation: 'dateAndTime.minutes'},
 {type: 'HOURS', label: 'Hours', translation: 'dateAndTime.hours'},
 {type: 'DAYS', label: 'Days', translation: 'dateAndTime.days', showByDefault: true},
 {type: 'WEEKS', label: 'Weeks', translation: 'dateAndTime.weeks', showByDefault: true},
 {type: 'MONTHS', label: 'Months', translation: 'dateAndTime.months', showByDefault: true},
 {type: 'YEARS', label: 'Years', translation: 'dateAndTime.years', showByDefault: true}
]);

ngMango.constant('MA_CHART_TYPES', [
 {type: 'line', apiType: 'LINE', label: 'Line', translation: 'ui.app.line'},
 {type: 'smoothedLine', apiType: 'SPLINE', label: 'Smoothed', translation: 'ui.app.smooth'},
 {type: 'step', apiType: 'STEP', label: 'Step', translation: 'ui.app.step'},
 {type: 'column', apiType: 'BAR', label: 'Bar', translation: 'ui.app.bar'}
]);

{
    // jshint quotmark:false
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
        {type: "moment:'subtract':1:'days'|maMoment:'startOf':'day'", label: 'Start of previous day'},
        {type: "moment:'subtract':1:'days'", label: '1 day ago'},
        {type: "moment:'startOf':'week'", label: 'Start of week'},
        {type: "moment:'subtract':1:'weeks'|maMoment:'startOf':'week'", label: 'Start of last week'},
        {type: "moment:'subtract':1:'weeks'", label: '1 week ago'},
        {type: "moment:'subtract':2:'weeks'", label: '2 weeks ago'},
        {type: "moment:'startOf':'month'", label: 'Start of month'},
        {type: "moment:'subtract':1:'months'|maMoment:'startOf':'month'", label: 'Start of last month'},
        {type: "moment:'subtract':1:'months'", label: '1 month ago'},
        {type: "moment:'subtract':3:'months'", label: '3 months ago'},
        {type: "moment:'subtract':6:'months'", label: '6 months ago'},
        {type: "moment:'startOf':'year'", label: 'Start of year'},
        {type: "moment:'subtract':1:'years'|maMoment:'startOf':'year'", label: 'Start of last year'},
        {type: "moment:'subtract':1:'years'", label: '1 year ago'}
    ]);
}

// defined in UI module
ngMango.constant('MA_EVENT_LINK_INFO', {});

ngMango.factory('MA_AMCHARTS_DATE_FORMATS', ['MA_DATE_FORMATS', function(mangoDateFormats) {
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

ngMango.run([
    '$rootScope',
    'maWatchdog',
    'MA_ROLLUP_TYPES',
    'MA_TIME_PERIOD_TYPES',
    'MA_CHART_TYPES',
    'MA_RELATIVE_DATE_TYPES',
    'MA_DATE_RANGE_PRESETS',
    'maUser',
function($rootScope, mangoWatchdog, MA_ROLLUP_TYPES, MA_TIME_PERIOD_TYPES,
        MA_CHART_TYPES, MA_RELATIVE_DATE_TYPES, MA_DATE_RANGE_PRESETS, User) {

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

	$rootScope.range = function(start, end) {
		const result = [];
		for (let i = start; i <= end; i++)
			result.push(i);
		return result;
	};

    $rootScope.rollupTypes = MA_ROLLUP_TYPES;
    $rootScope.timePeriodTypes = MA_TIME_PERIOD_TYPES;
    $rootScope.chartTypes = MA_CHART_TYPES;
    $rootScope.relativeDateTypes = MA_RELATIVE_DATE_TYPES;
    $rootScope.dateRangePresets = MA_DATE_RANGE_PRESETS;

}]);

export default ngMango;
