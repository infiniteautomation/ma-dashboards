/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';


/**
* @ngdoc service
* @name ngMangoServices.maJsonStore
*
* @description
* Provides a service for reading and writing to the JsonStore within the Mango Database.
* - Used by <a ui-sref="ui.docs.ngMango.maJsonStore">`<ma-json-store>`</a> directive.
* - All methods return [$resource](https://docs.angularjs.org/api/ngResource/service/$resource) objects that can call the
*   following methods available to those objects:
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
*		const item = new JsonStore();
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
* @methodOf ngMangoServices.maJsonStore
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
* @methodOf ngMangoServices.maJsonStore
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
* @methodOf ngMangoServices.maJsonStore
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
* @methodOf ngMangoServices.maJsonStore
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
JsonStoreFactory.$inject = ['$resource', 'maUtil', 'maNotificationManager', '$q'];
function JsonStoreFactory($resource, Util, NotificationManager, $q) {
    const jsonStoreUrl = '/rest/v1/json-data/';
    
    const defaultProperties = {
        name: 'New JSON store item',
        readPermission: 'user',
        editPermission: '',
        publicData: false,
        jsonData: {},
        dataPath: []
    };
    
    function setDataPathInterceptor(data) {
        const urlParts = data.config.url.split('/');
        const lastPart = decodeURIComponent(urlParts[urlParts.length - 1]);
        
        if (lastPart !== data.data.xid) {
            data.resource.dataPath = lastPart.split('.');
        } else {
            data.resource.dataPath = [];
        }

        const xid = data.resource.xid;
        if (xid) {
            data.resource.originalId = xid;
        }
        
        return data.resource;
    }

    const JsonStore = $resource(jsonStoreUrl + ':xid/:dataPathStr', {
        xid: data => data && (data.originalId || data.xid),
    	dataPathStr: '@dataPathStr',
        name: '@name',
        readPermission: '@readPermission',
        editPermission: '@editPermission',
        publicData: '@publicData'
    }, {
        query: {
            method: 'GET',
            isArray: true,
            interceptor: {
                response: (data) => {
                    return data.resource.map(xid => {
                        return new JsonStore({xid});
                    });
                }
            }
        },
    	get: {
    	    interceptor: {
                response: setDataPathInterceptor
            },
            params: {
                name: null,
                readPermission: null,
                editPermission: null,
                publicData: null
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
        update: {
            method: 'PUT',
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
        	        const item = angular.fromJson(data);
                    item.jsonData = null;
                    return item;
        	    }
            },
            params: {
                name: null,
                readPermission: null,
                editPermission: null,
                publicData: null
            }
        },
        getPublic: {
            method: 'GET',
            url: jsonStoreUrl + 'public/:xid/:dataPathStr',
            interceptor: {
                response: setDataPathInterceptor
            }
        }
    }, {
        defaultProperties,
        cancellable: true
    });
    
    Object.defineProperty(JsonStore.prototype, 'dataPathStr', {
        get: function() {
            if (!this.dataPath) return '';
            return this.dataPath.join('.');
        }
    });

    Object.assign(JsonStore.notificationManager, {
        webSocketUrl: '/rest/v2/websocket/json-data',
        supportsSubscribe: true
    });

    return JsonStore;
}

export default JsonStoreFactory;


