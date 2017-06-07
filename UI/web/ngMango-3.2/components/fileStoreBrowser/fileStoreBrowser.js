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
    	directories: '<?',
    	mimeTypes: '<?',
    	extensions: '<?'
    }
};

FileStoreBrowserController.$inject = ['maFileStore'];
function FileStoreBrowserController(maFileStore) {
    this.maFileStore = maFileStore;
}

FileStoreBrowserController.prototype.$onInit = function() {
    this.ngModelCtrl.$render = this.render.bind(this);
};

FileStoreBrowserController.prototype.$onChanges = function(changes) {
	
};

// ng-model value changed outside of this directive
FileStoreBrowserController.prototype.render = function() {
	var url = this.ngModelCtrl.$viewValue;
	if (!url) return;
	
	this.path = this.maFileStore.fromUrl(url);
	if (this.path.directory) {
		this.filename = null;
	} else {
		this.filename = this.path.pop();
	}

	this.listFiles();
};

FileStoreBrowserController.prototype.listFiles = function() {
	if (this.path.length) {
		this.listPromise = this.maFileStore.listFiles(this.path).then(function(files) {
			this.files = files;
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

FileStoreBrowserController.prototype.pathClicked = function(event, index) {
	var popNum = this.path.length - index - 1;
	while(popNum-- > 0) {
		this.path.pop();
	}

	this.listFiles();
	
	if (this.path.length) {
		this.ngModelCtrl.$setViewValue(this.maFileStore.toUrl(this.path, true));
	}
};

FileStoreBrowserController.prototype.fileClicked = function(event, file) {
	var path = this.path;
	if (file.directory) {
		this.filename = null;
		this.path.push(file.filename);
		this.listFiles();
	} else {
		this.filename = file.filename;
		path = this.path.concat(file.filename);
	}
    this.ngModelCtrl.$setViewValue(this.maFileStore.toUrl(path, file.directory));
};

return fileStoreBrowser;

}); // define
