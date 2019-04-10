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
import stateParams from './directives/stateParams';
import fixSortIcons from './directives/fixSortIcons';
import momentary from './directives/momentary';
import loadModules from './directives/loadModules';
import autofocusDirective from './directives/autofocus';
import formExclude from './directives/formExclude';
import getCtrl from './directives/getCtrl';
import dialog from './directives/dialog';
import flattenValues from './directives/flattenValues';
import lessThan from './directives/lessThan';
import greaterThan from './directives/greaterThan';
import formatValue from './directives/formatValue';
import formatArray from './directives/formatArray';
import parseValue from './directives/parseValue';
import parseArray from './directives/parseArray';
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
import eventHandlerCheckList from './components/eventHandlerCheckList/eventHandlerCheckList';
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
import dataSourceStatus from './components/dataSourceStatus/dataSourceStatus';
import dataPointEditor from './components/dataPointEditor/dataPointEditor';
import virtualSerialPortList from './components/virtualSerialPort/virtualSerialPortList';
import virtualSerialPortSelect from './components/virtualSerialPort/virtualSerialPortSelect';
import virtualSerialPortSetup from './components/virtualSerialPort/virtualSerialPortSetup';
import colorPicker from './components/colorPicker/colorPicker';
import dataPointTagsEditor from './components/dataPointTagsEditor/dataPointTagsEditor';
import scriptingEditor from './components/scriptingEditor/scriptingEditor';
import bulkDataPointEditor from './components/bulkDataPointEditor/bulkDataPointEditor';
import eventHandlerProcessEditor from './components/eventHandlerEditor/eventHandlerProcessEditor';
import eventHandlerSetPointEditor from './components/eventHandlerEditor/eventHandlerSetPointEditor';
import scriptContext from './components/scriptContext/scriptContext';
import unitList from './components/unitList/unitList';
import eventDetectorList from './components/eventDetectorList/eventDetectorList';
import eventDetectorEditor from './components/eventDetectorEditor/eventDetectorEditor';
import eventDetectorSelect from './components/eventDetectorSelect/eventDetectorSelect';
import eventDetectorLayout from './components/eventDetectorLayout/eventDetectorLayout';
import durationEditor from './components/durationEditor/durationEditor';
import treeView from './components/treeView/treeView';
import treeViewTransclude from './components/treeView/treeViewTransclude';
import purgePointValues from './components/purgePointValues/purgePointValues';
import serialPortSelect from './components/serialPortsSelect/serialPortSelect';
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
ngMango.directive('maStateParams', stateParams);
ngMango.directive('maFixSortIcons', fixSortIcons);
ngMango.directive('maMomentary', momentary);
ngMango.directive('maLoadModules', loadModules);
ngMango.directive('maAutofocus', autofocusDirective);
ngMango.directive('maFormExclude', formExclude);
ngMango.directive('maGetCtrl', getCtrl);
ngMango.directive('maDialog', dialog);
ngMango.directive('maFlattenValues', flattenValues);
ngMango.directive('maLessThan', lessThan);
ngMango.directive('maGreaterThan', greaterThan);
ngMango.directive('maFormatValue', formatValue);
ngMango.directive('maFormatArray', formatArray);
ngMango.directive('maParseValue', parseValue);
ngMango.directive('maParseArray', parseArray);
ngMango.directive('maTreeViewTransclude', treeViewTransclude);
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
ngMango.component('maEventHandlerCheckList', eventHandlerCheckList);
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
ngMango.component('maDataSourceStatus', dataSourceStatus);
ngMango.component('maDataPointEditor', dataPointEditor);
ngMango.component('maVirtualSerialPortList', virtualSerialPortList);
ngMango.component('maVirtualSerialPortSelect', virtualSerialPortSelect);
ngMango.component('maVirtualSerialPortSetup', virtualSerialPortSetup);
ngMango.component('maColorPicker', colorPicker);
ngMango.component('maDataPointTagsEditor', dataPointTagsEditor);
ngMango.component('maScriptingEditor', scriptingEditor);
ngMango.component('maBulkDataPointEditor', bulkDataPointEditor);
ngMango.component('maEventHandlerProcessEditor', eventHandlerProcessEditor);
ngMango.component('maEventHandlerSetPointEditor', eventHandlerSetPointEditor);
ngMango.component('maScriptContext', scriptContext);
ngMango.component('maUnitList', unitList);
ngMango.component('maEventDetectorList', eventDetectorList);
ngMango.component('maEventDetectorEditor', eventDetectorEditor);
ngMango.component('maEventDetectorSelect', eventDetectorSelect);
ngMango.component('maEventDetectorLayout', eventDetectorLayout);
ngMango.component('maDurationEditor', durationEditor);
ngMango.component('maTreeView', treeView);
ngMango.component('maPurgePointValues', purgePointValues);
ngMango.component('maSerialPortSelect', serialPortSelect);

ngMango.animation('.ma-slide-up', slideUp);

// add some additional event handlers which aren't in Angular by default
'touchstart touchend touchmove touchcancel'.split(' ').forEach((eventName) => {
    const directiveName = 'ma' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
    const fn = eventHandler.bind(null, eventName, directiveName);
    fn.$inject = eventHandler.$inject;
    ngMango.directive(directiveName, fn);
});

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
    'MA_DATE_RANGE_PRESETS',
    'maUser',
    '$timeout',
function($rootScope, mangoWatchdog, MA_ROLLUP_TYPES, MA_TIME_PERIOD_TYPES,
        MA_CHART_TYPES, MA_DATE_RANGE_PRESETS, User, $timeout) {

	$rootScope.Math = Math;
    $rootScope.mangoWatchdog = mangoWatchdog;
    
    User.loginInterceptors.push(function(data) {
        // add a $timeout call so LOGGED_IN status is only broadcast after maLoginRedirector gets a chance to reload the page
        // Otherwise maEventManager instances will open WS connections which are immediately terminated
        $timeout(() => {
            mangoWatchdog.setStatus({
                status: 'LOGGED_IN',
                user: data.resource
            });
        }, 0, false);
    });
    
    User.logoutInterceptors.push(function(data) {
        mangoWatchdog.setStatus({
            status: 'API_UP',
            wasLogout: true
        });
    });

    $rootScope.rollupTypes = MA_ROLLUP_TYPES;
    $rootScope.timePeriodTypes = MA_TIME_PERIOD_TYPES;
    $rootScope.chartTypes = MA_CHART_TYPES;
    $rootScope.dateRangePresets = MA_DATE_RANGE_PRESETS;

}]);

export default ngMango;
