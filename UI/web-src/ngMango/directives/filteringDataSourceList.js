/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import filteringDataSourceListTemplate from './filteringDataSourceList.html';
import query from 'rql/query';

filteringDataSourceList.$inject = ['$injector', 'maDataSource'];
function filteringDataSourceList($injector, DataSource) {
    const DEFAULT_SORT = ['name'];
    
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            autoInit: '<?',
            query: '<?',
            start: '<?',
            limit: '<?',
            sort: '<?',
            labelText: '<'
        },
        template: filteringDataSourceListTemplate,
        replace: false,
        link: function($scope, $element, $attrs, ngModelCtrl) {
            ngModelCtrl.render = () => {
                $scope.selected = ngModelCtrl.$viewValue;
            };
            
            $scope.onChange = function() {
                ngModelCtrl.$setViewValue($scope.selected);
            };

            $scope.queryDataSources = function() {
                const q = $scope.query ? angular.copy($scope.query) : new query.Query();
                if ($scope.searchText)
                    q.push(new query.Query({name: 'match', args: ['name', '*' + $scope.searchText + '*']}));
                
                return DataSource.objQuery({
                    query: q,
                    start: $scope.start,
                    limit: $scope.limit,
                    sort: $scope.sort || DEFAULT_SORT
                }).$promise.then(function(dataSources) {
                    if (!$scope.selected && $scope.autoInit && !$scope.autoInitDone && dataSources.length) {
                        $scope.selected = dataSources[0];
                        $scope.autoInitDone = true;
                    }
                    return dataSources;
                });
            };
            
            if ($scope.autoInit && !$scope.selected) {
                $scope.queryDataSources();
            }
        },
        designerInfo: {
            translation: 'ui.components.filteringDataSourceList',
            icon: 'filter_list'
        }
    };
}
export default filteringDataSourceList;


