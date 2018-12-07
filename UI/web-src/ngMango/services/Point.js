/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
* @ngdoc service
* @name ngMangoServices.maPoint
*
* @description
* Provides service for getting and and updating a list of points.
* - Used by <a ui-sref="ui.docs.ngMango.maPointList">`<ma-point-list>`</a> and
*   <a ui-sref="ui.docs.ngMango.maFilteringPointList">`<ma-filtering-point-list>`</a> directives.
* - All methods return [$resource](https://docs.angularjs.org/api/ngResource/service/$resource) objects that can call the following
*   methods available to those objects:
*   - `$save`
*   - `$remove`
*   - `$delete`
*   - `$get`
*
* # Usage
*
* <pre prettyprint-mode="javascript">
*  Point.rql({query: 'limit(1)'}).$promise.then(function(item) {
    $scope.ngModel = item[0];
});
* </pre>
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#get
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v1/data-points/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data point object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#save
*
* @description
* A default action provided by $resource. Makes a http POST call to the rest endpoint `/rest/v1/data-points/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data point object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#remove
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/data-points/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data point object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#delete
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/data-points/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data point object. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#query
*
* @description
* Passed an object in the format `{query: 'query', start: 0, limit: 50, sort: ['-xid']}` and returns an Array of point objects matching the query.
* @param {object} query xid name for the query. Format: `{query: 'query', start: 0, limit: 50, sort: ['-xid']}`
* @returns {array} Returns an Array of point objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#rql
*
* @description
* Passed a string containing RQL for the query and returns an array of data point objects. Queries the endpoint `/rest/v1/data-points?:query`
* @param {string} RQL RQL string for the query
* @returns {array} An array of data point objects. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#getById
*
* @description
* Query the REST endpoint `/rest/v1/data-points/by-id/:id` with the `GET` method.
* @param {object} query Object containing a `id` property which will be used in the query.
* @returns {object} Returns a data point object. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#objQuery
*
* @description
* Passed an object in the format `{query: 'query', start: 0, limit: 50, sort: ['-xid']}` and returns an Array of point objects matching the query.
* @param {object} query Format: `{query: 'query', start: 0, limit: 50, sort: ['-xid']}`
* @returns {array} Returns an Array of point objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#setValue
*
* @description
* Method for setting the value of a settable data point.
* @param {number} value New value to set on the data point.
* @param {object=} options Optional object for setting converted property.
* @returns {object} Returns promise object from $http.put at `/rest/v1/point-values/`
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#setValueResult
*
* @description
* Method calls setValue but provides handling of the promise and returns a result object.
Used by `<set-point-value>` directive.
* @param {number} value New value to set on the data point.
* @param {number=} holdTimeout Optional timeout value, defaults to 3000.
* @returns {object} Returns `result` object with `pending`, `success`, and error `properties`
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#toggleValue
*
* @description
* When called this method will flip the value of a binary data point.
See <a ui-sref="ui.examples.settingPointValues.toggle">Toggle Binary</a> example.
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#valueFn
*
* @description
* This method will either call setValue internally or return the points value object.
See how it is used with `<md-checkbox>` and `<md-switch>` in the <a ui-sref="ui.examples.settingPointValues.toggle">Toggle Binary</a> example.
* @param {number=} setValue If provided setValue method will be called with this value.
* @returns {object} Returns a points value object if no parameter is provided when the method is called.
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#rendererMap
*
* @returns {object} Returns an object mapping textRenderer values for binary or multistate points. Returns null if the point does not have a textRenderer.
*/
/**
* @ngdoc method
* @methodOf ngMangoServices.maPoint
* @name Point#valueRenderer
*
* @description
* This method internally will call this.rendererMap(). It is passed a value and it returns the textRendered object stored at that value's key in the map.
* @param {number=} value Value used as the key in the rendererMap
* @returns {object} Returns textRendered object for the value from the rendererMap. If no rendererMap is found object returned is `{text: value}`
*/


dataPointProvider.$inject = [];
function dataPointProvider() {
    
    const types = [];
    
    this.registerType = function(type) {
        const existing = types.find(t => t.type === type.type);
        if (existing) {
            console.error('Tried to register data point type twice', type);
            return;
        }
        types.push(type);
    };

    this.$get = dataPointFactory;

    /*
     * Provides service for getting list of points and create, update, delete
     */
    dataPointFactory.$inject = ['$resource', '$http', '$timeout', 'maUtil', 'maUser', 'maTemporaryRestResource', 'maRqlBuilder', 'maRestResource',
        '$templateCache'];
    function dataPointFactory($resource, $http, $timeout, Util, User, TemporaryRestResource, RqlBuilder, RestResource,
            $templateCache) {

        const typesByName = Object.create(null);
        types.forEach(type => {
            typesByName[type.type] = type;
            
            // put the templates in the template cache so we can ng-include them
            if (type.template && !type.templateUrl) {
                type.templateUrl = `dataPointEditor.${type.type}.html`;
                $templateCache.put(type.templateUrl, type.template);
            }
        });
        
        const realtimeUrl = '/rest/v2/realtime';
    
        class BulkDataPointTemporaryResource extends TemporaryRestResource {
            static get baseUrl() {
                return '/rest/v2/data-points/bulk';
            }
            static get resourceType() {
                return 'BULK_DATA_POINT';
            }
        }
    
        const defaultProperties = {
            xid: '',
            name: '',
            enabled: true,
            deviceName: '',
            readPermission: 'user',
            setPermission: '',
            pointFolderId: 0,
            purgeOverride: false,
            unit: '',
            useIntegralUnit: false,
            useRenderedUnit: false,
            pointLocator: {
                max: 100.0,
                min: 0.0,
                maxChange: 0.1,
                startValue: '50',
                modelType: 'PL.VIRTUAL',
                dataType: 'NUMERIC',
                settable: true,
                changeType: 'BROWNIAN'
            },
            chartColour: '',
            plotType: 'STEP',
            loggingProperties: {
                loggingType: 'ALL',
                tolerance: 0.0,
                discardExtremeValues: false,
                overrideIntervalLoggingSamples: false,
                cacheSize: 1
            },
            textRenderer: {
                useUnitAsSuffix: false,
                unit: '',
                renderedUnit: '',
                format: '#.00',
                suffix: '',
                type: 'textRendererAnalog'
            },
            chartRenderer: null,
            rollup: 'AVERAGE',
            simplifyType: 'TARGET',
            simplifyTolerance: 'NaN',
            simplifyTarget: 1000,
            templateXid: null,
            dataSourceXid: '',
            tags: {}
        };
        
        class DataPointRestResource extends RestResource {
            static get baseUrl() {
                return '/rest/v2/data-points';
            }
            
            static get defaultProperties() {
                return defaultProperties;
            }
            
            static pointsForWatchList(xid, opts = {}) {
                return this.http({
                    url: `/rest/v1/watch-lists/${encodeURIComponent(xid)}/data-points`,
                    method: 'GET'
                }, opts).then(response => {
                    if (opts.responseType != null) {
                        return response.data;
                    }
                    
                    const items = response.data.items.map(item => {
                        return new this(item);
                    });
                    items.$total = response.data.total;
                    return items;
                });
            }
        }
    
        const Point = $resource('/rest/v2/data-points/:xid', {
                xid: data => data && (data.originalId || data.xid)
        	}, {
            query: {
                method: 'GET',
                isArray: true,
                transformResponse: Util.transformArrayResponse,
                interceptor: {
                    response: Util.arrayResponseInterceptor
                }
            },
            rql: {
            	url: '/rest/v2/data-points?:query',
                method: 'GET',
                isArray: true,
                transformResponse: Util.transformArrayResponse,
                interceptor: {
                    response: Util.arrayResponseInterceptor
                }
            },
            getById: {
                url: '/rest/v2/data-points/by-id/:id',
                method: 'GET',
                isArray: false
            },
            save: {
                method: 'POST',
                url: '/rest/v2/data-points',
                params: {
                    xid: null
                }
            },
            update: {
                method: 'PUT'
            }
        }, {
            defaultProperties,
            xidPrefix: 'DP_',
            cancellable: true
        });
        
        Object.assign(Point, {
            buildRealtimeQuery() {
                const builder = new RqlBuilder();
                builder.queryFunction = (queryObj, opts) => {
                    return this.realtimeQuery(queryObj, opts);
                };
                return builder;
            },
    
            realtimeQuery(queryObject, opts = {}) {
                const params = {};
                
                if (queryObject) {
                    const rqlQuery = queryObject.toString();
                    if (rqlQuery) {
                        params.rqlQuery = rqlQuery;
                    }
                }
                
                return $http({
                    url: realtimeUrl,
                    method: 'GET',
                    params: params
                }).then(response => {
                    const items = response.data.items.map(item => {
                        return new this(item);
                    });
                    items.$total = response.data.total;
                    return items;
                });
            },
            
            bulk: BulkDataPointTemporaryResource,
            restResource: DataPointRestResource,

            get types() {
                return Object.freeze(types);
            },
            
            get typesByName() {
                return Object.freeze(typesByName);
            }
        });
        
        Object.assign(Point.prototype, {
            forceRead() {
                const url = '/rest/v1/runtime-manager/force-refresh/' + encodeURIComponent(this.xid);
                return $http.put(url, null);
            },
        
            enable(enabled = true, restart = false) {
                const url = '/rest/v1/data-points/enable-disable/' + encodeURIComponent(this.xid);
                return $http({
                    url,
                    method: 'PUT',
                    params: {
                        enabled: !!enabled,
                        restart
                    }
                }).then(() => {
                    this.enabled = enabled;
                });
            },
    
            restart() {
                return this.enable(true, true);
            },
            
            setValue(value, options) {
            	options = options || {};
            	
            	const dataType = this.pointLocator.dataType;
            	let unitConversion = false;
            	
            	if (!value.value) {
            		if (dataType === 'NUMERIC') {
            			value = Number(value);
            			unitConversion = true;
            		} else if (dataType === 'MULTISTATE') {
            			if (/^\d+$/.test(value)) {
            				value = parseInt(value, 10);
            			}
            		}
            		value = {
            		    value: value,
            		    dataType: dataType,
                        annotation: 'Set from web by user: ' + User.current.username
            		};
            	}
        
            	const url = '/rest/v1/point-values/' + encodeURIComponent(this.xid) + '?unitConversion=' + !!unitConversion;
            	return $http.put(url, value, {
            		params: {
            			'unitConversion': options.converted
            		}
            	});
            },
        
            setValueResult(value, holdTimeout = 3000) {
                return this.promiseResult(() => this.setValue(value), holdTimeout);
            },
        
            relinquish() {
                const xid = encodeURIComponent(this.xid);
                return $http({
                    url: `/rest/v1/runtime-manager/relinquish/${xid}`,
                    method: 'POST',
                    
                });
            },
            
            relinquishResult(holdTimeout = 3000) {
                return this.promiseResult(() => this.relinquish(), holdTimeout);
            },
            
            promiseResult(action, holdTimeout) {
                const result = {
                    pending: true
                };
                
                action().then(data => {
                    delete result.pending;
                    result.success = true;
                    result.data = data;
                    
                    $timeout(() => {
                        delete result.success;
                    }, holdTimeout);
                }, data => {
                    delete result.pending;
                    result.error = data;
                    result.data = data;
                    
                    $timeout(() => {
                        delete result.error;
                    }, holdTimeout);
                });
                
                return result;
            },
        
            toggleValue() {
            	const dataType = this.pointLocator.dataType;
            	if (dataType === 'BINARY' && this.value !== undefined) {
            		this.setValue(!this.value);
        		}
            },
        
            valueFn(setValue) {
            	if (setValue === undefined) return this.value;
            	this.setValue(setValue);
            },
    
            rendererMap() {
            	if (this._rendererMap) return this._rendererMap;
            	const textRenderer = this.textRenderer;
            	if (!textRenderer) return;
        
            	if (textRenderer.multistateValues) {
            		this._rendererMap = {};
            		const multistateValues = textRenderer.multistateValues;
            		for (let i = 0; i < multistateValues.length; i++) {
            			const item = multistateValues[i];
            			item.color = item.colour;
            			this._rendererMap[item.key] = item;
            		}
            	} else if (textRenderer.type === 'textRendererBinary') {
            		this._rendererMap = {
            			'true': {
            			    key: true,
            				color: textRenderer.oneColour,
            				text: textRenderer.oneLabel
            			},
            			'false': {
            			    key: false,
            				color: textRenderer.zeroColour,
            				text: textRenderer.zeroLabel
            			}
            		};
            	}
        
            	return this._rendererMap;
            },
        
            valueRenderer(value, renderedValue) {
            	const rendererMap = this.rendererMap();
            	if (rendererMap) {
            	    const obj = rendererMap[value];
            	    if (obj) return obj;
            	} else if (this.textRenderer && this.textRenderer.type === 'textRendererRange' && Array.isArray(this.textRenderer.rangeValues)) {
            	    const range = this.textRenderer.rangeValues.find(range => value >= range.from && value < range.to);
            	    if (range) {
            	        return {
            	            text: renderedValue,
            	            color: range.colour
            	        };
            	    }
            	}
            	return {text: renderedValue};
            },
            
            websocketHandler(payload) {
                if (payload.xid !== this.xid) return;
        
                // short circuit, reduce processing if we get the same payload multiple times as we do currently
                if (this.lastPayload === payload) return;
                this.lastPayload = payload;
                
                this.enabled = !!payload.enabled;
                if (payload.value != null) {
                    const valueRenderer = this.valueRenderer(payload.value.value);
                    const color = valueRenderer ? valueRenderer.color : null;
        
                    this.value = payload.value.value;
                    this.time = payload.value.timestamp;
                    this.renderedColor = color;
                    
                    this.convertedValue = payload.convertedValue;
                    this.renderedValue = payload.renderedValue;
                }
                
                if (payload.attributes) {
                    this.unreliable = !!payload.attributes.UNRELIABLE;
                } else {
                    this.unreliable = false;
                }
            },
        
            amChartsGraphType() {
                if (!this.plotType) return null;
                
                const type = this.plotType.toLowerCase();
                // change mango plotType to amCharts graphType
                // step and line are equivalent
                switch(type) {
                case 'spline': return 'smoothedLine';
                case 'bar': return 'column';
                default: return type;
                }
            },
    
            getTags() {
                const tags = Object.assign({}, this.tags);
                if (!tags.hasOwnProperty('device') && this.deviceName) {
                    tags.device = this.deviceName;
                }
                if (!tags.hasOwnProperty('name') && this.name) {
                    tags.name = this.name;
                }
                return tags;
            },
            
            getTag(tagKey) {
                if (tagKey === 'device') {
                    return this.deviceName;
                }
                if (tagKey === 'name') {
                    return this.name;
                }
                if (this.tags && this.tags.hasOwnProperty(tagKey)) {
                    return this.tags[tagKey];
                }
            },
        
            hasTags() {
                return !!Object.keys(this.tags || {}).length;
            },
            
            formatTags(includeDeviceAndName = false) {
                const tags = includeDeviceAndName ? this.getTags() : (this.tags || {});
                return Object.keys(tags).map(key => {
                    return `${key}=${tags[key]}`;
                }).join(', ');
            },
            
            formatLabel(includeTags = true, includeDeviceAndName = false) {
                let label = `${this.deviceName} \u2014 ${this.name}`;
                if (includeTags && this.hasTags()) {
                    label += ` [${this.formatTags(includeDeviceAndName)}]`;
                }
                return label;
            }
        });
    
        Object.defineProperty(Point.prototype, 'isEnabled', {
            get() { return this.enabled; },
            set(value) { this.enable(value); }
        });
        
        Object.defineProperty(Point.prototype, 'valueGetterSetter', {
            get() { return this.value; },
            set(value) { this.setValue(value); }
        });
        
        Object.defineProperty(Point.prototype, 'dataType', {
            get() {
                if (this.pointLocator) {
                    return this.pointLocator.dataType;
                }
            },
            set(value) {
                if (this.pointLocator) {
                    this.pointLocator.dataType = value;
                }
            }
        });
        
        return Point;
    }

}

export default dataPointProvider;