/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import modulesPageTemplate from './modulesPage.html';
import usernamePasswordPromptTemplate from './usernamePasswordPrompt.html';

ModulesPageController.$inject = ['maModules', 'maTranslate', 'maDialogHelper', '$scope', '$sce', '$window'];
function ModulesPageController(maModules, maTranslate, maDialogHelper, $scope, $sce, $window) {
    this.maModules = maModules;
    this.maTranslate = maTranslate;
    this.maDialogHelper = maDialogHelper;
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
    
    this.$scope.$on('maWatchdog', (event, current, previous) => {
    	if (current.status === 'LOGGED_IN') {
    	    this.getModules();
    	}
    });
};

ModulesPageController.prototype.getModules = function() {
	this.maModules.getAll().then(function(modules) {
	    let coreModule;
        this.modules = modules.filter(function(module) {
        	if (module.name === 'core') {
        		coreModule = module;
        		return false;
        	}
        	return true;
        }).sort(function(a, b) {
        	const aName = a.name.toLowerCase();
        	const bName = b.name.toLowerCase();
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
	}).catch(error => {
		this.maDialogHelper.toastOptions({
			textTr: ['ui.app.deleteModuleFailed', error.mangoStatusText],
			hideDelay: 10000,
			classes: 'md-warn'
		});
	});
};

ModulesPageController.prototype.restart = function($event) {
	this.maDialogHelper.confirm($event, 'modules.restartConfirm').then(function() {
		return this.maModules.restart();
	}.bind(this)).then(function() {
		this.maDialogHelper.toastOptions({
			textTr: 'modules.restartScheduled',
			hideDelay: 20000
		});
	}.bind(this), function(error) {
		this.maDialogHelper.toastOptions({
			textTr: ['ui.app.restartFailed', error.mangoStatusText],
			hideDelay: 10000,
			classes: 'md-warn'
		});
	}.bind(this));
};

ModulesPageController.prototype.downloadLicense = function($event) {
	this.maDialogHelper.showBasicDialog($event, {
		titleTr: 'ui.app.enterStoreCredentials',
		contentTemplateUrl: 'modulesPage.usernamePasswordPrompt.html',
		showCancel: true,
		smallDialog: true
	}).then(function(result) {
		return this.maModules.downloadLicense(result.username, result.password);
	}.bind(this)).then(function() {
		this.maDialogHelper.toast('ui.app.licenseDownloaded');
		this.getModules();
	}.bind(this), function(error) {
		if (!error) return; // prompt cancelled
		const msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
		this.maDialogHelper.toast('ui.app.failedToDownloadLicense', 'md-warn', msg);
	}.bind(this));
};

modulesPageFactory.$inject = ['$templateCache'];
function modulesPageFactory($templateCache) {
    $templateCache.put('modulesPage.usernamePasswordPrompt.html', usernamePasswordPromptTemplate);

    return {
        restrict: 'E',
        scope: {},
        bindToController: true,
        controllerAs: '$ctrl',
        controller: ModulesPageController,
        template: modulesPageTemplate
    };
}

export default modulesPageFactory;
