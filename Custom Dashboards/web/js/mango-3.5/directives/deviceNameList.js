/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maDeviceNameList
 * @restrict E
 * @description
 * `<ma-device-name-list ng-model="myDeviceName" data-source-xid="myDataSource.xid"></ma-device-name-list>`
 * - Displays a list of Mango device names in a drop down selector. The selected device name will be outputed to the variable specified by the `ng-model` attribute.
 * - In the example below a list a points is generated that have the specified device name.
 * - <a ui-sref="dashboard.examples.basics.dataSourceAndDeviceList">View Demo</a>
 *
 * @param {object} ng-model Variable to hold the selected device name.
 * @param {boolean=} auto-init Enables auto selecting of the first device name in the list. (Defaults to `true`)
 * @param {string=} data-source-xid If provided will filter device names to a specific data source by xid.
 * @param {string=} data-source-id If provided will filter device names to a specific data source by id.
 * @param {string=} contains If provided will filter device names to those containing the specified string. Capitalization sensitive. (eg: `'Meta'`)
 *
 * @usage
 * <md-input-container>
        <label>Device names for selected data source</label>
        <ma-device-name-list ng-model="myDeviceName" data-source-xid="myDataSource.xid"></ma-device-name-list>
    </md-input-container>

    <md-input-container>
        <label>Points for selected device name</label>
        <ma-point-list query="{deviceName: myDeviceName}" limit="100" ng-model="myPoint"></ma-point-list>
    </md-input-container>
 *
 */
function deviceNameList(DeviceName, $injector) {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            // attributes that start with data- have the prefix stripped
            dataSourceId: '=?sourceId',
            dataSourceXid: '=?sourceXid',
            contains: '=?',
            autoInit: '=?'
        },
        template: function(element, attrs) {
          var optionsExpr = 'deviceName in deviceNames track by $index';

          if ($injector.has('$mdUtil')) {
              return '<md-select md-on-open="onOpen()"><md-option ng-value="deviceName" ng-repeat="' + optionsExpr + '" ng-bind="deviceName"></md-option></md-select>';
          }

          return '<select ng-options="' + optionsExpr + '"></select>';
        },
        replace: true,
        link: function ($scope, $element, attrs) {
            if (angular.isUndefined($scope.autoInit)) {
                $scope.autoInit = true;
            }

            var promise;
            $scope.onOpen = function onOpen() {
                return promise;
            }

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

                $scope.deviceNames = [];
                $scope.ngModel = null;
                promise = queryResult.$promise.then(function(deviceNames) {
                    $scope.deviceNames = deviceNames;
                    if ($scope.autoInit && deviceNames.length) {
                        $scope.ngModel = deviceNames[0];
                    }
                });
            });
        }
    };
}

deviceNameList.$inject = ['DeviceName', '$injector'];
return deviceNameList;

}); // define
