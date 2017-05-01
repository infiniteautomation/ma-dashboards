/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

SystemSettingsPageController.$inject = ['maSystemSettings', 'maLocales', 'maUser', '$mdToast', 'maTranslate'];
function SystemSettingsPageController(systemSettings, maLocales, User, $mdToast, translate) {
    this.SystemSettings = systemSettings;
    this.User = User;
    this.$mdToast = $mdToast;
    this.translate = translate;
    
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
            .action($ctrl.translate.trSync('common.ok'))
            .highlightAction(true)
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    }, function(response) {
        var toast = $ctrl.$mdToast.simple()
            .textContent($ctrl.translate.trSync('ui.components.errorSendingEmail', emailAddress))
            .action($ctrl.translate.trSync('common.ok'))
            .highlightAction(true)
            .highlightClass('md-warn')
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    });
};


return {
    controller: SystemSettingsPageController,
    templateUrl: require.toUrl('./systemSettingsPage.html')
};

}); // define