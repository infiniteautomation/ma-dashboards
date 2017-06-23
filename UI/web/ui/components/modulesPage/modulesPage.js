/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

ModulesPageController.$inject = ['maModules', 'maTranslate', 'maDialogHelper', '$mdToast', '$scope', '$sce', '$window'];
function ModulesPageController(maModules, maTranslate, maDialogHelper, $mdToast, $scope, $sce, $window) {
    this.maModules = maModules;
    this.maTranslate = maTranslate;
    this.maDialogHelper = maDialogHelper;
    this.$mdToast = $mdToast;
    this.$scope = $scope;
    this.$sce = $sce;
    this.$window = $window;
}

ModulesPageController.prototype.$onInit = function() {
    this.getModules();

    this.pageUrl = this.$window.location.href;
    
    this.maModules.getUpdateLicensePayload().then(function(payload) {
    	this.storeUrl = this.$sce.trustAsResourceUrl(payload.storeUrl + '/account/store');
    	delete payload.storeUrl;
    	this.updateLicenseStr = angular.toJson(payload, false);
    }.bind(this));
    
    this.$scope.$on('maWatchdog', function(event, current, previous) {
    	if (current.status !== previous.status && current.status === 'LOGGED_IN') {
    	    this.getModules();
    	}
    }.bind(this));
};

ModulesPageController.prototype.getModules = function() {
	this.maModules.getAll().then(function(modules) {
		var coreModule;
        this.modules = modules.filter(function(module) {
        	if (module.name == 'core') {
        		coreModule = module;
        		return false;
        	}
        	return true;
        }).sort(function(a, b) {
        	var aName = a.name.toLowerCase();
        	var bName = b.name.toLowerCase();
            if (aName < bName) return -1;
            if (aName > bName) return 1;
            return 0;
        });
		this.coreModule = coreModule;
    }.bind(this));
};

ModulesPageController.prototype.bgColor = function(module) {
    if (module.unloaded || module.markedForDeletion) return 'warn-hue-3';
//    if (!module.signed) return 'warn-hue-2';
    return 'background-hue-1';
};

ModulesPageController.prototype.deleteModule = function($event, module, doDelete) {
	if (!doDelete)
		return module.$delete(false);
	
	this.maDialogHelper.confirm($event, 'modules.module.deleteConfirm').then(function() {
		return module.$delete(true);
	});
};

ModulesPageController.prototype.restart = function($event) {
	this.maDialogHelper.confirm($event, 'modules.restartConfirm').then(function() {
		this.maModules.restart();
	}.bind(this)).then(function() {
		var toast = this.$mdToast.simple()
	        .textContent(this.maTranslate.trSync('modules.restartScheduled'))
	        .action(this.maTranslate.trSync('common.ok'))
	        .highlightAction(true)
	        .position('bottom center')
	        .hideDelay(10000);
		this.$mdToast.show(toast);
	}.bind(this));
};

ModulesPageController.prototype.downloadLicense = function($event) {
	var username;
	
	this.maDialogHelper.showBasicDialog($event, {
		titleTr: 'ui.app.enterStoreCredentials',
		contentTemplateUrl: require.toUrl('./usernamePasswordPrompt.html'),
		showCancel: true,
		smallDialog: true
	}).then(function(result) {
		return this.maModules.downloadLicense(result.username, result.password);
	}.bind(this)).then(function() {
		this.maDialogHelper.toast('ui.app.licenseDownloaded');
		this.getModules();
	}.bind(this), function(error) {
		if (!error) return; // prompt cancelled
		var msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
		this.maDialogHelper.toast('ui.app.failedToDownloadLicense', 'md-warn', msg);
	}.bind(this));
};

return {
    controller: ModulesPageController,
    templateUrl: require.toUrl('./modulesPage.html')
};

}); // define
