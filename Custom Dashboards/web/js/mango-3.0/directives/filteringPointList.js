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
            ngChange: '@'
        },
        templateUrl: require.toUrl('./filteringPointList.html'),
        link: function ($scope, $element, attrs) {
            var change = $parse(attrs.ngChange);
            $scope.changed = function() {
                $timeout(function() {
                    change($scope.$parent);
                }, 0);
            };
            
            $scope.querySearch = function(queryStr) {
                var query = 'or(name=like=*' + queryStr +'*,deviceName=like=*' + queryStr + '*)';
                if (attrs.query) {
                    query += '&' + attrs.query;
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
