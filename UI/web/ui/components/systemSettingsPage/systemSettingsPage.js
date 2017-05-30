/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

SystemSettingsPageController.$inject = ['maSystemSettings', 'maLocales', 'maUser', '$mdToast', 'maTranslate', '$mdDialog', '$state', 'maUiMenu', '$mdMedia', '$scope', '$timeout'];
function SystemSettingsPageController(SystemSettings, maLocales, User, $mdToast, maTranslate, $mdDialog, $state, maUiMenu, $mdMedia, $scope, $timeout) {
    this.SystemSettings = SystemSettings;
    this.User = User;
    this.$mdToast = $mdToast;
    this.maTranslate = maTranslate;
    this.$mdDialog = $mdDialog;
    this.$state = $state;
    this.menu = maUiMenu;
    this.$mdMedia = $mdMedia;
    this.$scope = $scope;
    this.$timeout = $timeout;
    
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
};

SystemSettingsPageController.prototype.sendTestEmail = function() {
    var $ctrl = this;
    this.User.current.sendTestEmail().then(function(response) {
        var toast = $ctrl.$mdToast.simple()
            .textContent(response.data)
            .action($ctrl.maTranslate.trSync('common.ok'))
            .highlightAction(true)
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    }, function(response) {
        var toast = $ctrl.$mdToast.simple()
            .textContent($ctrl.maTranslate.trSync('ui.components.errorSendingEmail', emailAddress))
            .action($ctrl.maTranslate.trSync('common.ok'))
            .highlightAction(true)
            .highlightClass('md-warn')
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    });
};

SystemSettingsPageController.prototype.confirm = function(event, onConfirmed, translation) {
    var areYouSure = this.maTranslate.trSync('ui.app.areYouSure');
    var textContent = translation ? this.maTranslate.trSync(translation) : areYouSure;

    var confirm = this.$mdDialog.confirm()
        .title(areYouSure)
        .ariaLabel(areYouSure)
        .textContent(textContent)
        .targetEvent(event)
        .ok(this.maTranslate.trSync('common.ok'))
        .cancel(this.maTranslate.trSync('common.cancel'));

    return this.$mdDialog.show(confirm).then(onConfirmed);
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
        this.error = {response: e};
        this.error.message = e.data && typeof e.data === 'object' && e.data.message;
        if (!this.error.message && e.statusText) this.error.message = e.statusText;
        if (!this.error.message) this.error.message = 'Unknown';
    }.bind(this)).then(function() {
        delete this.savePromise;
    }.bind(this));
};

return {
    controller: SystemSettingsPageController,
    templateUrl: require.toUrl('./systemSettingsPage.html')
};

}); // define