/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';
/**
* @ngdoc service
* @name maServices.Point
*
* @description
* Provides service for getting and and updating a list of points.
* - Used by <a ui-sref="dashboard.docs.maDashboards.maPointList">`<ma-point-list>`</a> and <a ui-sref="dashboard.docs.maDashboards.maFilteringPointList">`<ma-filtering-point-list>`</a> directives.
* - All methods return [$resource](https://docs.angularjs.org/api/ngResource/service/$resource) objects that can call the following methods availble to those objects:
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
* @methodOf maServices.Point
* @name Point#get
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v1/data-points/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data point object. Objects will be of the resource class and have resource actions availble to them.
*
*/

/**
* @ngdoc method
* @methodOf maServices.Point
* @name Point#save
*
* @description
* A default action provided by $resource. Makes a http POST call to the rest endpoint `/rest/v1/data-points/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data point object. Objects will be of the resource class and have resource actions availble to them.
*
*/

/**
* @ngdoc method
* @methodOf maServices.Point
* @name Point#remove
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/data-points/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data point object. Objects will be of the resource class and have resource actions availble to them.
*
*/

/**
* @ngdoc method
* @methodOf maServices.Point
* @name Point#delete
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/data-points/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data point object. Objects will be of the resource class and have resource actions availble to them.
*
*/


/**
* @ngdoc method
* @methodOf maServices.Point
* @name Point#query
*
* @description
* Passed an object in the format `{query: 'query', start: 0, limit: 50, sort: ['-xid']}` and returns an Array of point objects matching the query.
* @param {object} query xid name for the query. Format: `{query: 'query', start: 0, limit: 50, sort: ['-xid']}`
* @returns {array} Returns an Array of point objects matching the query. Objects will be of the resource class and have resource actions availble to them.
*
*/


/**
* @ngdoc method
* @methodOf maServices.Point
* @name Point#rql
*
* @description
* Passed a string containing RQL for the query and returns an array of data point objects. Queries the endpoint `/rest/v1/data-points?:query`
* @param {string} RQL RQL string for the query
* @returns {array} An array of data point objects. Objects will be of the resource class and have resource actions availble to them.
*
*/


/**
* @ngdoc method
* @methodOf maServices.Point
* @name Point#getById
*
* @description
* Query the REST endpoint `/rest/v1/data-points/by-id/:id` with the `GET` method.
* @param {object} query Object containing a `id` property which will be used in the query.
* @returns {object} Returns a data point object. Objects will be of the resource class and have resource actions availble to them.
*
*/


/**
* @ngdoc method
* @methodOf maServices.Point
* @name Point#objQuery
*
* @description
* Passed an object in the format `{query: 'query', start: 0, limit: 50, sort: ['-xid']}` and returns an Array of point objects matching the query.
* @param {object} query Format: `{query: 'query', start: 0, limit: 50, sort: ['-xid']}`
* @returns {array} Returns an Array of point objects matching the query. Objects will be of the resource class and have resource actions availble to them.
*
*/


/**
* @ngdoc method
* @methodOf maServices.Point
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
* @methodOf maServices.Point
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
* @methodOf maServices.Point
* @name Point#toggleValue
*
* @description
* When called this method will flip the value of a binary data point.
See <a ui-sref="dashboard.examples.settingPointValues.toggle">Toggle Binary</a> example.
*/

/**
* @ngdoc method
* @methodOf maServices.Point
* @name Point#valueFn
*
* @description
* This method will either call setValue internally or return the points value object.
See how it is used with `<md-checkbox>` and `<md-switch>` in the <a ui-sref="dashboard.examples.settingPointValues.toggle">Toggle Binary</a> example.
* @param {number=} setValue If provided setValue method will be called with this value.
* @returns {object} Returns a points value object if no parameter is provided when the method is called.
*/

/**
* @ngdoc method
* @methodOf maServices.Point
* @name Point#rendererMap
*
* @returns {object} Returns an object mapping textRenderer values for binary or multistate points. Returns null if the point does not have a textRenderer.
*/
/**
* @ngdoc method
* @methodOf maServices.Point
* @name Point#valueRenderer
*
* @description
* This method internally will call this.rendererMap(). It is passed a value and it returns the textRendered object stored at that value's key in the map.
* @param {number=} value Value used as the key in the rendererMap
* @returns {object} Returns textRendered object for the value from the rendererMap. If no rendererMap is found object returned is `{text: value}`
*/


