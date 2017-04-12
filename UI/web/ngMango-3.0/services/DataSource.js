/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';


/**
* @ngdoc service
* @name ngMangoServices.DataSource
*
* @description
* Provides a service for getting list of data sources from the Mango system.
* - Used by <a ui-sref="dashboard.docs.ngMango.maDataSourceList">`<ma-data-source-list>`</a> and <a ui-sref="dashboard.docs.ngMango.maDataSourceQuery">`<ma-data-source-query>`</a> directives.
* - All methods return [$resource](https://docs.angularjs.org/api/ngResource/service/$resource) objects that can call the following methods available to those objects:
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
* @methodOf ngMangoServices.DataSource
* @name DataSource#get
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v1/data-sources/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data source object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.DataSource
* @name DataSource#save
*
* @description
* A default action provided by $resource. Makes a http POST call to the rest endpoint `/rest/v1/data-sources/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data source object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.DataSource
* @name DataSource#remove
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/data-sources/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data source object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.DataSource
* @name DataSource#delete
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/data-sources/:xid`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a data source object. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.DataSource
* @name DataSource#query
*
* @description
* Passed an object in the format `{query: 'query', start: 0, limit: 50, sort: ['-xid']}` and returns an Array of datasource objects matching the query.
* @param {object} query xid name for the query. Format: `{query: 'query', start: 0, limit: 50, sort: ['-xid']}`
* @returns {array} Returns an Array of datasource objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.DataSource
* @name DataSource#rql
*
* @description
* Passed a string containing RQL for the query and returns an array of data source objects.
* @param {string} RQL RQL string for the query
* @returns {array} An array of data source objects. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.DataSource
* @name DataSource#getById
*
* @description
* Query the REST endpoint `/rest/v1/data-sources/by-id/:id` with the `GET` method.
* @param {object} query Object containing a `id` property which will be used in the query.
* @returns {object} Returns a data source object. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.DataSource
* @name DataSource#objQuery
*
* @description
* Passed an object in the format `{query: 'query', start: 0, limit: 50, sort: ['-xid']}` and returns an Array of datasource objects matching the query.
* @param {object} query Format: `{query: 'query', start: 0, limit: 50, sort: ['-xid']}`
* @returns {array} Returns an Array of datasource objects matching the query. Objects will be of the resource class and have resource actions available to them.
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

    DataSource.objQuery = Util.objQuery;

    return DataSource;
}

DataSourceFactory.$inject = ['$resource', 'Util'];
return DataSourceFactory;

}); // define
