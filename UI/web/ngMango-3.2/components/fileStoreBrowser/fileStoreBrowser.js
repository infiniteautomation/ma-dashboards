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
    bindings: {}
};

FileStoreBrowserController.$inject = ['maFileStore'];
function FileStoreBrowserController(maFileStore) {
    this.maFileStore = maFileStore;
}

FileStoreBrowserController.prototype.$onInit = function() {
    this.ngModelCtrl.$render = this.render.bind(this);
    
    this.maFileStore.list().then(function(fileStores) {
    	this.fileStores = fileStores;
    }.bind(this));
};

// ng-model value changed outside of this directive
FileStoreBrowserController.prototype.render = function render() {
    
};

FileStoreBrowserController.prototype.checkboxChanged = function checkboxChanged() {
    this.ngModelCtrl.$setViewValue();
};

return fileStoreBrowser;

}); // define
