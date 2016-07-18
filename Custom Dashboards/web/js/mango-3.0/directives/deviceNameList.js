/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

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
