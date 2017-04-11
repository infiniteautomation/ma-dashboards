/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function pointList(Point, $filter, $injector) {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            order: '=?',
            ngModel: '=',
            initPoint: '=?',
            query: '@'
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
            $scope.order = $scope.order || ['deviceName', 'name'];
            if (angular.isUndefined($scope.initPoint)) {
                $scope.initPoint = true;
            }
            
            $scope.$watchCollection('order', function(newValue) {
                if (newValue) {
                    $scope.points = $filter('orderBy')($scope.points, newValue);
                }
            });
            
            $scope.$watch('query', function(value) {
                $scope.points = [];
                var promise;
                if (value) {
                    promise = Point.rql({
                        query: value
                    }).$promise;
                } else {
                    promise = Point.query().$promise;
                }
                
                promise.then(function(points) {
                    if ($scope.order) {
                        $scope.points = $filter('orderBy')(points, $scope.order);
                    } else {
                        $scope.points = points;
                    }
                    
                    if ($scope.initPoint && !$scope.ngModel && $scope.points.length) {
                        $scope.ngModel = $scope.points[0];
                    }
                });
            });
            
            $scope.pointLabel = function(point) {
                return point.deviceName + ' - ' + point.name;
            };
        }
    };
}

pointList.$inject = ['Point', '$filter', '$injector'];
return pointList;

}); // define
