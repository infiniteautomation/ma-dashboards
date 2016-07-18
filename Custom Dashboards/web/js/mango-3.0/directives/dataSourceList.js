/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function dataSourceList(DataSource, $injector) {
    var DEFAULT_SORT = ['name'];
    
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            autoInit: '=?',
            query: '=',
            start: '=',
            limit: '=',
            sort: '='
        },
        template: function(element, attrs) {
          if ($injector.has('$mdUtil')) {
              return '<md-select md-on-open="onOpen()">' +
              '<md-option ng-value="dataSource" ng-repeat="dataSource in dataSources track by dataSource.id">{{dataSourceLabel(dataSource)}}</md-option>' +
              '</md-select>';
          }
          return '<select ng-options="dataSourceLabel(dataSource) for dataSource in dataSources track by dataSource.id"></select>';
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

            $scope.$watch(function() {
                return {
                    query: $scope.query,
                    start: $scope.start,
                    limit: $scope.limit,
                    sort: $scope.sort
                };
            }, function(value) {
                $scope.dataSources = [];
                value.sort = value.sort || DEFAULT_SORT;
                promise = DataSource.objQuery(value).$promise;
                promise.then(function(dataSources) {
                    $scope.dataSources = dataSources;
                    
                    if ($scope.autoInit && !$scope.ngModel && $scope.dataSources.length) {
                        $scope.ngModel = $scope.dataSources[0];
                    }
                });
            }, true);
            
            $scope.dataSourceLabel = function(dataSource) {
                return dataSource.name;
            };
        }
    };
}

dataSourceList.$inject = ['DataSource', '$injector'];
return dataSourceList;

}); // define
