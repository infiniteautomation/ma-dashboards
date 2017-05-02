/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

SystemSettingsPageController.$inject = ['maSystemSettings', 'maLocales', 'maUser', '$mdToast', 'maTranslate', '$mdDialog'];
function SystemSettingsPageController(systemSettings, maLocales, User, $mdToast, maTranslate, $mdDialog) {
    this.SystemSettings = systemSettings;
    this.User = User;
    this.$mdToast = $mdToast;
    this.maTranslate = maTranslate;
    this.$mdDialog = $mdDialog;
    
    maLocales.get().then(function(locales) {
        locales.forEach(function(locale) {
            locale.id = locale.id.replace('-', '_');
        });
        this.locales = locales;
    }.bind(this));
    
    this.systemAlarmLevelSettings = systemSettings.getSystemAlarmLevelSettings();
    this.auditAlarmLevelSettings = systemSettings.getAuditAlarmLevelSettings();
}

SystemSettingsPageController.prototype.$onChanges = function(changes) {
};

SystemSettingsPageController.prototype.$onInit = function() {
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

return {
    controller: SystemSettingsPageController,
    templateUrl: require.toUrl('./systemSettingsPage.html')
};

}); // define