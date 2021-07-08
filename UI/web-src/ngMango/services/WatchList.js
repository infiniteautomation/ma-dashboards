/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import query from 'rql/query';

WatchListFactory.$inject = ['$resource', 'maUtil', '$http', 'maPoint', '$q',
    '$interpolate', '$sce', '$parse', 'maRqlBuilder', 'maUser'];
function WatchListFactory($resource, maUtil, $http, Point, $q,
        $interpolate, $sce, $parse, RqlBuilder, User) {

    const defaultProperties = {
        name: '',
        xid: '',
        points: [],
        username: '',
        type: 'tags',
        readPermission: [],
        editPermission: []
    };
    
    /**
    * @ngdoc service
    * @name ngMangoServices.maWatchList
    *
    * @description Service for querying, getting and saving watch lists.
    */
    const WatchList = $resource('/rest/latest/watch-lists/:xid', {
        xid: data => data && (data.originalId || data.xid)
    }, {
        query: {
            method: 'GET',
            isArray: true,
            transformResponse: maUtil.transformArrayResponse,
            interceptor: {
                response: maUtil.arrayResponseInterceptor
            },
            cache: false
        },
        save: {
            method: 'POST',
            url: '/rest/latest/watch-lists/',
            params: {
                xid: null
            }
        },
        update: {
            method: 'PUT'
        }
    }, {
        defaultProperties,
        xidPrefix: 'WL_'
    });

    const saveMethod = WatchList.prototype.$save;
    const updateMethod = WatchList.prototype.$update;

    Object.assign(WatchList.prototype, {

        $save() {
            this.sanitizeParamValues();
            return saveMethod.apply(this, arguments);
        },
        
        $update() {
            this.sanitizeParamValues();
            return updateMethod.apply(this, arguments);
        },
        
        getQuery(paramValues = this.defaultParamValues()) {
            const builder = new RqlBuilder();
            
            if (this.type === 'static') {
                // must have points pre-populated!
                // call getPoints() or .$get() first
                // shouldn't really use this method for static watch lists
                builder.in('xid', this.points.map(p => p.xid));
            } else if (this.type === 'query') {
                return this.interpolateQuery(paramValues);
            } else if (this.type === 'tags') {
                const tagParams = this.params.filter(p => p.type === 'tagValue');
                for (const param of tagParams) {
                    const paramValue = paramValues[param.name];
                    const rqlProperty = `tags.${param.options.tagKey}`;

                    if (param.options.multiple) {
                        if (Array.isArray(paramValue) && paramValue.length) {
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
                        } else if (param.options.required) {
                            return null;
                        }
                    } else {
                        if (paramValue !== undefined) {
                            builder.eq(rqlProperty, paramValue);
                        } else if (param.options.required) {
                            return null;
                        }
                    }
                }
            } else {
                throw new Error('unknown watchlist type');
            }
            
            if (this.type !== 'static' && this.type !== 'query') {
                if (this.data && this.data.limit != null) {
                    builder.limit(this.data.limit, this.data.offset);
                } else {
                    // TODO this is a unbounded query
                }
            }
            
            return builder.build();
        },
        
        getPoints(paramValues = this.defaultParamValues()) {
            if (this.type === 'static') {
                return $http({
                    method: 'GET',
                    url: `/rest/latest/watch-lists/${encodeURIComponent(this.xid)}/data-points`,
                    cache: false,
                    transformResponse: maUtil.transformArrayResponse
                }).then(response => {
                    this.points = response.data.map(item => {
                        const pt = Object.assign(Object.create(Point.prototype), item);
                        pt.originalId = pt.xid;
                        return pt;
                    });
                    return this.points;
                });
            } else {
                let query;
                try {
                    query = this.getQuery(paramValues);
                } catch (e) {
                    return $q.reject(e);
                }
                
                if (query == null) {
                    return $q.when([]);
                }

                const resource = Point.query({rqlQuery: query.toString()});
                resource.$promise.setCancel(resource.$cancelRequest);
                return resource.$promise;
            }
        },
        
        interpolateQuery(params) {
            params = params || {};
            const parsed = new query.Query(this.query);
            parsed.walk((name, args) => {
                for (let i = 0; i < args.length; i++) {
                    const arg = args[i];
                    if (typeof arg !== 'string' || arg.indexOf('{{') < 0) continue;
                    
                    const matches = /{{(.*?)}}/.exec(arg);
                    if (matches && matches[0] === matches.input) {
                        const evaluated = $parse(matches[1])(params);
                        args[i] = evaluated === undefined ? '' : evaluated;
                    } else {
                        args[i] = $interpolate(arg)(params, false, $sce.URL, false);
                    }
                }
                
                if (name === 'in' && args.length > 1) {
                    if (Array.isArray(args[1])) {
                        Array.prototype.splice.apply(args, [1, 1].concat(args[1]));
                    } else if (typeof args[1] === 'string') {
                        Array.prototype.splice.apply(args, [1, 1].concat(args[1].split(',')));
                    }
                }
            });
            
            return parsed;
        },
        
        sanitizeParamValues() {
            if (!this.data || !this.data.paramValues) return;
            
            Object.keys(this.data.paramValues).forEach(paramName => {
                const wlParam = Array.isArray(this.params) && this.params.find(p => p.name === paramName);
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
        },
        
        /**
         * @ngdoc method
         * @name hasParamOptions
         * @methodOf ngMangoServices.maWatchList
         * @returns {boolean} true if the watch list has at least one configurable parameter
         */
        hasParamOptions() {
            if (!(this.type === 'query' || this.type === 'tags')) return false;
            return this.params && this.params.length && this.params.some(p => !p.options || !p.options.hasOwnProperty('fixedValue'));
        },
        
        /**
         * @ngdoc method
         * @name defaultParamValues
         * @methodOf ngMangoServices.maWatchList
         * 
         * @description Updates parameter values for this watch list's parameters, populated from its defaults
         * Any values in the paramValues object passed in will not be modified except for where the value is an empty array
         * or the parameter is defined as having a fixed value.
         * If a parameter is a multiple input type and the parameter value is not an array it will be wrapped as an array.
         * If a parameter is not a multiple input type and the parameter value is an array it will be unwrapped
         * (the first value in the array will be used).
         * 
         * @param {object} [paramValues={}] Parameter values for this watch list
         * @returns {object} Updated parameter values
         */
        defaultParamValues(paramValues = {}) {
            if (this.data && this.data.paramValues) {
                Object.keys(this.data.paramValues).forEach(paramName => {
                    const paramValue = paramValues[paramName];
                    if (paramValue === undefined || Array.isArray(paramValue) && !paramValue.length) {
                        paramValues[paramName] = angular.copy(this.data.paramValues[paramName]);
                    }
                });
            }
            
            if (this.params) {
                this.params.forEach(param => {
                    if (param.options && param.options.fixedValue !== undefined) {
                        paramValues[param.name] = angular.copy(param.options.fixedValue);
                    }
                    
                    const currentValue = paramValues[param.name];
                    if (param.options && param.options.multiple && !Array.isArray(currentValue)) {
                        paramValues[param.name] = currentValue === undefined ? [] : [currentValue];
                    } else if ((!param.options || !param.options.multiple) && Array.isArray(currentValue)) {
                        paramValues[param.name] = currentValue[0]; // undefined if length 0 which is what we want
                    }
                });
            }
            
            return paramValues;
        },
        
        /**
         * @ngdoc method
         * @name paramsByName
         * @methodOf ngMangoServices.maWatchList
         * 
         * @description Creates a map of parameter names to parameter objects
         * 
         * @returns {object} a map of parameter names to parameter objects
         */
        paramsByName() {
            return (this.params || []).reduce((map, p) => (map[p.name] = p, map), {});
        },
        
        /**
         * @ngdoc method
         * @name paramValuesFromState
         * @methodOf ngMangoServices.maWatchList
         * 
         * @description Updates parameter values for this watch list's parameters, populated from $stateParams
         * 
         * @param {object} [paramValues={}] Parameter values for this watch list
         * @returns {object} Updated parameter values
         */
        paramValuesFromState(paramValues = {}) {
            const stateParams = maUtil.decodedStateParams();
            const arrayParams = maUtil.createArrayParams(stateParams);
            
            const paramsByName = this.paramsByName();
            
            Object.keys(stateParams).forEach(stateParamName => {
                const param = paramsByName[stateParamName];
                if (param) {
                    const multiple = param.options && param.options.multiple;
                    paramValues[param.name] = multiple ? arrayParams[stateParamName] : stateParams[stateParamName];
                }
            });
            
            return paramValues;
        },
        
        /**
         * @ngdoc method
         * @name selectedTagKeys
         * @methodOf ngMangoServices.maWatchList
         * 
         * @description Returns an array of tag keys which have been selected for viewing on the watch list table.
         * Will contain 'device' and/or 'name' if the device name or point name columns were selected.
         * 
         * @returns {string[]} Selected tag keys
         */
        selectedTagKeys() {
            const selectedTags = this.data && Array.isArray(this.data.selectedTags) && this.data.selectedTags.slice() || [];
            const selectedColumns = this.data && Array.isArray(this.data.selectedColumns) && this.data.selectedColumns || ['deviceName', 'name'];

            if (!selectedTags.includes('device') && selectedColumns.includes('deviceName')) {
                selectedTags.push('device');
            }
            if (!selectedTags.includes('name') && selectedColumns.includes('name')) {
                selectedTags.push('name');
            }
            
            return selectedTags;
        },
        
        /**
         * @ngdoc method
         * @name nonStaticTags
         * @methodOf ngMangoServices.maWatchList
         * 
         * @description Returns an array of tag keys which have been selected for viewing on the watch list table and also
         * have differing values for the set of provided points.
         * 
         * @param {object[]} points Array of points to search for static tag values
         * @returns {string[]} Selected tag keys
         */
        nonStaticTags(points) {
            return this.selectedTagKeys().filter(tagKey => {
                let seenVal;
                return points.some((pt, i) => {
                    const tagVal = pt.getTag(tagKey);

                    if (i === 0) {
                        seenVal = tagVal;
                    } else if (tagVal !== seenVal) {
                        return true;
                    }
                });
            });
        },
        
        /**
         * @ngdoc method
         * @name updatePointConfigs
         * @methodOf ngMangoServices.maWatchList
         * 
         * @description Ensures that the data, chartConfig and selectedPoints exist and are in the latest format.
         */
        updatePointConfigs() {
            if (!this.data) this.data = {};
            if (!this.data.chartConfig) this.data.chartConfig = {};
            if (!this.data.chartConfig.selectedPoints) this.data.chartConfig.selectedPoints = [];

            // convert old object with point names as keys to array form
            if (!Array.isArray(this.data.chartConfig.selectedPoints)) {
                this.data.chartConfig.selectedPoints = Object.keys(this.data.chartConfig.selectedPoints).map(ptName => {
                    const config = this.data.chartConfig.selectedPoints[ptName];
                    config.name = ptName;
                    return config;
                });
            }
            
            // convert point config so it has tags property and add name to tags
            this.data.chartConfig.selectedPoints.forEach(config => {
                if (!config.tags) {
                    config.tags = {};
                    if (config.name) {
                        config.tags.name = config.name;
                    }
                    delete config.name;
                }
            });
        },

        pointConfigs() {
            return this.data.chartConfig.selectedPoints;
        },
        
        /**
         * @ngdoc method
         * @name findPointConfig
         * @methodOf ngMangoServices.maWatchList
         * 
         * @description Finds a matching config for a point based on a set of tag keys. The config will be removed
         * from the pointConfigs array if found.
         * 
         * @param {object} point Point to find config for
         * @param {string[]} Tag keys to match on
         * @param {object[]} Array of point configs to search in
         * @returns {object} Point config
         * 
         */
        findPointConfig(point, tagKeys, pointConfigs) {
            const configIndex = pointConfigs.findIndex(config => {
                return !Object.keys(config.tags).some(tagKey => {
                    return point.getTag(tagKey) !== config.tags[tagKey];
                });
            });
            
            if (configIndex >= 0) {
                return pointConfigs.splice(configIndex, 1)[0];
            }
        },
        
        /**
         * @ngdoc method
         * @name findSelectedPoints
         * @methodOf ngMangoServices.maWatchList
         * 
         * @description Searches through an array of points and returns a new array of the points which
         * are selected based on this watchlist's chart configuration. Each point will have a watchListConfig
         * property added to it to indicate which config was used.
         * 
         * @param {object[]} Array of points to search through
         * @returns {object[]} Array of points which match the watchlist's selected points config
         * 
         */
        findSelectedPoints(allPoints) {
            const points = allPoints.slice();
            const selectedPoints = [];
            const nonStaticTags = this.nonStaticTags(points);

            // first select all points with an explicit matching xid, remove the configs from the pool
            const pointConfigs = this.pointConfigs().filter(config => {
                if (config.xid) {
                    const pointIndex = points.findIndex(pt => pt.xid === config.xid);
                    if (pointIndex >= 0) {
                        const point = points.splice(pointIndex, 1)[0];
                        point.watchListConfig = config;
                        selectedPoints.push(point);
                        return false;
                    }
                }
                return true;
            });

            // now loop over the points and select the first matching point (by its tags) for each config
            points.forEach(point => {
                const config = this.findPointConfig(point, nonStaticTags, pointConfigs);
                if (config) {
                    point.watchListConfig = config;
                    selectedPoints.push(point);
                }
            });
            
            return selectedPoints;
        }
    });
    
    // TODO 
    /*
     * if (payload.object.xid) {
                    payload.object.originalId = payload.object.xid;
                }
     */
    
    Object.assign(WatchList.notificationManager, {
        webSocketUrl: '/rest/latest/websocket/watch-lists',
        supportsSubscribe: false
    });

    return WatchList;
}

export default WatchListFactory;


