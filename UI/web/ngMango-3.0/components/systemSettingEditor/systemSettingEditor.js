/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'tinycolor'], function(angular, require, tinycolor) {
'use strict';

SystemSettingEditorController.$inject = ['maSystemSettings', '$timeout', '$q', '$injector'];
function SystemSettingEditorController(SystemSettings, $timeout, $q, $injector) {
    this.SystemSettings = SystemSettings;
    this.$timeout = $timeout;
    this.$q = $q;

    if ($injector.has('$mdColorPicker')) {
        this.$mdColorPicker = $injector.get('$mdColorPicker');
    }
    
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
        this.systemSetting.getValue().then(function(value) {
            if (this.onValueChanged) {
                this.onValueChanged({$value: value});
            }
        }.bind(this));
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
    
    this.systemSetting.setValue().then(function(value) {
        if ($ctrl.onValueChanged) {
            $ctrl.onValueChanged({$value: value});
        }
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

SystemSettingEditorController.prototype.chooseColor = function($event) {
    if (!this.$mdColorPicker) return;

    this.$mdColorPicker.show({
        value: this.systemSetting.value || tinycolor.random().toHexString(),
        defaultValue: '',
        random: false,
        clickOutsideToClose: true,
        hasBackdrop: true,
        skipHide: false,
        preserveScope: false,
        mdColorAlphaChannel: true,
        mdColorSpectrum: true,
        mdColorSliders: false,
        mdColorGenericPalette: true,
        mdColorMaterialPalette: false,
        mdColorHistory: false,
        mdColorDefaultTab: 0,
        $event: $event
    }).then(function(color) {
        this.systemSetting.value = color;
        this.settingChanged();
    }.bind(this));
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
        onValueChanged: '&?',
        name: '@?'
    },
    transclude: {
        options: '?mdOption'
    }
};

}); // define