/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.directive:maPointHierarchy
 * @restrict E
 * @description
 * `<ma-point-hierarchy path="[]" hierarchy="folder"></ma-point-hierarchy>`
 * - Use `<ma-point-hierarchy>` to query the point hierarchy.
 * - `<ma-point-hierarchy>` accepts an array of strings into its `path` attribute.
 * - You can pass plain strings into this array or, use * as a wildcard for all subfolders,
 or separate multiple folders by a | character.
 * - <a ui-sref="ui.examples.pointHierarchy.displayTree">View Demo</a>
 *
 * @param {array} path Inputs an array targeting the folder(s) in the point hierarchy to access.
 * @param {object} hierarchy Outputs a nested object outlining the portion of the point hierarchy
 specified by the path.
 * @param {array=} points Outputs an array of point objects specified under the given path.
 * Note, the points attribute must be present in order for points to be added to the hierarchy object
 This point array can be used with a chart ([View Demo](/modules/mangoUI/web/ui/#/dashboard/examples/point-hierarchy/line-chart))
* @param {boolean=} subfolders If set to `false`, `points` will only return points that are contained directly as children in the target folders.
By default this is set to `true` and all descendant points are given, even those within subfolders. 
 *
 * @usage
 * <ma-point-hierarchy path="['Top Level Folder','Subfolder 1 | Subfolder 2']" hierarchy="hierarchy" points="points">
 </ma-point-hierarchy>
 *
 */

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
                var shouldGetPoints = attrs.points !== undefined;
                
            	$scope.hierarchy = path.length ?
            	        PointHierarchy.byPath({path: path, subfolders: subfolders, points: shouldGetPoints}) :
            	        PointHierarchy.getRoot({subfolders: subfolders, points: shouldGetPoints});
            	$scope.hierarchy.$promise.then(null, function() {
            	    delete $scope.hierarchy;
                    delete $scope.points;
            	});

            	// only do the work if we are actually going to use it
            	if (shouldGetPoints) {
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

pointHierarchy.$inject = ['maPointHierarchy'];
return pointHierarchy;

}); // define
