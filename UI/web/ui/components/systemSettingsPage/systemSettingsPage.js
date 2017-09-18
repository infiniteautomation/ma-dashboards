/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

SystemSettingsPageController.$inject = ['maSystemSettings', 'maLocales', 'maUser', '$state', 'maUiMenu', '$mdMedia',
	'$scope', '$timeout', 'maSystemActions', 'maDialogHelper', 'maServer'];
function SystemSettingsPageController(SystemSettings, maLocales, User, $state, maUiMenu, $mdMedia,
		$scope, $timeout, maSystemActions, maDialogHelper, maServer) {
    this.SystemSettings = SystemSettings;
    this.User = User;
    this.$state = $state;
    this.menu = maUiMenu;
    this.$mdMedia = $mdMedia;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.maSystemActions = maSystemActions;
    this.maDialogHelper = maDialogHelper;
    this.maServer = maServer;
    
    maLocales.get().then(function(locales) {
        locales.forEach(function(locale) {
            locale.id = locale.id.replace('-', '_');
        });
        this.locales = locales;
    }.bind(this));
    
    this.systemAlarmLevelSettings = SystemSettings.getSystemAlarmLevelSettings();
    this.auditAlarmLevelSettings = SystemSettings.getAuditAlarmLevelSettings();
}

SystemSettingsPageController.prototype.$onChanges = function(changes) {
};

SystemSettingsPageController.prototype.$onInit = function() {
    this.$scope.$on('$viewContentLoading', function(event, viewName) {
        if (viewName === '@ui.settings.system') {
            if (this.settingForm) {
                // set form back to pristine state when changing between sections
                this.settingForm.$setPristine();
                this.settingForm.$setUntouched();
                this.changedValues = {};
                this.error = null;
                this.savedMessage = false;
                this.$timeout.cancel(this.savedMessageTimeout);
                delete this.savePromise;
            }
        }
    }.bind(this));
    
    this.SystemSettings.listPermissions().then(function(permissions) {
    	this.permissions = permissions;
    }.bind(this));
};

SystemSettingsPageController.prototype.actions = {
	purgeUsingSettings: {
		confirmTr: 'systemSettings.purgeDataWithPurgeSettingsConfirm',
		descriptionTr: 'ui.app.purgeUsingSettings',
		resultsTr: 'ui.app.purgeSuccess'
	},
	purgeAllPointValues: {
		confirmTr: 'systemSettings.purgeDataConfirm',
		descriptionTr: 'ui.app.pointValuePurge',
		resultsTr: 'systemSettings.excelreports.purgeSuccess'
	},
	purgeAllEvents: {
		confirmTr: 'systemSettings.purgeAllEventsConfirm',
		descriptionTr: 'ui.app.eventPurge',
		resultsTr: 'systemSettings.excelreports.purgeSuccess'
	},
	backupConfiguration: {
		confirmTr: 'systemSettings.backupNow',
		descriptionTr: 'ui.app.configBackup',
		resultsTr: 'ui.app.configBackupSuccess'
	},
	sqlBackup: {
		confirmTr: 'systemSettings.backupNow',
		descriptionTr: 'ui.app.sqlBackup',
		resultsTr: 'ui.app.sqlBackupSuccess'
	},
	sqlRestore: {
		confirmTr: 'systemSettings.confirmRestoreDatabase',
		descriptionTr: 'ui.app.sqlRestore',
		resultsTr: 'ui.app.sqlRestoreSuccess'
	}
};

SystemSettingsPageController.prototype.doAction = function(event, name, data) {
	this.maDialogHelper.confirmSystemAction(angular.extend({event: event, actionName: name, actionData: data}, this.actions[name]));
};

SystemSettingsPageController.prototype.sendTestEmail = function() {
    var $ctrl = this;
    this.User.current.sendTestEmail().then(function(response) {
        $ctrl.maDialogHelper.toastOptions({
    		text: response.data,
    		hideDelay: 10000
    	});
    }, function(error) {
    	$ctrl.maDialogHelper.toastOptions({
    		textTr: ['ui.components.errorSendingEmail', this.User.current.email],
    		hideDelay: 10000,
    		classes: 'md-warn'
    	});
    }.bind(this));
};

SystemSettingsPageController.prototype.confirm = function(event, onConfirmed, translation) {
	return this.maDialogHelper.confirm(event, translation).then(onConfirmed);
};

SystemSettingsPageController.prototype.valueChanged = function(systemSetting) {
    this.changedValues[systemSetting.key] = systemSetting.value;
};

SystemSettingsPageController.prototype.saveSection = function() {
    if (this.savePromise) return;
    
    this.$timeout.cancel(this.savedMessageTimeout);
    this.error = null;
    this.savedMessage = false;
    
    this.savePromise = this.SystemSettings.setValues(this.changedValues).then(function() {
        this.settingForm.$setPristine();
        this.settingForm.$setUntouched();
        this.changedValues = {};
        this.savedMessage = true;
        this.savedMessageTimeout = this.$timeout(function() {
            this.savedMessage = false;
        }.bind(this), 5000);
    }.bind(this), function(e) {
        this.error = {
            response: e,
            message: e.mangoStatusText
        };
    }.bind(this)).then(function() {
        delete this.savePromise;
    }.bind(this));
};

SystemSettingsPageController.prototype.currentTime = function() {
	return Math.floor((new Date()).valueOf() / 1000);
};

SystemSettingsPageController.prototype.getBackupFiles = function() {
	return this.maServer.getSystemInfo('sqlDatabaseBackupFileList').then(function(list) {
		return (this.backupFiles = list);
	}.bind(this));
};

return {
    controller: SystemSettingsPageController,
    templateUrl: require.toUrl('./systemSettingsPage.html')
};

}); // define