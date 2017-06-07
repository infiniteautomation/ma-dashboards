/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

fileStore.$inject = ['$http', 'maUtil'];
function fileStore($http, maUtil) {
	var fileStoreUrl = '/rest/v2/file-stores';
	var fileStoreUrlSplit = fileStoreUrl.split('/');
	
    function FileStore() {
    }

    FileStore.prototype.toUrl = function(pathArray, isDirectory) {
    	var parts = pathArray.map(function(part) {
    		return encodeURIComponent(part);
    	});
    	var url = fileStoreUrl + '/' + parts.join('/');
    	if (isDirectory) {
    		url += '/';
    	}
    	return url;
    };

    FileStore.prototype.fromUrl = function(url) {
    	var path = [];
    	url.split('/').forEach(function(part, i) {
    		if (i < fileStoreUrlSplit.length) {
    			if (part !== fileStoreUrlSplit[i]) {
    				throw new Error('Not a file store url');
    			}
    		} else {
    			path.push(decodeURIComponent(part));
    		}
    	});
    	
    	if (path.length < 1) {
    		throw new Error('Must specify the file store name');
    	}
    	
    	if (!path[path.length - 1]) {
    		path.pop();
    		path.directory = true;
    	}
    	
    	return path;
    };
    
    FileStore.prototype.list = function() {
    	return $http({
    		method: 'GET',
    		url: fileStoreUrl
    	}).then(function(response) {
    		return response.data;
    	});
    };
    
    FileStore.prototype.listFiles = function(path) {
    	if (path.length < 1) {
    		throw new Error('Must specify the file store name');
    	}
    	return $http({
    		method: 'GET',
    		url: this.toUrl(path, true)
    	}).then(function(response) {
    		return response.data;
    	});
    };

    return new FileStore();
}

return fileStore;

}); // define
