/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular',
        './maDashboards',
        './components/colorPreview/colorPreview',
        './services/dialogHelper',
        'angular-material',
        'mdPickers',
        'angular-material-data-table'], function(angular, maDashboards, colorPreview, dialogHelperFactory) {
'use strict';

var maMaterialDashboards = angular.module('maMaterialDashboards', ['maDashboards', 'ngMaterial', 'mdPickers', 'md.data.table']);
maMaterialDashboards.component('maColorPreview', colorPreview);
maMaterialDashboards.factory('maDialogHelper', dialogHelperFactory);
return maMaterialDashboards;

}); // define
