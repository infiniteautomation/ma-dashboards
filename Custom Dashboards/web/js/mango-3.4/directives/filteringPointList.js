/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'rql/query'], function(require, query) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maFilteringPointList
 * @restrict E
 * @description
 * `<ma-filtering-point-list ng-model="myPoint"></ma-filtering-point-list>`
 * - Creates a self-filtering point list that allows you to select a data point by filtering on device names or point names that contain the text.
     Search results will update as you type.
 * - <a ui-sref="dashboard.examples.basics.pointList">View Demo</a>
 *
 * @param {object} ng-model Variable to hold the selected data point.
 * @param {number=} limit Limits the results in the list to a specified number of data points (200 defualt)
 * @param {boolean=} auto-init If set, enables auto selecting of the first data point in the list.
 * @param {string=} point-xid Used with `auto-init` to pre-select the specified point by xid. 
 * @param {string=} point-id Used with `auto-init` to pre-select the specified point by data point id. 
 
 *
 * @usage
 * <ma-filtering-point-list ng-model="myPoint"></ma-filtering-point-list>
 */
filteringPointList.$inject = ['Point', '$filter', '$injector', 'Translate', '$timeout'];
function filteringPointList(Point, $filter, $injector, Translate, $timeout) {
    return {
        restrict: 'E',
        require: 'ngModel',
        designerInfo: {
            translation: 'dashboards.v3.components.filteringPointList',
            icon: 'filter_list',
            category: 'dropDowns',
            attributes: {
                query: {}
            }
        },
        scope: {
            limit: '<?',
            autoInit: '<?',
            pointXid: '@',
            pointId: '<?',
            label: '@',
            listText: '&?',
            displayText: '&?',
            clientSideFilter: '<?'
        },
        templateUrl: require.toUrl('./filteringPointList.html'),
        link: filteringPointListPostLink
    };

    function filteringPointListPostLink($scope, $element, attrs, ngModelCtrl) {
        if (!$scope.label)
            $scope.label = Translate.trSync('dashboards.v3.app.searchBy', 'points', 'name or device');
        
        if ($scope.autoInit) {
            if (!$scope.pointXid && !$scope.pointId) {
                Point.rql({query: 'limit(1)'}).$promise.then(function(item) {
                    $scope.setPoint(item[0]);
                });
            }

            $scope.$watch('pointXid', function(newValue, oldValue) {
                if (!newValue) return;
                
                Point.get({xid: newValue}).$promise.then(function(item) {
                    $scope.setPoint(item);
                });
            });

            $scope.$watch('pointId', function(newValue, oldValue) {
                // jshint eqnull:true
                if (newValue == null) return;
                
                Point.getById({id: newValue}).$promise.then(function(item) {
                    $scope.setPoint(item);
                });
            });
        }
        
        ngModelCtrl.$render = function() {
            $scope.selectedItem = this.$viewValue;
        };
        
        $scope.setPoint = function(point) {
            if (point) {
                this.selectedItem = point;
            }
            ngModelCtrl.$setViewValue(this.selectedItem);
        };

        $scope.querySearch = function(inputText) {
            var rqlQuery, queryString = '';
            
            if (inputText) {
                rqlQuery = new query.Query();
                var nameLike = new query.Query({name: 'like', args: ['name', '*' + inputText + '*']});
                var deviceName = new query.Query({name: 'like', args: ['deviceName', '*' + inputText + '*']});
                rqlQuery.push(nameLike);
                rqlQuery.push(deviceName);
                rqlQuery.name = 'or';
            }

            if (attrs.query) {
                if (rqlQuery) {
                    queryString = rqlQuery.toString();
                }
                queryString = queryString + attrs.query;
            } else {
                var q = new query.Query();
                if (rqlQuery)
                    q.push(rqlQuery);

                queryString = q.sort('deviceName', 'name')
                    .limit($scope.limit || 150)
                    .toString();
            }
            
            return Point.rql({
                rqlQuery: queryString
            }).$promise.then(function(result) {
                if ($scope.clientSideFilter) {
                    return $filter('filter')(result, $scope.clientSideFilter);
                } else {
                    return result;
                }
            }, function() {
                return [];
            });
        };
        
        if (!$scope.listText) {
            $scope.listText = defaultText;
        }
        
        if (!$scope.displayText) {
            $scope.displayText = defaultText;
        }
        
        function defaultText(opts) {
            return opts.$point.deviceName + ' - ' + opts.$point.name;
        }
    }
}

return filteringPointList;

}); // define
