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
 * `<ma-clock time="" timezone="" text="">`
 * - This directive will display an analog style clock.
 * - Note, you will need to set a width and height on the element.
 * [View Demo](/modules/dashboards/web/mdAdmin/#/dashboard/examples/basics/clocks-and-timezones)
 *
 * @param {object} ngModel sort
 * @param {object=} autoInit sort
 * @param {object} query sort
 * @param {object} start sort
 * @param {object} limit sort
 * @param {object} sort sort
 *
 * @usage
 * <ma-clock style="width: 100%; height: 200px;" time="time1" text="Browser timezone"></ma-clock>
 * <ma-clock style="width: 100%; height: 200px;" time="time2" timezone="{{user.getTimezone()}}" text="User timezone"></ma-clock>
 * <ma-clock style="width: 100%; height: 200px;" time="time3" timezone="Australia/Sydney" text="Sydney"></ma-clock>
 * <span>{{time1|moment:'format':'ll LTS Z'}}</span>
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
