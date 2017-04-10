/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular',
        './maDashboards',
        'angular-material',
        'mdPickers',
        'angular-material-data-table'], function(angular, maDashboards) {
'use strict';

return angular.module('maMaterialDashboards', ['maDashboards', 'ngMaterial', 'mdPickers', 'md.data.table']);

}); // define
