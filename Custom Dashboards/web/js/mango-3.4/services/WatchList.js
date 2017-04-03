/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'rql/query'], function(angular, query) {
'use strict';

WatchListFactory.$inject = ['$resource', 'Util', '$http', 'Point', 'PointHierarchy', '$q', '$interpolate', '$sce', '$parse'];
function WatchListFactory($resource, Util, $http, Point, PointHierarchy, $q, $interpolate, $sce, $parse) {

    var WatchList = $resource('/rest/v1/watch-lists/:xid', {
        xid: '@xid',
        originalXid: '@originalXid'
    }, {
        query: {
            method: 'GET',
            isArray: true,
            transformResponse: Util.transformArrayResponse,
            interceptor: {
                response: Util.arrayResponseInterceptor
            },
            withCredentials: true,
            cache: false
        },
        save: {
            method: 'POST',
            url: '/rest/v1/watch-lists/'
        },
        update: {
            method: 'PUT'
        },
        updateWithRename: {
            method: 'PUT',
            url: '/rest/v1/watch-lists/:originalXid'
        }
    });
    
    WatchList.objQuery = Util.objQuery;

    WatchList.prototype.getPoints = function(params) {
        if (this.type === 'static') {
            return $http({
                method: 'GET',
                url: '/rest/v1/watch-lists/' + encodeURIComponent(this.xid) +'/data-points',
                withCredentials: true,
                cache: false,
                transformResponse: Util.transformArrayResponse
            }).then(function(response) {
                this.points = transformToPointObjects(response.data);
                return this.points;
            }.bind(this));
        } else if (this.type === 'query') {
            var ptQuery = this.interpolateQuery(params);
            return Point.query({rqlQuery: ptQuery}).$promise.then(function(points) {
                return transformToPointObjects(points);
            });
        } else if (this.type === 'hierarchy') {
            var folderIds = this.folderIds;
            
            if (this.hierarchyFolders) {
                folderIds = [];
                for (var i = 0; i < this.hierarchyFolders.length; i++) {
                    folderIds.push(this.hierarchyFolders[i].id);
                }
            }
            
            if (!folderIds || !folderIds.length) {
                return $q.when([]);
            }
            
            return PointHierarchy.getPointsForFolderIds(folderIds).then(function(points) {
                return transformToPointObjects(points);
            });
        } else {
            return $q.reject('unknown watchlist type');
        }
        
        function transformToPointObjects(points) {
            for (var i = 0; i < points.length; i++) {
                var pt = points[i];
                if (!(pt instanceof Point)) {
                    points[i] = angular.merge(new Point(), pt);
                }
            }
            return points;
        }
    };
    
    WatchList.prototype.interpolateQuery = function interpolateQuery(params) {
        params = params || {};
        var parsed = new query.Query(this.query);
        parsed.walk(function(name, args) {
            for (var i = 0; i < args.length; i++) {
                var arg = args[i];
                if (typeof arg !== 'string' || arg.indexOf('{{') < 0) continue;
                
                var matches = /{{(.*?)}}/.exec(arg);
                if (matches && matches[0] === matches.input) {
                    var evaluated = $parse(matches[1])(params);
                    args[i] = angular.isUndefined(evaluated) ? '' : evaluated;
                } else {
                    args[i] = $interpolate(arg)(params, false, $sce.URL, false);
                }
            }
            
            if (name === 'in' && args.length > 1) {
                if (angular.isArray(args[1])) {
                    Array.prototype.splice.apply(args, [1, 1].concat(args[1]));
                } else if (typeof args[1] === 'string') {
                    Array.prototype.splice.apply(args, [1, 1].concat(args[1].split(',')));
                }
            }
        }.bind(this));
        return parsed.toString();
    };
    
    WatchList.prototype.sanitizeParamValues = function() {
        if (this.data && this.data.paramValues) {
            for (var paramName in this.data.paramValues) {
                var paramValue = this.data.paramValues[paramName];
                // jshint eqnull:true
                if (typeof paramValue === 'object' && (paramValue.id != null || paramValue.xid)) {
                    this.data.paramValues[paramName] = {
                        id: paramValue.id,
                        xid: paramValue.xid,
                        name: paramValue.name
                    };
                }
            }
        }
    };
    
    var saveMethod = WatchList.prototype.$save;
    WatchList.prototype.$save = function() {
        this.sanitizeParamValues();
        return saveMethod.apply(this, arguments);
    };

    var updateMethod = WatchList.prototype.$update;
    WatchList.prototype.$update = function() {
        this.sanitizeParamValues();
        return updateMethod.apply(this, arguments);
    };
    
    var updateWithRenameMethod = WatchList.prototype.$updateWithRename;
    WatchList.prototype.$updateWithRename = function() {
        this.sanitizeParamValues();
        return updateWithRenameMethod.apply(this, arguments);
    };
    
    return WatchList;
}

return WatchListFactory;

}); // define
