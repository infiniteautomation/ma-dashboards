/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.maDataSourceList
 * @restrict E
 * @description
 * `<ma-data-source-list ng-model="myDataSource"></ma-data-source-list>`
 * - Displays a list of Mango data sources in a drop down selector. The selected data source will be outputed to the variable specified by the `ng-model` attribute.
 * - <a ui-sref="ui.examples.basics.dataSourceAndDeviceList">View Demo</a>
 *
 * @param {object} ng-model Declare a variable to hold the selected data source object.
 * @param {boolean=} auto-init Enables auto selecting of the first data source in the list (Defaults to `true`)
 * @param {object=} query Filters the results by a property of the data source object (eg: `{name: 'meta'}` returns data sources containing the string `'meta'` in the `name` property)
 * @param {array=} sort Sorts the resulting list by a property of the data source object. Passed as array of strings. (eg: `['-xid']` sorts descending by xid of data sources. Defaults to `['name']`)
 * @param {number=} start Sets the starting index for the resulting list. Must be used in conjunction with a `limit` value. (Defaults to `0`)
 * @param {number=} limit Limits the results in the list to a specified number of data sources. Limit takes place after query and sorting (no limit by defualt)
 *
 *
 * @usage
 <md-input-container>
      <label>Choose a data source</label>
      <ma-data-source-list ng-model="myDataSource" auto-init="false" query="{name: 'meta'}" sort="['-name']" start="3" limit="6" ></ma-data-source-list>
 </md-input-container>
 
 <p>You have chosen data source "{{myDataSource.name}}". It is {{myDataSource.enabled ? 'enabled' : 'disabled'}} and has an XID of {{myDataSource.xid}}.</p>
 
 */
function dataSourceList(DataSource, $injector) {
    var DEFAULT_SORT = ['name'];

    return {
        restrict: 'E',
        require: 'ngModel',
        designerInfo: {
            translation: 'ui.components.dataSourceList',
            icon: 'view_list',
            category: 'dropDowns'
        },
        scope: {
            ngModel: '=',
            autoInit: '<?',
            query: '<?',
            start: '<?',
            limit: '<?',
            sort: '<?',
            showClear: '<?'
        },
        template: function(element, attrs) {
          if ($injector.has('$mdUtil')) {
              return '<md-select md-on-open="onOpen()">' +
              '<md-option ng-if="showClear" ng-value="undefined" md-option-empty><md-icon>clear</md-icon> <em ma-tr="ui.app.clear"></em></md-option>' +
              '<md-option ng-value="dataSource" ng-repeat="dataSource in dataSources track by dataSource.xid">' +
              '<span ng-bind="dataSourceLabel(dataSource)"></span>' +
              '</md-option></md-select>';
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
            };

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

                    if (!$scope.ngModel && $scope.autoInit && $scope.dataSources.length) {
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

dataSourceList.$inject = ['maDataSource', '$injector'];
return dataSourceList;

}); // define
