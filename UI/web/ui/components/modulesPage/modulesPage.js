/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

ModulesPageController.$inject = ['maModules', 'maTranslate', 'maDialogHelper', '$mdToast', '$scope'];
function ModulesPageController(maModules, maTranslate, maDialogHelper, $mdToast, $scope) {
    this.maModules = maModules;
    this.maTranslate = maTranslate;
    this.maDialogHelper = maDialogHelper;
    this.$mdToast = $mdToast;
    this.$scope = $scope;
}

ModulesPageController.prototype.$onInit = function() {
    this.getModules();
    
    this.$scope.$on('maWatchdog', function(event, current, previous) {
    	if (current.status !== previous.status && current.status === 'LOGGED_IN') {
    	    this.getModules();
    	}
    }.bind(this));
};

ModulesPageController.prototype.getModules = function() {
	this.maModules.getAll().then(function(modules) {
        this.modules = modules;
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

return {
    controller: ModulesPageController,
    templateUrl: require.toUrl('./modulesPage.html')
};

}); // define
