/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import filteringDataSourceListTemplate from './filteringDataSourceList.html';
import './filteringDataSourceList.css';
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
            labelText: '<',
            allowClear: '<?',
            disabled: '<?ngDisabled',
            required: '<?ngRequired'
        },
        template: filteringDataSourceListTemplate,
        replace: false,
        link: function($scope, $element, $attrs, ngModelCtrl) {
            $scope.dsList = {};
            $scope.ngModelCtrl = ngModelCtrl;

            if (!$scope.hasOwnProperty('allowClear')) {
                $scope.allowClear = true;
            }

            ngModelCtrl.$render = () => {
                $scope.dsList.selected = ngModelCtrl.$viewValue;
            };
            
            $scope.onChange = function() {
                ngModelCtrl.$setViewValue($scope.dsList.selected);
            };

            $scope.queryDataSources = function(filter) {
                const q = $scope.query ? angular.copy($scope.query) : new query.Query();
                if (filter)
                    q.push(new query.Query({name: 'match', args: ['name', '*' + filter + '*']}));
                
                return DataSource.objQuery({
                    query: q,
                    start: $scope.start,
                    limit: $scope.limit,
                    sort: $scope.sort || DEFAULT_SORT
                }).$promise.then(function(dataSources) {
                    if (!$scope.dsList.selected && $scope.autoInit && !$scope.autoInitDone && dataSources.length) {
                        $scope.dsList.selected = dataSources[0];
                        $scope.autoInitDone = true;
                    }
                    return dataSources;
                });
            };
            
            if ($scope.autoInit && !$scope.dsList.selected) {
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