/*
 * Provides service for getting list of points and create, update, delete
 */
function PointFactory($resource, $http, $timeout, Util) {
    var Point = $resource('/rest/v1/data-points/:xid', {
    		xid: '@xid'
    	}, {
        query: {
            method: 'GET',
            isArray: true,
            transformResponse: Util.transformArrayResponse,
            interceptor: {
                response: Util.arrayResponseInterceptor
            },
            withCredentials: true,
            cache: true
        },
        rql: {
        	url: '/rest/v1/data-points?:query',
            method: 'GET',
            isArray: true,
            transformResponse: Util.transformArrayResponse,
            interceptor: {
                response: Util.arrayResponseInterceptor
            },
            withCredentials: true,
            cache: true
        },
        getById: {
            url: '/rest/v1/data-points/by-id/:id',
            method: 'GET',
            isArray: false,
            withCredentials: true,
            cache: true
        }
    });

    Point.objQuery = function(options) {
        if (!options) return this.query();
        if (typeof options.query === 'string') {
            return this.rql({query: options.query});
        }

        var params = [];
        if (options.query) {
            var and = !!options.query.$and;
            var exact = !!options.query.$exact;
            delete options.query.$exact;
            delete options.query.$and;

            var parts = [];
            for (var key in options.query) {
                var val = options.query[key] || '';
                var comparison = '=';
                var autoLike = false;
                if (val.indexOf('=') < 0 && !exact) {
                    comparison += 'like=*';
                    autoLike = true;
                }
                parts.push(key + comparison + val + (autoLike ? '*': ''));
            }

            var queryPart;
            if (and || parts.length === 1) {
                queryPart = parts.join('&');
            } else {
                queryPart = 'or(' + parts.join(',') + ')';
            }
            params.push(queryPart);
        }

        if (options.sort) {
            var sort = options.sort;
            if (angular.isArray(sort)) {
                sort = sort.join(',');
            }
            params.push('sort(' + sort + ')');
        }

        if (options.limit) {
            var start = options.start || 0;
            params.push('limit(' + options.limit + ',' + start + ')');
        }

        return params.length ? this.rql({query: params.join('&')}) : this.query();
    };

    Point.prototype.setValue = function setValue(value, options) {
    	options = options || {};

    	var dataType = this.pointLocator.dataType;
    	if (!value.value) {
    		if (dataType === 'NUMERIC') {
    			value = Number(value);
    		} else if (dataType === 'MULTISTATE') {
    			if (/^\d+$/.test(value)) {
    				value = parseInt(value, 10);
    			}
    		}
    		value = {
    		    value: value,
    		    dataType: dataType
    		};
    	}

    	var url = '/rest/v1/point-values/' + encodeURIComponent(this.xid);
    	return $http.put(url, value, {
    		params: {
    			'unitConversion': options.converted
    		}
    	});
    };

    Point.prototype.setValueResult = function(value, holdTimeout) {
        holdTimeout = holdTimeout || 3000;
        var result = {
            pending: true
        };
        this.setValue(value).then(function() {
            delete result.pending;
            result.success = true;
            $timeout(function() {
                delete result.success;
            }, holdTimeout);
        }, function(data) {
            delete result.pending;
            result.error = data;
            $timeout(function() {
                delete result.error;
            }, holdTimeout);
        });
        return result;
    };

    Point.prototype.toggleValue = function toggleValue() {
    	var dataType = this.pointLocator.dataType;
    	if (dataType === 'BINARY' && this.value !== undefined) {
    		this.setValue(!this.value);
		}
    };

    Point.prototype.valueFn = function(setValue) {
    	if (setValue === undefined) return this.value;
    	this.setValue(setValue);
    };

    Point.prototype.rendererMap = function() {
    	if (this._rendererMap) return this._rendererMap;
    	var textRenderer = this.textRenderer;
    	if (!textRenderer) return;

    	if (textRenderer.multistateValues) {
    		this._rendererMap = {};
    		var multistateValues = textRenderer.multistateValues;
    		for (var i = 0; i < multistateValues.length; i++) {
    			var item = multistateValues[i];
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
    };

    Point.prototype.valueRenderer = function(value) {
    	var rendererMap = this.rendererMap();
    	if (rendererMap) {
    	    var obj = rendererMap[value];
    	    if (obj) return obj;
    	}
    	return {text: value};
    };

    return Point;
}

PointFactory.$inject = ['$resource', '$http', '$timeout', 'Util'];
return PointFactory;

}); // define
