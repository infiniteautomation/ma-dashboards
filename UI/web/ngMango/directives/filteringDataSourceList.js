/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'rql/query'], function(angular, require, query) {
'use strict';

filteringDataSourceList.$inject = ['$injector', '$timeout', 'maDataSource'];
function filteringDataSourceList($injector, $timeout, DataSource) {
    var DEFAULT_SORT = ['name'];
    
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            ngChange: '&?',
            autoInit: '<?',
            query: '<?',
            start: '<?',
            limit: '<?',
            sort: '<?',
            labelText: '<'
        },
        templateUrl: require.toUrl('./filteringDataSourceList.html'),
        replace: false,
        link: function($scope, $element, $attrs) {
            $scope.onChange = function() {
                $timeout($scope.ngChange, 0);
            };
            
            $scope.queryDataSources = function() {
                var q = $scope.query ? angular.copy($scope.query) : new query.Query();
                if ($scope.searchText)
                    q.push(new query.Query({name: 'like', args: ['name', '*' + $scope.searchText + '*']}));
                
                return DataSource.objQuery({
                    query: q,
                    start: $scope.start,
                    limit: $scope.limit,
                    sort: $scope.sort || DEFAULT_SORT
                }).$promise.then(function(dataSources) {
                    if (!$scope.ngModel && $scope.autoInit && dataSources.length) {
                        $scope.ngModel = dataSources[0];
                    }
                    return dataSources;
                });
            };
            
            if ($scope.autoInit)
                $scope.queryDataSources();
        },
        designerInfo: {
            translation: 'ui.components.filteringDataSourceList',
            icon: 'filter_list'
        }
    };
}
return filteringDataSourceList;

}); // define
