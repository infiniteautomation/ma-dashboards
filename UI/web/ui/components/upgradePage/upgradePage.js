/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

UpgradePageController.$inject = ['maModules'];
function UpgradePageController(Modules) {
    this.Modules = Modules;
}

UpgradePageController.prototype.$onInit = function() {
    this.checkForUpgrades();
};

UpgradePageController.prototype.checkForUpgrades = function() {
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

return {
    controller: UpgradePageController,
    templateUrl: require.toUrl('./upgradePage.html')
};

}); // define
