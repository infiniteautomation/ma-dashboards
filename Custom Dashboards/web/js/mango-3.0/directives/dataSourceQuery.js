/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

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

dataSourceQuery.$inject = ['DataSource'];
return dataSourceQuery;

}); // define
