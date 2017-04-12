/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

/**
* @ngdoc service
* @name ngMangoServices.JsonStore
*
* @description
* Provides a service for reading and writing to the JsonStore within the Mango Database.
* - Used by <a ui-sref="ui.docs.ngMango.maJsonStore">`<ma-json-store>`</a> directive.
* - All methods return [$resource](https://docs.angularjs.org/api/ngResource/service/$resource) objects that can call the following methods available to those objects:
*   - `$save`
*   - `$remove`
*   - `$delete`
*   - `$get`
*
* # Usage
*
* <pre prettyprint-mode="javascript">
*  JsonStore.get({xid: newXid}).$promise.then(function(item) {
*		return item;
*  }, function() {
*		var item = new JsonStore();
*		item.xid = newXid;
*		item.name = newXid;
*		item.jsonData = $scope.value || {};
*		angular.extend(item, $scope.item);
*		return $q.when(item);
*  }).then(function(item) {
*		$scope.item = item;
*  });
* </pre>
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.JsonStore
* @name JsonStore#get
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v1/json-data/:xid/:dataPath`
* @param {string} xid Used to set the id of the node in the json store.
* @param {string} dataPath dataPath of the object in the json store.
* @param {string} name name of the object in the json store.
* @param {string} readPermission readPermission of the object in the json store.
* @param {string} editPermission editPermission of the object in the json store.
* @returns {object} Returns a json store object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.JsonStore
* @name JsonStore#save
*
* @description
* A default action provided by $resource. Makes a http POST call to the rest endpoint `/rest/v1/json-data/:xid/:dataPath`
* @param {string} xid Used to set the id of the node in the json store.
* @param {string} dataPath dataPath of the object in the json store.
* @param {string} name name of the object in the json store.
* @param {string} readPermission readPermission of the object in the json store.
* @param {string} editPermission editPermission of the object in the json store.
* @returns {object} Returns a json store object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.JsonStore
* @name JsonStore#remove
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/json-data/:xid/:dataPath`
* @param {string} xid Used to set the id of the node in the json store.
* @param {string} dataPath dataPath of the object in the json store.
* @param {string} name name of the object in the json store.
* @param {string} readPermission readPermission of the object in the json store.
* @param {string} editPermission editPermission of the object in the json store.
* @returns {object} Returns a json store object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.JsonStore
* @name JsonStore#delete
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/json-data/:xid/:dataPath`
* @param {string} xid Used to set the id of the node in the json store.
* @param {string} dataPath dataPath of the object in the json store.
* @param {string} name name of the object in the json store.
* @param {string} readPermission readPermission of the object in the json store.
* @param {string} editPermission editPermission of the object in the json store.
* @returns {object} Returns a json store object. Objects will be of the resource class and have resource actions available to them.
*
*/
function JsonStoreFactory($resource, Util) {

    function setDataPathInterceptor(data) {
        var urlParts = data.config.url.split('/');
        data.resource.dataPath = urlParts.length >= 6 ? urlParts[5] : null;
        return data.resource;
    }

    var JsonStore = $resource('/rest/v1/json-data/:xid/:dataPath', {
    	xid: '@xid',
    	dataPath: '@dataPath',
        name: '@name',
        readPermission: '@readPermission',
        editPermission: '@editPermission',
        publicData: '@publicData'
    }, {
    	get: {
    	    interceptor: {
                response: setDataPathInterceptor
            }
    	},
        save: {
            method: 'POST',
            interceptor: {
                response: setDataPathInterceptor
            },
            transformRequest: function(data, headersGetter) {
            	return angular.toJson(data.jsonData);
            }
        },
        'delete': {
        	method: 'DELETE',
            interceptor: {
                response: setDataPathInterceptor
            },
        	transformResponse: function(data, headersGetter, status) {
        	    if (data && status < 400) {
        	        var item = angular.fromJson(data);
                    item.jsonData = null;
                    return item;
        	    }
            }
        },
        getPublic: {
            method: 'GET',
            url: '/rest/v1/json-data/public/:xid/:dataPath',
            interceptor: {
                response: setDataPathInterceptor
            }
        }
    });
    
    JsonStore.objQuery = Util.objQuery;

    return JsonStore;
}

JsonStoreFactory.$inject = ['$resource', 'Util'];
return JsonStoreFactory;

}); // define
