/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maDataSourceList
 * @restrict E
 * @description
 * `<ma-data-source-list ng-model="myDataSource"></ma-data-source-list>`
 * - Displays a list of Mango data sources. The selected data source will be outputed to the variable specified by the `ng-model` attribute.
 * [View Demo](/modules/dashboards/web/mdAdmin/#/dashboard/examples/basics/data-source-and-device-list)
 *
 * @param {object} ngModel Variable to hold the selected data source
 * @param {object=} autoInit sort
 * @param {object} query sort
 * @param {object} start sort
 * @param {object} limit sort
 * @param {object} sort sort
 *
 * @usage
 * <md-input-container class="md-block no-errors-spacer">
 *        <label>Choose a data source</label>
 *        <ma-data-source-list ng-model="myDataSource"></ma-data-source-list>
 * </md-input-container>
 *
 * <p>You have chosen data source "{{myDataSource.name}}". It is {{myDataSource.enabled ? 'enabled' : 'disabled'}} and has an XID of {{myDataSource.xid}}.</p>
 *
 */
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
              '<md-option ng-value="dataSource" ng-repeat="dataSource in dataSources track by dataSource.xid">{{dataSourceLabel(dataSource)}}</md-option>' +
              '</md-select>';
          }
          return '<select ng-options="dataSourceLabel(dataSource) for dataSource in dataSources track by dataSource.xid"></select>';
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
