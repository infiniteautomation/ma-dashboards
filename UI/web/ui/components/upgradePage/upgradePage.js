/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

UpgradePageController.$inject = ['maModules', 'maDialogHelper'];
function UpgradePageController(Modules, maDialogHelper) {
    this.Modules = Modules;
    this.maDialogHelper = maDialogHelper;
}

UpgradePageController.prototype.$onInit = function() {
    this.checkForUpgrades();
};

UpgradePageController.prototype.checkForUpgrades = function() {
	this.installsSelected = [];
    this.upgradesSelected = [];
    this.backupBeforeDownload = true;
    this.restartAfterDownload = true;
	delete this.error;
	
	this.checkPromise = this.Modules.checkForUpgrades().then(function(available) {
		this.installs = available.newInstalls;
		this.upgrades = available.upgrades;
	}.bind(this), function(error) {
		this.error = error;
	}.bind(this)).then(function() {
		delete this.checkPromise;
	}.bind(this));
};

UpgradePageController.prototype.showReleaseNotes = function($event, module) {
	this.maDialogHelper.showBasicDialog($event, {
		titleTr: 'ui.app.releaseNotes',
		contentTemplate: module.releaseNotes
	});
};

UpgradePageController.prototype.moduleSelected = function(module) {
};

UpgradePageController.prototype.moduleDeselected = function(module) {
};

return {
    controller: UpgradePageController,
    templateUrl: require.toUrl('./upgradePage.html')
};

}); // define
