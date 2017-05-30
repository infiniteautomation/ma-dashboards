/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular',
        './ngMango',
        './components/colorPreview/colorPreview',
        './services/dialogHelper',
        'angular-material',
        'mdPickers',
        'angular-material-data-table'], function(angular, ngMango, colorPreview, dialogHelperFactory) {
'use strict';

var ngMangoMaterial = angular.module('ngMangoMaterial', ['ngMango', 'ngMaterial', 'mdPickers', 'md.data.table']);
ngMangoMaterial.component('maColorPreview', colorPreview);
ngMangoMaterial.factory('maDialogHelper', dialogHelperFactory);
return ngMangoMaterial;

}); // define
