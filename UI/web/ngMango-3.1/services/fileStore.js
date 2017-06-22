/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'moment-timezone'], function(angular, require, moment) {
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
    
    // lists the available file stores
    FileStore.prototype.list = function() {
    	return $http({
    		method: 'GET',
    		url: fileStoreUrl
    	}).then(function(response) {
    		return response.data;
    	});
    };
    
    // lists files inside a file store directory
    FileStore.prototype.listFiles = function(path) {
    	if (path.length < 1) {
    		throw new Error('Must specify the file store name');
    	}
    	var folderUrl = this.toUrl(path, true);
    	return $http({
    		method: 'GET',
    		url: folderUrl
    	}).then(function(response) {
    		return response.data.map(function(file) {
        		return new FileStoreFile(folderUrl, file);
    		});
    	});
    };
    
    FileStore.prototype.remove = function(path, recursive) {
    	if (path.length < 1) {
    		throw new Error('Must specify the file store name');
    	}
    	var folderUrl = this.toUrl(path);
    	return $http({
    		method: 'DELETE',
    		url: folderUrl,
    		params: {
    			recursive: recursive
    		}
    	}).then(function(response) {
    		return response.data;
    	});
    };
    
    FileStore.prototype.uploadFiles = function(path, files, overwrite) {
    	if (path.length < 1) {
    		throw new Error('Must specify the file store name');
    	}
    	var folderUrl = this.toUrl(path, true);
    	
    	var formData = new FormData();
    	for (var i = 0; i < files.length; i++) {
        	formData.append('files[]', files[i]);
    	}
    	
    	return $http({
    		method: 'POST',
    		url: folderUrl,
    		data: formData,
    		transformRequest: angular.identity,
    		headers: {
    			'Content-Type': undefined
    		},
    		params: {
    			overwrite: !!overwrite
    		}
    	}).then(function(response) {
    		return response.data.map(function(file) {
        		return new FileStoreFile(folderUrl, file);
    		});
    	});
    };
    
    FileStore.prototype.createNewFolder = function(path, name) {
    	if (path.length < 1) {
    		throw new Error('Must specify the file store name');
    	}
    	var folderUrl = this.toUrl(path.concat(name), true);

    	return $http({
    		method: 'POST',
    		url: folderUrl
    	}).then(function(response) {
    		return new FileStoreFile(folderUrl, response.data);
    	});
    };
    
    FileStore.prototype.createNewFile = function(path, name) {
    	return this.uploadFiles(path, [new File([], name)], false).then(function(files) {
    		return files[0];
    	});
    };
    
    FileStore.prototype.downloadFile = function(file) {
    	return $http({
    		method: 'GET',
    		url: file.url,
    		responseType: '',
    		transformResponse: angular.identity,
    		headers: {
    			'Accept': '*/*'
    		}
    	}).then(function(response) {
    		return response.data;
    	});
    };

    function FileStoreFile(folderUrl, file) {
    	angular.extend(this, file);
    	this.url = folderUrl + this.filename;
    	this.editMode = this.editModes[this.mimeType];
    }
    
    FileStoreFile.prototype.editModes = {
    	'application/json': 'json',
    	'application/javascript': 'javascript',
    	'text/css': 'css',
    	'text/html': 'html',
    	'text/plain': 'text',
    	'image/svg+xml': 'svg'
	};
    
    FileStoreFile.prototype.createFile = function(content) {
    	return new File([content], this.filename, {
    		type: this.mimeType,
    		lastModified: moment(this.lastModified).valueOf()
    	});
    };

    return new FileStore();
}

return fileStore;

}); // define
