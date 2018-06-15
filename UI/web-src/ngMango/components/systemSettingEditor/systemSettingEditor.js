/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import systemSettingEditorTemplate from './systemSettingEditor.html';
import tinycolor from 'tinycolor2';

const systemSettingEditor = {
    controller: SystemSettingEditorController,
    template: systemSettingEditorTemplate,
    bindings: {
        key: '@',
        labelTr: '@',
        type: '@?',
        inputType: '@?',
        min: '<?',
        max: '<?',
        step: '<?',
        onValueChanged: '&?',
        onValueSaved: '&?',
        name: '@?',
        disabled: '<?ngDisabled',
        saveOnChange: '<?',
        onInit: '&?'
    },
    transclude: {
        options: '?mdOption'
    },
    require: {
        settingsPageController: '^^?maUiSystemSettingsPage',
        ngFormController: '^^?form'
    },
    designerInfo: {
        hideFromMenu: true
    }
};

SystemSettingEditorController.$inject = ['maSystemSettings', '$timeout', '$q', '$injector', 'maDialogHelper'];
function SystemSettingEditorController(SystemSettings, $timeout, $q, $injector, maDialogHelper) {
    this.SystemSettings = SystemSettings;
    this.$timeout = $timeout;
    this.$q = $q;
    this.maDialogHelper = maDialogHelper;

    if ($injector.has('$mdColorPicker')) {
        this.$mdColorPicker = $injector.get('$mdColorPicker');
    }

    this.messages = {};
    this.debounceTime = 0;
}

SystemSettingEditorController.prototype.$onInit = function() {
    if (!this.inputType) {
        this.inputType = this.type === 'INTEGER' ? 'number' : 'text';
    }
    if (this.onInit) {
    	this.onInit({$ctrl: this});
    }
};

SystemSettingEditorController.prototype.$onChanges = function(changes) {
    if (changes.key || changes.type) {
        this.systemSetting = new this.SystemSettings(this.key, this.type);
        this.systemSetting.getValue().then(value => {
            if (this.onValueChanged) {
                this.onValueChanged({$value: value, $initial: true});
            }
        }, error => this.maDialogHelper.httpErrorToast(error, [404]));
    }
    if (changes.saveOnChange) {
        this.debounceTime = this.saveOnChange ? 1000 : 0;
    }
};

SystemSettingEditorController.prototype.setValue = function setValue(value) {
	this.systemSetting.value = value;
	this.valueChanged();
};

SystemSettingEditorController.prototype.valueChanged = function valueChanged() {
    if (this.onValueChanged) {
        this.onValueChanged({$value: this.systemSetting.value, $initial: false});
    }
    if (this.settingsPageController) {
        this.settingsPageController.valueChanged(this.systemSetting);
    }
    // ensures form is marked dirty if user changes a color using the color picker
    if (this.ngFormController) {
        this.ngFormController.$setDirty();
    }
    if (this.saveOnChange) {
        this.saveSetting();
    }
};

SystemSettingEditorController.prototype.saveSetting = function saveSetting() {
    const $ctrl = this;
    this.done = false;
    this.error = false;
    delete $ctrl.messages.errorSaving;
    
    // dont show the sync icon for saves of less than 200ms, stops icon flashing
    const delay = this.$timeout(function() {
        this.saving = true;
    }, 200);
    
    this.systemSetting.setValue().then(function(value) {
        if ($ctrl.onValueSaved) {
            $ctrl.onValueSaved({$value: value});
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
        this.valueChanged();
    }.bind(this));
};

export default systemSettingEditor;
