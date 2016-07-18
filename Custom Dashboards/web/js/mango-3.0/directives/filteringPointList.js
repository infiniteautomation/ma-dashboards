/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

function pointList(Point, $filter, $injector, $parse, $timeout) {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            ngChange: '@',
            limit: '=?',
            autoInit: '=?'
        },
        templateUrl: require.toUrl('./filteringPointList.html'),
        link: function ($scope, $element, attrs) {
            if ($scope.autoInit) {
                Point.rql({query: 'limit(1)'}).$promise.then(function(item) {
                    $scope.ngModel = item[0];
                });
            }
            
            var change = $parse(attrs.ngChange);
            $scope.changed = function() {
                $timeout(function() {
                    change($scope.$parent);
                }, 0);
            };
            
            $scope.querySearch = function(queryStr) {
                queryStr = queryStr || '';
                var query = 'or(name=like=*' + queryStr +'*,deviceName=like=*' + queryStr + '*)';
                if (attrs.query) {
                    query += '&' + attrs.query;
                } else {
                    query += '&sort(deviceName,name)&limit(' + ($scope.limit || 200) +')';
                }
                return Point.rql({
                    query: query
                }).$promise.then(null, function() {
                    return [];
                });
            };

            $scope.pointLabel = function(point) {
                return point.deviceName + ' - ' + point.name;
            };
        }
    };
}

pointList.$inject = ['Point', '$filter', '$injector', '$parse', '$timeout'];
return pointList;

}); // define
