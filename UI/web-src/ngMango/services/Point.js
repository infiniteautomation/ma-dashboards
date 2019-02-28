/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
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
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v2/data-points/:xid`
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
* A default action provided by $resource. Makes a http POST call to the rest endpoint `/rest/v2/data-points/:xid`
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
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v2/data-points/:xid`
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
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v2/data-points/:xid`
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
* Passed a string containing RQL for the query and returns an array of data point objects. Queries the endpoint `/rest/v2/data-points?:query`
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
* Query the REST endpoint `/rest/v2/data-points/by-id/:id` with the `GET` method.
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
* @returns {object} Returns promise object from $http.put at `/rest/v2/point-values/`
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
* @name Point#getTextRenderer
*
* @returns {object} Returns an TextRenderer object which can render values for binary or multistate points.
*     Call `render(value)` on the renderer to render the value.
*     A binary or multistate text renderer has a `values` property for accessing configured renderer mappings.
*/

import angular from 'angular';
import TextRenderer from './TextRenderer';
import {defaultProperties, defaultPropertiesForDataTypes} from './PointDefaults';

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
        '$templateCache', 'MA_ROLLUP_TYPES', 'MA_CHART_TYPES', 'MA_SIMPLIFY_TYPES'];
    function dataPointFactory($resource, $http, $timeout, Util, User, TemporaryRestResource, RqlBuilder, RestResource,
            $templateCache, MA_ROLLUP_TYPES, MA_CHART_TYPES, MA_SIMPLIFY_TYPES) {

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
        
        Object.assign(Point.notificationManager, {
            webSocketUrl: '/rest/v2/websocket/data-points'
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
            },
            
            dataTypes: Object.freeze([
                {key: 'BINARY', translation: 'common.dataTypes.binary'},
                {key: 'MULTISTATE', translation: 'common.dataTypes.multistate'},
                {key: 'NUMERIC', translation: 'common.dataTypes.numeric'},
                {key: 'ALPHANUMERIC', translation: 'common.dataTypes.alphanumeric'},
                {key: 'IMAGE', translation: 'common.dataTypes.image'}
            ]),
            
            loggingTypes: Object.freeze([
                {type: 'ON_CHANGE', translation: 'pointEdit.logging.type.change'},
                {type: 'ALL', translation: 'pointEdit.logging.type.all'},
                {type: 'NONE', translation: 'pointEdit.logging.type.never'},
                {type: 'INTERVAL', translation: 'pointEdit.logging.type.interval'},
                {type: 'ON_TS_CHANGE', translation: 'pointEdit.logging.type.tsChange'},
                {type: 'ON_CHANGE_INTERVAL', translation: 'pointEdit.logging.type.changeInterval'}
            ]),
            
            intervalLoggingValueTypes: Object.freeze([
                {type: 'INSTANT', translation: 'pointEdit.logging.valueType.instant'},
                {type: 'MAXIMUM', translation: 'pointEdit.logging.valueType.maximum'},
                {type: 'MINIMUM', translation: 'pointEdit.logging.valueType.minimum'},
                {type: 'AVERAGE', translation: 'pointEdit.logging.valueType.average'}
            ]),
            
            textRendererTypes: Object.freeze([
                {type: 'textRendererPlain', translation: 'textRenderer.plain', dataTypes: new Set(['BINARY', 'ALPHANUMERIC', 'MULTISTATE', 'NUMERIC']),
                    suffix: true},
                {type: 'textRendererAnalog', translation: 'textRenderer.analog', dataTypes: new Set(['NUMERIC']), suffix: true, format: true},
                {type: 'textRendererRange', translation: 'textRenderer.range', dataTypes: new Set(['NUMERIC']), format: true},
                {type: 'textRendererBinary', translation: 'textRenderer.binary', dataTypes: new Set(['BINARY'])},
                {type: 'textRendererNone', translation: 'textRenderer.none', dataTypes: new Set(['IMAGE'])},
                {type: 'textRendererTime', translation: 'textRenderer.time', dataTypes: new Set(['NUMERIC']), format: true},
                {type: 'textRendererMultistate', translation: 'textRenderer.multistate', dataTypes: new Set(['MULTISTATE'])}
            ]),

            chartRendererTypes: Object.freeze([
                {type: 'chartRendererNone', translation: 'chartRenderer.none',
                    dataTypes: new Set(['ALPHANUMERIC', 'BINARY', 'MULTISTATE', 'NUMERIC', 'IMAGE'])},
                {type: 'chartRendererImageFlipbook', translation: 'chartRenderer.flipbook', dataTypes: new Set(['IMAGE'])},
                {type: 'chartRendererTable', translation: 'chartRenderer.table', dataTypes: new Set(['ALPHANUMERIC', 'BINARY', 'MULTISTATE', 'NUMERIC'])},
                {type: 'chartRendererImage', translation: 'chartRenderer.image', dataTypes: new Set(['BINARY', 'MULTISTATE', 'NUMERIC'])},
                {type: 'chartRendererStats', translation: 'chartRenderer.statistics', dataTypes: new Set(['ALPHANUMERIC', 'BINARY', 'MULTISTATE', 'NUMERIC'])}
            ]),
            
            rollupTypes: MA_ROLLUP_TYPES,
            chartTypes: MA_CHART_TYPES,
            simplifyTypes: MA_SIMPLIFY_TYPES
        });
        
        Object.assign(Point.prototype, {
            forceRead() {
                const url = '/rest/v1/runtime-manager/force-refresh/' + encodeURIComponent(this.xid);
                return $http.put(url, null);
            },
        
            enable(enabled = true, restart = false) {
                const url = '/rest/v2/data-points/enable-disable/' + encodeURIComponent(this.xid);
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
            
            getTextRenderer() {
                if (this._textRenderer) {
                    return this._textRenderer;
                }
                return (this._textRenderer = TextRenderer.forPoint(this));
            },

            websocketHandler(payload) {
                if (payload.xid !== this.xid) return;
        
                // short circuit, reduce processing if we get the same payload multiple times as we do currently
                if (this.lastPayload === payload) return;
                this.lastPayload = payload;
                
                this.enabled = !!payload.enabled;
                if (payload.value != null) {
                    const rendered = this.getTextRenderer().render(payload.value.value);

                    this.value = payload.value.value;
                    this.time = payload.value.timestamp;
                    this.renderedColor = rendered.color;
                    
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
            },
            
            dataTypeChanged() {
                const dataTypeDefaults = defaultPropertiesForDataTypes[this.dataType];

                // we could try and keep some properties as per previous code in data point editor
                /*
                const rollupType = this.constructor.rollupTypes.find(t => t.type === this.rollup);
                if (!rollupType.dataTypes.has(this.dataType)) {
                    this.rollup = dataTypeDefaults.rollup;
                }
                
                const simplifyType = this.constructor.simplifyTypes.find(t => t.type === this.simplifyType);
                if (!simplifyType.dataTypes.has(this.dataType)) {
                    this.simplifyType = dataTypeDefaults.simplifyType;
                    this.simplifyTolerance = dataTypeDefaults.simplifyTolerance;
                    this.simplifyTarget = dataTypeDefaults.simplifyTarget;
                }

                const textRendererType = this.textRenderer && this.textRenderer.type;
                const textRendererTypeDef = this.constructor.textRendererTypes.find(t => t.type === textRendererType);
                if (!textRendererTypeDef || !textRendererTypeDef.dataTypes.has(this.dataType)) {
                    this.textRenderer = angular.copy(dataTypeDefaults.textRenderer);
                }
                
                const chartRendererType = this.chartRenderer && this.chartRenderer.type;
                const chartRendererTypeDef = this.constructor.chartRendererTypes.find(t => t.type === chartRendererType);
                if (!chartRendererTypeDef || !chartRendererTypeDef.dataTypes.has(this.dataType)) {
                    this.chartRenderer = angular.copy(dataTypeDefaults.chartRenderer);
                }
                
                this.loggingProperties = angular.copy(dataTypeDefaults.loggingProperties);
                */
                
                Object.assign(this, angular.copy(dataTypeDefaults));
            }
        });

        Object.defineProperty(Point.prototype, 'tagsString', {
            get() { return this.formatTags(); },
            set(value) { }
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
                if (!this.pointLocator) {
                    this.pointLocator = {};
                }
                return this.pointLocator.dataType;
            },
            set(value) {
                if (!this.pointLocator) {
                    this.pointLocator = {};
                }
                this.pointLocator.dataType = value;
                this.dataTypeChanged();
            }
        });

        return Point;
    }

}

export default dataPointProvider;