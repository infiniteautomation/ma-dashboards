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
    	preview: '<?',
    	disableEdit: '<?',
    	editingFile: '&?'
    },
    designerInfo: {
    	attributes: {
    		selectDirectories: {type: 'boolean'}
    	}
    }
};

FileStoreBrowserController.$inject = ['maFileStore', '$element', 'maDialogHelper', '$q'];
function FileStoreBrowserController(maFileStore, $element, maDialogHelper, $q) {
    this.maFileStore = maFileStore;
    this.$element = $element;
    this.maDialogHelper = maDialogHelper;
    this.$q = $q;
    
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
	
	this.listFiles().then(function(files) {
		if (this.filename) {
			files.some(function(file) {
				if (file.filename === this.filename) {
					this.file = file;
					return true;
				}
			}.bind(this));
		}
	}.bind(this));
};

FileStoreBrowserController.prototype.listFiles = function() {
	var listErrorHandler = function() {
		this.files = [];
		this.filename = null;
		var defaultStore = this.restrictToStore || 'default';
		if (!(this.path.length === 1 && this.path[0] === defaultStore)) {
			this.path = [defaultStore];
			this.listFiles();
		}
	}.bind(this);
	
	if (this.path.length) {
		this.listPromise = this.maFileStore.listFiles(this.path).then(function(files) {
			if (this.mimeTypes || this.extensions) {
				this.files = files.filter(this.filterFiles, this);
			} else {
				this.files = files;
			}
	    	return this.files;
		}.bind(this), listErrorHandler);
	} else {
		this.listPromise = this.maFileStore.list().then(function(fileStores) {
			this.files = fileStores.map(function(store) {
				return {
					filename: store,
					directory: true
				};
			});
	    	return this.files;
	    }.bind(this), listErrorHandler);
	}

	this.listPromise['finally'](function() {
    	delete this.listPromise;
    }.bind(this));
	
	return this.listPromise;
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

	var confirmPromise = this.maDialogHelper.confirm(event,
			file.directory ? 'ui.app.areYouSureDeleteFolder' : 'ui.app.areYouSureDeleteFile');

	confirmPromise.then(function() {
		return this.maFileStore.remove(this.path.concat(file.filename), true);
	}.bind(this)).then(function() {
		var index = this.files.indexOf(file);
		if (index >= 0)
			this.files.splice(index, 1);
		this.maDialogHelper.toast('ui.fileBrowser.deletedSuccessfully', null, file.filename);
	}.bind(this), function(error) {
		if (!error) return; // dialog cancelled
		var msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
		this.maDialogHelper.toast('ui.fileBrowser.errorDeleting', 'md-warn', file.filename, msg);
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
			
			this.maDialogHelper.toast('ui.fileBrowser.filesUploaded', null, uploaded.length);
		}
	}.bind(this), function(error) {
		var msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
		this.maDialogHelper.toast('ui.fileBrowser.uploadFailed', 'md-warn', msg);
	}.bind(this));
	
	this.uploadPromise['finally'](function() {
    	delete this.uploadPromise;
    	this.$element.find('input[type=file]').val('');
    }.bind(this));
};

FileStoreBrowserController.prototype.createNewFolder = function(event) {
	var folderName;
	this.maDialogHelper.prompt(event, 'ui.app.createNewFolder', null, 'ui.app.folderName').then(function(_folderName) {
		folderName = _folderName;
		return this.maFileStore.createNewFolder(this.path, folderName);
	}.bind(this)).then(function(folder) {
		this.files.push(folder);
		this.maDialogHelper.toast('ui.fileBrowser.folderCreated', null, folder.filename);
	}.bind(this), function(error) {
		if (!error) return; // dialog cancelled
		if (error.status === 409) {
			this.maDialogHelper.toast('ui.fileBrowser.folderExists', 'md-warn', folderName);
		} else {
			var msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
			this.maDialogHelper.toast('ui.fileBrowser.errorCreatingFolder', 'md-warn', folderName, msg);
		}
	}.bind(this));
};

FileStoreBrowserController.prototype.createNewFile = function(event) {
	var fileName;
	this.maDialogHelper.prompt(event, 'ui.app.createNewFile', null, 'ui.app.fileName').then(function(_fileName) {
		fileName = _fileName;
		return this.maFileStore.createNewFile(this.path, fileName);
	}.bind(this)).then(function(file) {
		this.files.push(file);
		this.maDialogHelper.toast('ui.fileBrowser.fileCreated', null, file.filename);
		if (file.editMode)
			this.doEditFile(event, file);
	}.bind(this), function(error) {
		if (!error) return; // dialog cancelled
		if (error.status === 409) {
			this.maDialogHelper.toast('ui.fileBrowser.fileExists', 'md-warn', fileName);
		} else {
			var msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
			this.maDialogHelper.toast('ui.fileBrowser.errorCreatingFile', 'md-warn', fileName, msg);
		}
	}.bind(this));
};

