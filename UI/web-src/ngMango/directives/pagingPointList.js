/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import pagingPointListTemplate from './pagingPointList.html';

function pagingPointList(Point, $filter, $injector, $parse, $timeout, DynamicItems) {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            ngChange: '@',
            limit: '=?',
            autoInit: '=?'
        },
        template: pagingPointListTemplate,
        link: function ($scope, $element, attrs) {

            $scope.dynamicItems = new DynamicItems({service: Point});

            if ($scope.autoInit) {
                Point.buildQuery().limit(1).query().then(function(item) {
                    $scope.ngModel = item[0];
                });
            }
            
            const change = $parse(attrs.ngChange);
            $scope.changed = function() {
                $timeout(function() {
                    change($scope.$parent);
                }, 0);
            };
            
            $scope.querySearch = function(queryStr) {
                queryStr = queryStr || '';
                let query = 'or(name=like=*' + queryStr +'*,deviceName=like=*' + queryStr + '*)';
                if (attrs.query) {
                    query += '&' + attrs.query;
                } else {
                    query += '&sort(deviceName,name)&limit(' + ($scope.limit || 200) +')';
                }
                return Point.query({
                    rqlQuery: query
                }).$promise.then(null, function() {
                    return [];
                });
            };

            $scope.pointLabel = function(point) {
                return point.deviceName + ' - ' + point.name;
            };
        },
        designerInfo: {
            translation: 'ui.components.maPagingPointList',
            icon: 'format_list_bulleted'
        }
    };
}

pagingPointList.$inject = ['maPoint', '$filter', '$injector', '$parse', '$timeout', 'maDynamicItems'];
export default pagingPointList;


