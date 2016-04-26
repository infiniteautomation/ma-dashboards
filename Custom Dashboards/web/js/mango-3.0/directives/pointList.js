/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function pointList(Point, $injector) {
    var DEFAULT_SORT = ['deviceName', 'name'];
    
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            initPoint: '=?',
            query: '=',
            start: '=',
            limit: '=',
            sort: '='
        },
        template: function(element, attrs) {
          var optionsExpr = 'pointLabel(point) for point in points';
          if (attrs.xidAsModel === 'true') {
            optionsExpr = 'point.xid as ' + optionsExpr;
          } else {
            optionsExpr += ' track by point.id';
          }
          
          if ($injector.has('$mdUtil')) {
              return '<md-select md-on-open="points.$promise">' +
              '<md-option ng-value="point" ng-repeat="point in points track by point.id">{{pointLabel(point)}}</md-option>' +
              '</md-select>';
          }
          
          return '<select ng-options="' + optionsExpr + '"></select>';
        },
        replace: true,
        link: function ($scope, $element, attrs) {
            if (angular.isUndefined($scope.initPoint)) {
                $scope.initPoint = true;
            }

            $scope.$watch(function() {
                return {
                    query: $scope.query,
                    start: $scope.start,
                    limit: $scope.limit,
                    sort: $scope.sort
                };
            }, function(value) {
                $scope.points = [];
                value.sort = value.sort || DEFAULT_SORT;
                var promise = Point.objQuery(value).$promise;
                
                promise.then(function(points) {
                    $scope.points = points;
                    
                    if ($scope.initPoint && !$scope.ngModel && $scope.points.length) {
                        $scope.ngModel = $scope.points[0];
                    }
                });
            }, true);
            
            $scope.pointLabel = function(point) {
                return point.deviceName + ' - ' + point.name;
            };
        }
    };
}

pointList.$inject = ['Point', '$injector'];
return pointList;

}); // define
