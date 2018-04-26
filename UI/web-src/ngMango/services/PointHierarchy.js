/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
* @ngdoc service
* @name ngMangoServices.maPointHierarchy
*
* @description
* Provides service for getting point hierarchy
* - Used by <a ui-sref="ui.docs.ngMango.maPointHierarchy">`<ma-point-hierarchy>`</a> directive.
* - All methods return <a href="https://docs.angularjs.org/api/ngResource/service/$resource" target="_blank">$resource</a>
*   objects that can call the following methods available to those objects:
*   - `$save`
*   - `$remove`
*   - `$delete`
*   - `$get`
*
* # Usage
*
* <pre prettyprint-mode="javascript">
*  PointHierarchy.byPath({path: path, subfolders: subfolders})
* </pre>
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maPointHierarchy
* @name PointHierarchy#get
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v1/hierarchy/by-id/:id`
* @param {object} query Object containing a `id` property which will be used in the query.
* @returns {object} Returns a point hierarchy object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maPointHierarchy
* @name PointHierarchy#save
*
* @description
* A default action provided by $resource. Makes a http POST call to the rest endpoint `/rest/v1/hierarchy/by-id/:id`
* @param {object} query Object containing a `id` property which will be used in the query.
* @returns {object} Returns a point hierarchy object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maPointHierarchy
* @name PointHierarchy#remove
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/hierarchy/by-id/:id`
* @param {object} query Object containing a `id` property which will be used in the query.
* @returns {object} Returns a point hierarchy object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maPointHierarchy
* @name PointHierarchy#delete
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/hierarchy/by-id/:id`
* @param {object} query Object containing a `id` property which will be used in the query.
* @returns {object} Returns a point hierarchy object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maPointHierarchy
* @name getRoot
*
* @description
* Uses the http GET method to retrieve the full hierarchy at `/rest/v1/hierarchy/full`
* @returns {object} Returns a point hierarchy object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maPointHierarchy
* @name byPath
*
* @description
* Uses the http GET method to retrieve the hierarchy at the specifed path `/rest/v1/hierarchy/by-path/:path`
* @param {object} query Object containing a `path` property which will be used to narrow the hierarchy query to the specifed folder path.
*   Additionally a `subfolders` property containing a boolean value can be passed via the query object. If set to `false`, `points`
*   will only return points that are containeddirectly as children in the target folders.
*   By default this is set to `true` and all descendant points are given, even those within subfolders. 
* @returns {object} Returns a point hierarchy object. Objects will be of the resource class and have resource actions available to them.
*
*/



/**
* @ngdoc method
* @methodOf ngMangoServices.maPointHierarchy
* @name byName
*
* @description
* Uses the http GET method to retrieve the hierarchy at the specifed path `/rest/v1/hierarchy/by-name/:name`
* @param {object} query Object containing a `name` property which will be used to narrow the hierarchy query to the specifed folder name.
*     Additionally a `subfolders` property containing a boolean value can be passed via the query object. If set to `false`,
*     `points` will only return points that are contained directly as children in the target folders.
*     By default this is set to `true` and all descendant points are given, even those within subfolders. 
* @returns {object} Returns a point hierarchy object. Objects will be of the resource class and have resource actions available to them.
*
*/
/*
 * Provides service for getting point hierarchy
 */
PointHierarchyFactory.$inject = ['$resource', 'maPoint'];
function PointHierarchyFactory($resource, Point) {
    var PointHierarchy = $resource('/rest/v1/hierarchy/by-id/:id', {
    		id: '@id'
    	}, {
    	getRoot: {
    	    method: 'GET',
            url: '/rest/v1/hierarchy/full',
            isArray: false,
            timeout: 60000
    	},
        byPath: {
            method: 'GET',
            url: '/rest/v1/hierarchy/by-path/:path',
            isArray: false
        },
        byName: {
            method: 'GET',
            url: '/rest/v1/hierarchy/by-name/:name',
            isArray: false
        },
        pathByXid: {
            method: 'GET',
            url: ' /rest/v1/hierarchy/path/:xid',
            isArray: true
        }
    });
    
    PointHierarchy.prototype.walkHierarchy = function walkHierarchy(fn) {
        return PointHierarchy.walkHierarchy(this, fn);
    };
    
    PointHierarchy.prototype.getPoints = function getPoints(subFolders) {
        var folderIds = [];
        if (subFolders) {
            this.walkHierarchy(function(folder) {
                folderIds.push(folder.id);
            });
        } else {
            folderIds.push(this.id);
        }
        
        return PointHierarchy.getPointsForFolderIds(folderIds);
    };
    
    PointHierarchy.getPointsForFolderIds = function getPointsForFolderIds(folderIds) {
        return Point.buildQuery()
            .in('pointFolderId', folderIds)
            .limit(10000)
            .query();
    };

    PointHierarchy.walkHierarchy = function walkHierarchy(folder, fn, parent, index, depth = 0) {
        let result = fn(folder, parent, index, depth);
        if (result) return result;
        
        if (!folder.subfolders) return;
        
        for (var i = 0; i < folder.subfolders.length; i++) {
            result = walkHierarchy(folder.subfolders[i], fn, folder, i, depth + 1);
            if (result) return result;
        }
    };

    return PointHierarchy;
}

export default PointHierarchyFactory;


