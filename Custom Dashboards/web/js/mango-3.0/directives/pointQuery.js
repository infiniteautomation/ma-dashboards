/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function pointQuery(Point) {
    var DEFAULT_SORT = ['deviceName', 'name'];
    
    return {
        scope: {
        	query: '=',
            start: '=',
            limit: '=',
            sort: '=',
            points: '=',
            promise: '=?',
            clearOnQuery: '='
        },
        link: function ($scope, $element, attr) {
            $scope.$watch(function() {
                return {
                    query: $scope.query,
                    start: $scope.start,
                    limit: $scope.limit,
                    sort: $scope.sort
                };
            }, function(value) {
                value.sort = value.sort || DEFAULT_SORT;
                var newPoints = Point.objQuery(value);
                $scope.promise = newPoints.$promise;
                
                if ($scope.clearOnQuery) {
                    $scope.points = newPoints;
                } else {
                    newPoints.$promise['finally'](function(pts) {
                        $scope.points = newPoints;
                    });
                }
            }, true);
        }
    };
}

pointQuery.$inject = ['Point'];
return pointQuery;

}); // define
