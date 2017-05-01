/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

SystemSettingsPageController.$inject = ['maSystemSettings', 'maLocales'];
function SystemSettingsPageController(systemSettings, maLocales) {
    this.SystemSettings = systemSettings;
    
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

return {
    controller: SystemSettingsPageController,
    templateUrl: require.toUrl('./systemSettingsPage.html')
};

}); // define