FileStoreBrowserController.prototype.doEditFile = function(event, file) {
	event.stopPropagation();
	
	this.maFileStore.downloadFile(file).then(function(textContent) {
		this.editFile = file;
		this.editText = textContent;
		if (this.editingFile) {
			this.editingFile({$file: this.editFile});
		}
	}.bind(this), function(error) {
		var msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
		this.maDialogHelper.toast('ui.fileBrowser.errorDownloading', 'md-warn', file.filename, msg);
	}.bind(this));
};

FileStoreBrowserController.prototype.saveEditFile = function(event) {
	var files = [this.editFile.createFile(this.editText)];
	this.maFileStore.uploadFiles(this.path, files, true).then(function(uploaded) {
		var index = this.files.indexOf(this.editFile);
		this.files.splice(index, 1, uploaded[0]);
		
		this.maDialogHelper.toast('ui.fileBrowser.savedSuccessfully', null, this.editFile.filename);
		this.editFile = null;
		this.editText = null;
		if (this.editingFile) {
			this.editingFile({$file: null});
		}
	}.bind(this), function(error) {
		var msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
		this.maDialogHelper.toast('ui.fileBrowser.errorUploading', 'md-warn', this.editFile.filename, msg);
	}.bind(this));
};

FileStoreBrowserController.prototype.cancelEditFile = function(event) {
	this.editFile = null;
	this.editText = null;
	if (this.editingFile) {
		this.editingFile({$file: null});
	}
};

FileStoreBrowserController.prototype.renameFile = function(event, file) {
	event.stopPropagation();

	var newName;
	this.maDialogHelper.prompt(event, 'ui.app.renameOrMoveTo', null, 'ui.app.fileName', file.filename).then(function(_newName) {
		newName = _newName;
		if (newName === file.filename)
			return this.$q.reject();
		return this.maFileStore.renameFile(this.path, file, newName);
	}.bind(this)).then(function(renamedFile) {
		var index = this.files.indexOf(file);
		if (renamedFile.folderPath === file.folderPath) {
			// replace it
			this.files.splice(index, 1, renamedFile);
		} else {
			// remove it
			this.files.splice(index, 1);
		}
		if (renamedFile.filename === file.filename) {
			this.maDialogHelper.toast('ui.fileBrowser.fileMoved', null, renamedFile.filename, renamedFile.fileStore + '/' + renamedFile.folderPath);
		} else {
			this.maDialogHelper.toast('ui.fileBrowser.fileRenamed', null, renamedFile.filename);
		}
	}.bind(this), function(error) {
		if (!error) return; // dialog cancelled or filename the same
		if (error.status === 409) {
			this.maDialogHelper.toast('ui.fileBrowser.fileExists', 'md-warn', newName);
		} else {
			var msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
			this.maDialogHelper.toast('ui.fileBrowser.errorCreatingFile', 'md-warn', newName, msg);
		}
	}.bind(this));
};

FileStoreBrowserController.prototype.copyFile = function(event, file) {
	event.stopPropagation();

	var newName;
	this.maDialogHelper.prompt(event, 'ui.app.copyFileTo', null, 'ui.app.fileName', file.filename).then(function(_newName) {
		newName = _newName;
		if (newName === file.filename)
			return this.$q.reject();
		return this.maFileStore.copyFile(this.path, file, newName);
	}.bind(this)).then(function(copiedFile) {
		if (copiedFile.folderPath === file.folderPath) {
			this.files.push(copiedFile);
		}
		this.maDialogHelper.toast('ui.fileBrowser.fileCopied', null, copiedFile.filename, copiedFile.fileStore + '/' + copiedFile.folderPath);
	}.bind(this), function(error) {
		if (!error) return; // dialog cancelled or filename the same
		if (error.status === 409) {
			this.maDialogHelper.toast('ui.fileBrowser.fileExists', 'md-warn', newName);
		} else {
			var msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
			this.maDialogHelper.toast('ui.fileBrowser.errorCreatingFile', 'md-warn', newName, msg);
		}
	}.bind(this));
};

return fileStoreBrowser;

}); // define
