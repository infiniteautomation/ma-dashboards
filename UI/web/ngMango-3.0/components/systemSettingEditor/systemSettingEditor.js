/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

SystemSettingEditorController.$inject = ['maSystemSettings', '$timeout', '$q'];
function SystemSettingEditorController(SystemSettings, $timeout, $q) {
    this.SystemSettings = SystemSettings;
    this.$timeout = $timeout;
    this.$q = $q;

    this.messages = {};
}

SystemSettingEditorController.prototype.$onInit = function() {
    if (!this.inputType) {
        this.inputType = this.type === 'INTEGER' ? 'number' : 'text';
    }
};

SystemSettingEditorController.prototype.$onChanges = function(changes) {
    if (changes.key || changes.type) {
        this.systemSetting = new this.SystemSettings(this.key, this.type);
        this.systemSetting.getValue();
        
        if (this.systemSettingChanged) {
            this.systemSettingChanged({$setting: this.systemSetting});
        }
    }
};

SystemSettingEditorController.prototype.settingChanged = function settingChanged() {
    var $ctrl = this;
    this.done = false;
    this.error = false;
    delete $ctrl.messages.errorSaving;
    
    // dont show the sync icon for saves of less than 200ms, stops icon flashing
    var delay = this.$timeout(function() {
        this.saving = true;
    }, 200);
    
    this.systemSetting.setValue().then(function() {
        $ctrl.$timeout.cancel(delay);
        $ctrl.saving = false;
        $ctrl.done = true;
    }, function() {
        $ctrl.$timeout.cancel(delay);
        $ctrl.saving = false;
        $ctrl.error = true;
        $ctrl.messages.errorSaving = true;
        return $ctrl.$q.reject();
    }).then(function() {
        return $ctrl.$timeout(angular.noop, 5000);
    }).then(function() {
        $ctrl.done = false;
    });
};

return {
    controller: SystemSettingEditorController,
    templateUrl: require.toUrl('./systemSettingEditor.html'),
    bindings: {
        key: '@',
        labelTr: '@',
        type: '@?',
        inputType: '@?',
        min: '<?',
        max: '<?',
        step: '<?',
        systemSettingChanged: '&?'
    },
    transclude: {
        options: '?mdOption'
    }
};

}); // define