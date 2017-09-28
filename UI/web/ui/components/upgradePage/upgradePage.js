/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

UpgradePageController.$inject = ['maModules', 'maDialogHelper', '$scope', '$q', '$mdToast', 'maTranslate'];
function UpgradePageController(maModules, maDialogHelper, $scope, $q, $mdToast, maTranslate) {
    this.maModules = maModules;
    this.maDialogHelper = maDialogHelper;
    this.$scope = $scope;
    this.$q = $q;
    this.$mdToast = $mdToast;
    this.maTranslate = maTranslate;
    
    this.moduleSelectedBound = (module) => this.moduleSelected(module);
}

UpgradePageController.prototype.$onInit = function() {
    this.checkForUpgrades();
    
    this.maModules.getCore().then(function(coreModule) {
        this.coreModule = coreModule;
    }.bind(this));

    this.$scope.$on('maWatchdog', function(event, current, previous) {
    	if (current.status !== previous.status && current.status === 'LOGGED_IN') {
    	    this.checkForUpgrades();
    	}
    }.bind(this));

    this.maModules.notificationManager.subscribe((event, message) => {
		if (event.name === 'webSocketMessage') {
			if (message.type === 'MODULE_DOWNLOADED') {
				if (!moduleDownloaded(message.name, this.upgradesSelected)) {
					moduleDownloaded(message.name, this.installsSelected);
				}
			} else if (message.type === 'UPGRADE_STATE_CHANGE') {
				var toast = this.$mdToast.simple()
			        .textContent(this.maTranslate.trSync('ui.app.upgradeProgress', message.upgradeProcessState))
			        .action(this.maTranslate.trSync('common.ok'))
			        .highlightAction(true)
			        .position('bottom center')
			        .hideDelay(10000);
				this.$mdToast.show(toast);
				
				if (this.upgradeDeferred && (message.upgradeProcessState === 'Done' || message.upgradeProcessState === 'Restarting...')) {
					this.upgradeDeferred.resolve();
				}
			}
		}
		
		function moduleDownloaded(moduleName, searchArray) {
			for (var i = searchArray.length - 1; i >= 0; i--) {
				if (searchArray[i].name === moduleName) {
					searchArray[i].downloaded = true;
					searchArray.splice(i, 1);
					return true;
				}
			}
		}
	}, this.$scope, ['webSocketMessage']);
};

UpgradePageController.prototype.checkForUpgrades = function() {
	this.installsSelected = [];
    this.upgradesSelected = [];
    this.backupBeforeDownload = true;
    this.restartAfterDownload = true;
	delete this.error;
	
	this.checkPromise = this.maModules.checkForUpgrades().then(function(available) {
		this.installs = available.newInstalls;
		this.upgrades = available.upgrades;
		
		// ensure module has a dependencyVersions property
		this.installs.concat(this.upgrades).forEach((module) => {
		    if (!module.dependencyVersions) {
                module.dependencyVersions = {};
                if (module.dependencies) {
                    module.dependencies.split(/\s*,\s*/).forEach(depStr => {
                        const parts = depStr.split(/\s*:\s*/);
                        module.dependencyVersions[parts[0]] = parts[1];
                    });
                }
		    }
		});
		
	}.bind(this), function(error) {
		this.error = error.mangoStatusText;
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

UpgradePageController.prototype.moduleSelected = function(selected) {
    // select any dependencies automatically
    Object.keys(selected.dependencyVersions).forEach((depName) => {
        const moduleFinder = module => module.name === depName;
        
        const installModule = this.installs.find(moduleFinder);
        if (installModule && this.installsSelected.indexOf(installModule) < 0) {
            this.installsSelected.push(installModule);
        }

        const upgradeModule = this.upgrades.find(moduleFinder);
        if (upgradeModule && this.upgradesSelected.indexOf(upgradeModule) < 0) {
            this.upgradesSelected.push(upgradeModule);
        }
    });
};

UpgradePageController.prototype.doUpgrade = function($event) {
    const missingDep = this.installsSelected.concat(this.upgradesSelected).some(module => {
        return Object.keys(module.dependencyVersions).some(depName => {
            const moduleFinder = module => module.name === depName;
            
            const installModule = this.installs.find(moduleFinder);
            if (installModule && this.installsSelected.indexOf(installModule) < 0) {
                this.maDialogHelper.toastOptions({
                    textTr: ['ui.app.moduleNotSelectedForInstall', module.name, depName],
                    classes: 'md-warn',
                    timeout: 10000
                });
                return true;
            }
            
            const upgradeModule = this.upgrades.find(moduleFinder);
            if (upgradeModule && this.upgradesSelected.indexOf(upgradeModule) < 0) {
                this.maDialogHelper.toastOptions({
                    textTr: ['ui.app.moduleNotSelectedForUpgrade', module.name, depName],
                    classes: 'md-warn',
                    timeout: 10000
                });
                return true;
            }
        });
    });
    
    if (missingDep) return;
    
	this.upgradePromise = this.maDialogHelper.confirm($event, 'ui.app.upgradeConfirm').then(function() {
		return this.maModules.doUpgrade(this.installsSelected, this.upgradesSelected,
			this.backupBeforeDownload, this.restartAfterDownload);
	}.bind(this)).then(function(response) {
		this.upgradeDeferred = this.$q.defer();
		return this.upgradeDeferred.promise;
	}.bind(this))['finally'](function() {
		delete this.upgradePromise;
		delete this.upgradeDeferred;
	}.bind(this));
};

UpgradePageController.prototype.restart = function($event) {
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
    controller: UpgradePageController,
    templateUrl: require.toUrl('./upgradePage.html')
};

}); // define
