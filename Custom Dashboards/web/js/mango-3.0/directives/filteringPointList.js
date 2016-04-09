/**
 * Copyright (C) 2016 Deltamation Software. All rights reserved.
 * http://www.deltamation.com.au/
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

function pointList(Point, $filter, $injector) {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngModel: '='
        },
        templateUrl: require.toUrl('./filteringPointList.html'),
        link: function ($scope, $element, attrs) {
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

pointList.$inject = ['Point', '$filter', '$injector'];
return pointList;

}); // define
