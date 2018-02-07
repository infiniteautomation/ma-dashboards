/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'rql/query'], function(angular, query) {
'use strict';

WatchListFactory.$inject = ['$resource', 'maUtil', '$http', 'maPoint', 'maPointHierarchy', '$q',
    '$interpolate', '$sce', '$parse', 'maRqlBuilder'];
function WatchListFactory($resource, Util, $http, Point, PointHierarchy, $q,
        $interpolate, $sce, $parse, RqlBuilder) {

    const WatchList = $resource('/rest/v1/watch-lists/:xid', {
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
    
    WatchList.prototype.defaultParamValues = function defaultParamValues(paramValues = {}) {
        if (this.data && this.data.paramValues) {
            Object.keys(this.data.paramValues).forEach(paramName => {
                if (paramValues[paramName] === undefined) {
                    paramValues[paramName] = angular.copy(this.data.paramValues[paramName]);
                }
            });
        }
        
        if (this.params) {
            this.params.forEach(param => {
                if (param.options && param.options.fixedValue !== undefined) {
                    paramValues[param.name] = angular.copy(param.options.fixedValue);
                }
            });
        }
        
        return paramValues;
    };

    WatchList.prototype.getPoints = function(paramValues) {
        if (paramValues == null) {
            paramValues = this.defaultParamValues();
        }
        
        if (this.type === 'static') {
            return $http({
                method: 'GET',
                url: '/rest/v1/watch-lists/' + encodeURIComponent(this.xid) +'/data-points',
                cache: false,
                transformResponse: Util.transformArrayResponse
            }).then(function(response) {
                this.points = transformToPointObjects(response.data);
                return this.points;
            }.bind(this));
        } else if (this.type === 'query') {
            const ptQuery = this.interpolateQuery(paramValues);
            const resource = Point.query({rqlQuery: ptQuery});
            resource.$promise.setCancel(resource.$cancelRequest);
            return resource.$promise.then(function(points) {
                const result = transformToPointObjects(points);
                result.$rqlQuery = ptQuery;
                return result;
            });
        } else if (this.type === 'hierarchy') {
            let folderIds = this.folderIds;
            
            if (this.hierarchyFolders) {
                folderIds = this.hierarchyFolders.map(function(folder) {
                    return folder.id;
                });
            }
            
            if (!folderIds || !folderIds.length) {
                return $q.when([]);
            }
            
            return PointHierarchy.getPointsForFolderIds(folderIds).then(function(points) {
                return transformToPointObjects(points);
            });
        } else if (this.type === 'tags') {
            const builder = new RqlBuilder();
            let emptyResult = false;
            
            this.params.filter(p => p.type === 'tagValue')
            .forEach(param => {
                const paramValue = paramValues[param.name];
                const rqlProperty = `tags.${param.options.tagKey}`;
                
                if (param.options.multiple) {
                    if (!Array.isArray(paramValue) || !paramValue.length) {
                        if (param.options.required) {
                            emptyResult = true;
                        }
                        return;
                    }
                    // remove the null from the in query and add a separate eq==null query
                    if (paramValue.includes(null)) {
                        const filteredParamValue = paramValue.filter(v => v != null);
                        builder.or()
                            .in(rqlProperty, filteredParamValue)
                            .eq(rqlProperty, null)
                            .up();
                    } else {
                        builder.in(rqlProperty, paramValue);
                    }
                    
                } else {
                    if (paramValue === undefined) {
                        if (param.options.required) {
                            emptyResult = true;
                        }
                        return;
                    }
                    
                    builder.eq(rqlProperty, paramValue);
                }
            });
            
            if (emptyResult) {
                return $q.when([]);
            }
            
            const resource = Point.query({rqlQuery: builder.toString()});
            resource.$promise.setCancel(resource.$cancelRequest);
            return resource.$promise;
        } else {
            return $q.reject('unknown watchlist type');
        }
        
        function transformToPointObjects(points) {
            for (let i = 0; i < points.length; i++) {
                const pt = points[i];
                if (!(pt instanceof Point)) {
                    points[i] = angular.merge(new Point(), pt);
                }
            }
            return points;
        }
    };
    
    WatchList.prototype.interpolateQuery = function interpolateQuery(params) {
        params = params || {};
        const parsed = new query.Query(this.query);
        parsed.walk(function(name, args) {
            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                if (typeof arg !== 'string' || arg.indexOf('{{') < 0) continue;
                
                const matches = /{{(.*?)}}/.exec(arg);
                if (matches && matches[0] === matches.input) {
                    const evaluated = $parse(matches[1])(params);
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
        if (!this.data || !this.data.paramValues) return;
        
        Object.keys(this.data.paramValues).forEach(paramName => {
            const wlParam = this.params.find(p => p.name === paramName);
            if (!wlParam) {
                delete this.data.paramValues[paramName];
            } else {
                const paramValue = this.data.paramValues[paramName];
                if (paramValue != null && typeof paramValue === 'object' && (paramValue.id != null || paramValue.xid)) {
                    this.data.paramValues[paramName] = {
                        id: paramValue.id,
                        xid: paramValue.xid,
                        name: paramValue.name
                    };
                }
            }
        });
    };
    
    WatchList.prototype.hasParamOptions = function() {
        if (!(this.type === 'query' || this.type === 'tags')) return false;
        return this.params && this.params.length && this.params.some(p => !p.options || !p.options.hasOwnProperty('fixedValue'));
    };
    
    const saveMethod = WatchList.prototype.$save;
    WatchList.prototype.$save = function() {
        this.sanitizeParamValues();
        return saveMethod.apply(this, arguments);
    };

    const updateMethod = WatchList.prototype.$update;
    WatchList.prototype.$update = function() {
        this.sanitizeParamValues();
        return updateMethod.apply(this, arguments);
    };
    
    const updateWithRenameMethod = WatchList.prototype.$updateWithRename;
    WatchList.prototype.$updateWithRename = function() {
        this.sanitizeParamValues();
        return updateWithRenameMethod.apply(this, arguments);
    };
    
    return WatchList;
}

return WatchListFactory;

}); // define
