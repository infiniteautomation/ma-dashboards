/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

function JsonStoreFactory($resource, Util) {

    var JsonStore = $resource('/rest/v1/json-data/:xid', {
    	xid: '@xid',
        name: '@name',
        readPermission: '@readPermission',
        editPermission: '@editPermission'
    }, {
    	save: {
            method: 'POST',
            transformRequest: function(data, headersGetter) {
            	return angular.toJson(data.jsonData);
            }
        },
        'delete': {
        	method: 'DELETE',
        	transformResponse: function(data, headersGetter) {
            	var item = angular.fromJson(data);
            	item.jsonData = {};
            	return item;
            }
        }
    });

    return JsonStore;
}

JsonStoreFactory.$inject = ['$resource', 'Util'];
return JsonStoreFactory;

}); // define
