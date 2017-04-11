/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function pointQuery(Point) {
    return {
        scope: {
        	query: '@',
            points: '='
        },
        link: function ($scope, $element, attr) {
            $scope.$watch('query', function(value) {
            	$scope.points = value ? Point.rql({query: value}) : Point.query();
            });
        }
    };
}

pointQuery.$inject = ['Point'];
return pointQuery;

}); // define
