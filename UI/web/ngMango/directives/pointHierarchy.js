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
 * @param {expression} hierarchy Assignable expression to output the point hierarchy object.
 * @param {(string[]|string)=} path The path to a folder in the point hierarchy. Can be an array of folder names (strings)
 *     or a comma separated list of folder names.
 * @param {expression} points Assignable expression to output the points in the hierarchy for the given path.
 *     Note, the points attribute must be present in order for points to be added to the hierarchy object.
 *     This point array can be used with a chart ([View Demo](/modules/mangoUI/web/ui/#/dashboard/examples/point-hierarchy/line-chart))
 * @param {boolean=} subfolders If set to `false`, `points` will only return points that are contained directly as children in the target folders.
 *     By default this is set to `true` and all descendant points are given, even those within subfolders. 
 *
 * @usage
 * <ma-point-hierarchy path="['Top Level Folder','Subfolder 1 | Subfolder 2']" hierarchy="hierarchy" points="points">
 </ma-point-hierarchy>
 *
 */

function pointHierarchy(PointHierarchy) {
    return {
        scope: {
        	path: '<',
            folderId: '<',
            hierarchy: '=?',
            points: '=?',
            subfolders: '<?',
            onGetFolder: '&?'
        },
        link: function ($scope, $element, attrs) {
            $scope.$watch('[path, subfolders, folderId]', function() {
                var path = $scope.path;
                if (!path && $scope.folderId == null) {
                    delete $scope.hierarchy;
                    delete $scope.points;
                    delete $scope.folderId;
                    return;
                }

                if (typeof path === 'string') {
                    path = path.split(',');
                }

                var subfolders = typeof attrs.subfolders === 'undefined' ? true : !!$scope.subfolders;
                var shouldGetPoints = attrs.points !== undefined;
                
                if ($scope.folderId != null) {
                    $scope.hierarchy = PointHierarchy.get({id: $scope.folderId});
                } else {
                    $scope.hierarchy = path.length ?
                            PointHierarchy.byPath({path: path, subfolders: subfolders, points: shouldGetPoints}) :
                            PointHierarchy.getRoot({subfolders: subfolders, points: shouldGetPoints});
                }
            	
            	$scope.hierarchy.$promise.then(null, function() {
            	    delete $scope.hierarchy;
                    delete $scope.points;
                    delete $scope.folderId;
            	});

        	    $scope.hierarchy.$promise.then((folder) => {
                    // check for missing folder, REST API returns 200 OK when folder is not found
        	        if (folder.hasOwnProperty('name')) {
                        // only do the work if we are actually going to use it
                        if (shouldGetPoints) {
                            $scope.points = getPoints(folder);
                        }
                        
                        if ($scope.onGetFolder) {
                            const allFolders = [];
                            PointHierarchy.walkHierarchy(folder, (folder, parent, index, depth) => {
                                allFolders.push(folder);
                            });
                            $scope.onGetFolder({$folder: folder, $points: $scope.points, $allFolders: allFolders});
                        }
        	        }
        	    });
            }, true);
        },
        designerInfo: {
            translation: 'ui.components.maPointHierarchy',
            icon: 'share'
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
