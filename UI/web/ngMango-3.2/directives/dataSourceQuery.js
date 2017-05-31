/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.directive:maDataSourceQuery
 * @restrict E
 * @description
 * `<ma-data-source-query data-sources="dataSourcesArray" query="{name: 'meter'}" limit="100"></ma-data-source-query>`
 * - Outputs an array of Mango data sources.
 * - <a ui-sref="ui.examples.basics.dataSourceAndDeviceList">View Demo</a>
 *
 * @param {array} data-sources Variable to hold the array of outputted data source objects.
 * @param {object=} query Filters the results by a property of the data source object (eg: `{name: 'meta'}` returns data sources containing the string `'meta'` in the `name` property)
 * @param {array=} sort Sorts the resulting list by a properties of the data source object. Passed as array of strings. (eg: `['-xid']` sorts descending by xid of data sources. Defaults to `['name']`)
 * @param {number=} start Sets the starting index for the resulting list. Must be used in conjunction with a `limit` value. (Defaults to `0`)
 * @param {number=} limit Limits the results in the list to a specified number of data sources (no limit by defualt)
 *
 *
 * @usage
 * <ma-data-source-query data-sources="dataSourcesArray" query="{name: 'meter'}" limit="100"></ma-data-source-query>
 *
 */
function dataSourceQuery(DataSource) {
    var DEFAULT_SORT = ['name'];

    return {
        scope: {
            query: '=',
            start: '=',
            limit: '=',
            sort: '=',
            dataSources: '=?sources'
        },
        link: function ($scope, $element, attrs) {
            $scope.$watch(function() {
                return {
                    query: $scope.query,
                    start: $scope.start,
                    limit: $scope.limit,
                    sort: $scope.sort
                };
            }, function(value) {
                value.sort = value.sort || DEFAULT_SORT;
                $scope.dataSources = DataSource.objQuery(value);
            }, true);
        }
    };
}

dataSourceQuery.$inject = ['maDataSource'];
return dataSourceQuery;

}); // define
