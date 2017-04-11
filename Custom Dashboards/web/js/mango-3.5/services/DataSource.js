/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';


/**
* @ngdoc service
* @name maServices.DataSource
*
* @description
* Provides a service for getting list of data sources from the Mango system.
* - Used by <a ui-sref="dashboard.docs.maDashboards.maDataSourceList">`<ma-data-source-list>`</a> and <a ui-sref="dashboard.docs.maDashboards.maDataSourceQuery">`<ma-data-source-query>`</a> directives.
* - All methods return [$resource](https://docs.angularjs.org/api/ngResource/service/$resource) objects that can call the following methods availble to those objects:
*   - `$save`
*   - `$remove`
*   - `$delete`
*   - `$get`
*
* # Usage
*
* <pre prettyprint-mode="javascript">
*  var DS = DataSource.getById(xid)
*  DS.name = 'New Name';
*  DS.$save();
* </pre>
*
* You can also access the raw `$http` promise via the `$promise` property on the object returned:
* <pre prettyprint-mode="javascript">
* promise = DataSource.objQuery(value).$promise;
* promise.then(function(dataSources) {
*    $scope.dataSources = dataSources;
*
*    console.log('Data Sources retunrned from server:', dataSources);
* }
* </pre>
*
* Or just assign the return value from a DataSource method to a scope variable:
* <pre prettyprint-mode="javascript">
* $scope.dataSources = DataSource.objQuery(value);
* </pre>
*/


/**
* @ngdoc method
* @methodOf maServices.DataSource
* @name DataSource#get
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v1/data-sources/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data source object. Objects will be of the resource class and have resource actions availble to them.
*
*/

/**
* @ngdoc method
* @methodOf maServices.DataSource
* @name DataSource#save
*
* @description
* A default action provided by $resource. Makes a http POST call to the rest endpoint `/rest/v1/data-sources/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data source object. Objects will be of the resource class and have resource actions availble to them.
*
*/

/**
* @ngdoc method
* @methodOf maServices.DataSource
* @name DataSource#remove
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/data-sources/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data source object. Objects will be of the resource class and have resource actions availble to them.
*
*/

/**
* @ngdoc method
* @methodOf maServices.DataSource
* @name DataSource#delete
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/data-sources/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data source object. Objects will be of the resource class and have resource actions availble to them.
*
*/


/**
* @ngdoc method
* @methodOf maServices.DataSource
* @name DataSource#query
*
* @description
* Passed an object in the format `{query: 'query', start: 0, limit: 50, sort: ['-xid']}` and returns an Array of datasource objects matching the query.
* @param {object} query xid name for the query. Format: `{query: 'query', start: 0, limit: 50, sort: ['-xid']}`
* @returns {array} Returns an Array of datasource objects matching the query. Objects will be of the resource class and have resource actions availble to them.
*
*/


/**
* @ngdoc method
* @methodOf maServices.DataSource
* @name DataSource#rql
*
* @description
* Passed a string containing RQL for the query and returns an array of data source objects.
* @param {string} RQL RQL string for the query
* @returns {array} An array of data source objects. Objects will be of the resource class and have resource actions availble to them.
*
*/


/**
* @ngdoc method
* @methodOf maServices.DataSource
* @name DataSource#getById
*
* @description
* Query the REST endpoint `/rest/v1/data-sources/by-id/:id` with the `GET` method.
* @param {object} query Object containing a `id` property which will be used in the query.
* @returns {object} Returns a data source object. Objects will be of the resource class and have resource actions availble to them.
*
*/


/**
* @ngdoc method
* @methodOf maServices.DataSource
* @name DataSource#objQuery
*
* @description
* Passed an object in the format `{query: 'query', start: 0, limit: 50, sort: ['-xid']}` and returns an Array of datasource objects matching the query.
* @param {object} query Format: `{query: 'query', start: 0, limit: 50, sort: ['-xid']}`
* @returns {array} Returns an Array of datasource objects matching the query. Objects will be of the resource class and have resource actions availble to them.
*
*/



function DataSourceFactory($resource, Util) {
    var DataSource = $resource('/rest/v1/data-sources/:xid', {
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
        	url: '/rest/v1/data-sources?:query',
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
            url: '/rest/v1/data-sources/by-id/:id',
            method: 'GET',
            isArray: false,
            withCredentials: true,
            cache: true
        }
    });

    DataSource.objQuery = function(options) {
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

    return DataSource;
}

DataSourceFactory.$inject = ['$resource', 'Util'];
return DataSourceFactory;

}); // define
