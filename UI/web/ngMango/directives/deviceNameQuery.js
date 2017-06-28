/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.directive:maDeviceNameQuery
 * @restrict E
 * @description
 * `<ma-device-name-query device-names="deviceNames" contains="'meter'"></ma-device-name-query>`
 * - Outputs an array of Mango device names.
 * - In the example below the list is filtered to those containing a specified string and the resulting array is printed to the screen.
 * - <a ui-sref="ui.examples.basics.dataSourceAndDeviceList">View Demo</a>
 *
 * @param {array} device-names Array Variable to hold the array of outputted device names.
 * @param {string=} data-source-xid If provided will filter device names to a specific data source by xid.
 * @param {string=} data-source-id If provided will filter device names to a specific data source by id.
 * @param {string=} contains If provided will filter device names to those containing the specified string. Capitalization sensitive. (eg: `'Meta'`)
 *
 * @usage
 * <h2>Device names containing 'meter'</h2>
    <ma-device-name-query device-names="deviceNames" contains="'meter'"></ma-device-name-query>
    <pre ng-bind="deviceNames | json"></pre>
 *
 */
function deviceNameQuery(DeviceName) {
    return {
        scope: {
            // attributes that start with data- have the prefix stripped
            dataSourceId: '=?sourceId',
            dataSourceXid: '=?sourceXid',
            contains: '=?',
            deviceNames: '=?'
        },
        link: function ($scope, $element, attrs) {
            $scope.$watchGroup(['dataSourceId', 'dataSourceXid', 'contains'], function(value) {
                var queryResult;
                if (!($element.attr('data-source-id') || $element.attr('data-source-xid') )) {
                    queryResult = DeviceName.query({contains: $scope.contains});
                } else if (!angular.isUndefined($scope.dataSourceId)) {
                    queryResult = DeviceName.byDataSourceId({id: $scope.dataSourceId, contains: $scope.contains});
                } else if (!angular.isUndefined($scope.dataSourceXid)) {
                    queryResult = DeviceName.byDataSourceXid({xid: $scope.dataSourceXid, contains: $scope.contains});
                } else {
                    return;
                }

                $scope.deviceNames = queryResult;
            });
        }
    };
}

deviceNameQuery.$inject = ['maDeviceName'];
return deviceNameQuery;

}); // define
