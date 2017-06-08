/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

var fileStoreBrowser = {
    controller: FileStoreBrowserController,
    templateUrl: require.toUrl('./fileStoreBrowser.html'),
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
    	restrictToStore: '@?store',
    	selectDirectories: '<?',
    	mimeTypes: '@?',
    	extensions: '@?',
    	preview: '<?'
    },
    designerInfo: {
    	attributes: {
    		selectDirectories: {type: 'boolean'}
    	}
    }
};

FileStoreBrowserController.$inject = ['maFileStore', '$element', 'maDialogHelper'];
function FileStoreBrowserController(maFileStore, $element, maDialogHelper) {
    this.maFileStore = maFileStore;
    this.$element = $element;
    this.maDialogHelper = maDialogHelper;
    
    this.tableOrder = ['-directory', 'filename'];
}

FileStoreBrowserController.prototype.$onInit = function() {
	this.path = [this.restrictToStore || 'default'];
    this.ngModelCtrl.$render = this.render.bind(this);
};

FileStoreBrowserController.prototype.$onChanges = function(changes) {
	if (changes.mimeTypes) {
		var mimeTypeMap = this.mimeTypeMap = {};
		if (this.mimeTypes) {
			this.mimeTypes.split(/\s*,\s*/).forEach(function(mimeType) {
				if (!mimeType) return;
				mimeTypeMap[mimeType.toLowerCase()] = true;
			});
		}
	}
	if (changes.extensions) {
		var extensionMap = this.extensionMap = {};
		if (this.extensions) {
			this.extensions.split(/\s*,\s*/).forEach(function(ext) {
				if (!ext) return;
				if (ext[0] === '.') ext = ext.substr(1);
				extensionMap[ext.toLowerCase()] = true;
			});
		}
	}
	
	if (changes.extensions || changes.mimeTypes) {
		var accept = [];
		
		Object.keys(this.extensionMap).forEach(function(ext) {
			accept.push('.' + ext);
		});

		Object.keys(this.mimeTypeMap).forEach(function(mime) {
			accept.push(mime);
		});
		
		this.acceptAttribute = accept.join(',');
	}
};

// ng-model value changed outside of this directive
FileStoreBrowserController.prototype.render = function() {
	var url = this.ngModelCtrl.$viewValue;

	try {
		this.path = this.maFileStore.fromUrl(url);
		if (this.path.directory) {
			this.filename = null;
		} else {
			this.filename = this.path.pop();
		}
	} catch (e) {
	}
	
	this.listFiles();
};

FileStoreBrowserController.prototype.listFiles = function() {
	if (this.path.length) {
		this.listPromise = this.maFileStore.listFiles(this.path).then(function(files) {
			if (this.mimeTypes || this.extensions) {
				this.files = files.filter(this.filterFiles, this);
			} else {
				this.files = files;
			}
		}.bind(this));
	} else {
		this.listPromise = this.maFileStore.list().then(function(fileStores) {
			this.files = fileStores.map(function(store) {
				return {
					filename: store,
					directory: true
				};
			});
	    	return this.files;
	    }.bind(this));
	}
	
	this.listPromise['finally'](function() {
    	delete this.listPromise;
    }.bind(this));
};

FileStoreBrowserController.prototype.filterFiles = function(file) {
	if (file.directory) return true;

	if (this.extensions) {
		var match = /\.([^\.]+)$/.exec(file.filename);
		if (match && this.extensionMap[match[1].toLowerCase()]) return true;
	}
	if (this.mimeTypes) {
		if (this.mimeTypeMap['*/*']) return true;
		if (!file.mimeType) return false;
		if (this.mimeTypeMap[file.mimeType.toLowerCase()]) return true;
		if (this.mimeTypeMap[file.mimeType.toLowerCase().replace(/\/.+$/, '/*')]) return true;
	}
};

FileStoreBrowserController.prototype.pathClicked = function(event, index) {
	var popNum = this.path.length - index - 1;
	while(popNum-- > 0) {
		this.path.pop();
	}

	this.listFiles();
	
	if (this.selectDirectories && this.path.length) {
		this.ngModelCtrl.$setViewValue(this.maFileStore.toUrl(this.path, true));
	}
};

FileStoreBrowserController.prototype.fileClicked = function(event, file) {
	this.file = file;
	var path = this.path;
	if (file.directory) {
		this.filename = null;
		this.path.push(file.filename);
		this.listFiles();
	} else {
		this.filename = file.filename;
		path = this.path.concat(file.filename);
	}
	if (!file.directory || this.selectDirectories) {
		this.ngModelCtrl.$setViewValue(this.maFileStore.toUrl(path, file.directory));
	}
};

FileStoreBrowserController.prototype.cancelClick = function(event) {
	event.stopPropagation();
};

FileStoreBrowserController.prototype.deleteFile = function(event, file) {
	event.stopPropagation();
	
	this.maDialogHelper.confirm(event, 'ui.app.areYouSureDeleteFile').then(function() {
		this.maFileStore.remove(this.path.concat(file.filename), false).then(function() {
			var index = this.files.indexOf(file);
			if (index >= 0)
				this.files.splice(index, 1);
		}.bind(this));
	}.bind(this));
};

FileStoreBrowserController.prototype.uploadFiles = function(event) {
	this.$element.find('input[type=file]').trigger('click');
};

FileStoreBrowserController.prototype.uploadFilesChanged = function(event) {
	var files = event.target.files;
	if (!files.length) return;

	this.uploadPromise = this.maFileStore.uploadFiles(this.path, files).then(function(uploaded) {
		if (this.mimeTypes || this.extensions) {
			uploaded = uploaded.filter(this.filterFiles, this);
		}
		if (uploaded.length) {
			// append uploaded to this.files
			Array.prototype.splice.apply(this.files, [this.files.length, 0].concat(uploaded));
			this.fileClicked(null, uploaded[0]);
		}
	}.bind(this));
	
	this.uploadPromise['finally'](function() {
    	delete this.uploadPromise;
    	this.$element.find('input[type=file]').val('');
    }.bind(this));
};

return fileStoreBrowser;

}); // define
