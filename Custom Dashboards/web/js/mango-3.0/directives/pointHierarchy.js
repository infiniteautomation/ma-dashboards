/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function pointHierarchy(PointHierarchy) {
    return {
        scope: {
        	path: '=',
            hierarchy: '=',
            points: '=?',
            subfolders: '='
        },
        link: function ($scope, $element, attrs) {
            $scope.$watch('[path, subfolders]', function() {
                var path = $scope.path;
                if (!path) {
                    delete $scope.hierarchy;
                    delete $scope.points;
                    return;
                }
                
                if (typeof value === 'string') {
                    path = path.split(',');
                }
                
                var subfolders = typeof attrs.subfolders === 'undefined' ? true : !!$scope.subfolders;
                
            	$scope.hierarchy = path.length ?
            	        PointHierarchy.byPath({path: path, subfolders: subfolders}) :
            	        PointHierarchy.getRoot({subfolders: subfolders});
            	$scope.hierarchy.$promise.then(null, function() {
            	    delete $scope.hierarchy;
                    delete $scope.points;
            	});
            	
            	// only do the work if we are actually going to use it
            	if (attrs.points !== undefined) {
            	    $scope.hierarchy.$promise.then(function(folder) {
                        $scope.points = getPoints(folder);
            	    });
            	}
            }, true);
        }
    };
    
    function getPoints(folder) {
        var points = [];
        Array.prototype.push.apply(points, folder.points);
        for (var i = 0; i < folder.subfolders.length; i++) {
            Array.prototype.push.apply(points, getPoints(folder.subfolders[i]));
        }
        return points;
    }
}

pointHierarchy.$inject = ['PointHierarchy'];
return pointHierarchy;

}); // define
