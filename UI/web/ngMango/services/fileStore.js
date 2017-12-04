/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'moment-timezone', 'jszip'], function(angular, require, moment, JSZip) {
'use strict';

fileStore.$inject = ['$http', 'maUtil', '$q'];
function fileStore($http, maUtil, $q) {
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
        		return new FileStoreFile(path[0], file);
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
    	
    	const formData = new FormData();
    	for (var i = 0; i < files.length; i++) {
        	formData.append('files[]', files[i]);
    	}

        return this.uploadFormData(path, formData, overwrite);
    };

    FileStore.prototype.uploadZipFile = function(path, file, overwrite) {
        return $q.when(JSZip.loadAsync(file)).then(zip => {
            const formData = new FormData();
            
            const promises = Object.keys(zip.files).map(fileName => zip.files[fileName])
            .filter(file => !file.dir)
            .map(file => {
                return file.async('blob').then(blob => {
                    formData.append('files[]', blob, file.name);
                });
            });
            
            return $q.all(promises).then(() => formData);
         }).then(formData => {
             return this.uploadFormData(path, formData, overwrite);
         });
    };
    
    FileStore.prototype.uploadFormData = function(path, formData, overwrite) {
        const folderUrl = this.toUrl(path, true);

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
                return new FileStoreFile(path[0], file);
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
    		return new FileStoreFile(path[0], response.data);
    	});
    };
    
    FileStore.prototype.createNewFile = function(path, name) {
    	return this.uploadFiles(path, [new File([], name)], false).then(function(files) {
    		return files[0];
    	});
    };
    
    FileStore.prototype.renameFile = function(path, oldFile, newName) {
    	if (path.length < 1) {
    		throw new Error('Must specify the file store name');
    	}
    	var fileUrl = this.toUrl(path.concat(oldFile.filename), oldFile.directory);

    	return $http({
    		method: 'POST',
    		url: fileUrl,
    		params: {
    			moveTo: newName
    		}
    	}).then(function(response) {
    		return new FileStoreFile(path[0], response.data);
    	});
    };
    
    FileStore.prototype.copyFile = function(path, oldFile, newName) {
    	if (path.length < 1) {
    		throw new Error('Must specify the file store name');
    	}
    	var fileUrl = this.toUrl(path.concat(oldFile.filename), oldFile.directory);

    	return $http({
    		method: 'POST',
    		url: fileUrl,
    		params: {
    			copyTo: newName
    		}
    	}).then(function(response) {
    		return new FileStoreFile(path[0], response.data);
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

    FileStore.prototype.downloadFiles = function(path) {
        const zip = new JSZip();
        return this.addPathToZip(path, zip).then(() => {
            return zip.generateAsync({type : 'blob'});
        }).then(data => {
            const zipName = path.join('_') + '.zip';
            maUtil.downloadBlob(data, zipName);
        });
    };
    
    FileStore.prototype.addPathToZip = function(path, zip) {
        return this.listFiles(path).then(files => {
            const promises = files.map(file => {
                if (file.directory) {
                    const folder = zip.folder(file.filename);
                    return this.addPathToZip(path.concat(file.filename), folder);
                }
                
                return this.downloadFile(file).then(content => {
                    zip.file(file.filename, content);
                });
            });
            return $q.all(promises);
        });
    };

    function FileStoreFile(fileStore, file) {
    	angular.extend(this, file);
    	this.fileStore = fileStore;
    	
    	var urlArray = [fileStoreUrl, fileStore];
    	if (this.folderPath) {
    		urlArray.push(this.folderPath);
    	}
    	urlArray.push(this.filename);
    	this.url = urlArray.join('/');
    	
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
