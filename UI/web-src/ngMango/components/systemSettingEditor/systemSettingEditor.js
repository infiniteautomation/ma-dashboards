/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import systemSettingEditorTemplate from './systemSettingEditor.html';
import tinycolor from 'tinycolor2';

class SystemSettingEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maSystemSettings', '$timeout', '$q', '$injector', 'maDialogHelper', 'MA_TIME_PERIOD_TYPES']; }
    
    constructor(SystemSettings, $timeout, $q, $injector, maDialogHelper, MA_TIME_PERIOD_TYPES) {
        this.SystemSettings = SystemSettings;
        this.$timeout = $timeout;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
        this.timePeriodTypes = MA_TIME_PERIOD_TYPES;
    
        if ($injector.has('$mdColorPicker')) {
            this.$mdColorPicker = $injector.get('$mdColorPicker');
        }
    
        this.messages = {};
        this.debounceTime = 0;
    }
    
    $onInit() {
        if (!this.inputType) {
            this.inputType = this.type === 'INTEGER' ? 'number' : 'text';
        }
        if (this.onInit) {
        	this.onInit({$ctrl: this});
        }
    }
    
    $onChanges(changes) {
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
    }
    
    setValue(value) {
    	this.systemSetting.value = value;
    	this.valueChanged();
    }
    
    valueChanged() {
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
    }
    
    saveSetting() {
        this.done = false;
        this.error = false;
        delete this.messages.errorSaving;
        
        // dont show the sync icon for saves of less than 200ms, stops icon flashing
        const delay = this.$timeout(() => {
            this.saving = true;
        }, 200);
        
        this.systemSetting.setValue().then(value => {
            if (this.onValueSaved) {
                this.onValueSaved({$value: value});
            }
            this.$timeout.cancel(delay);
            this.saving = false;
            this.done = true;
        }, () => {
            this.$timeout.cancel(delay);
            this.saving = false;
            this.error = true;
            this.messages.errorSaving = true;
            return this.$q.reject();
        }).then(() => {
            return this.$timeout(angular.noop, 5000);
        }).then(() => {
            this.done = false;
        });
    }
    
    chooseColor($event) {
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
        }).then(color => {
            this.systemSetting.value = color;
            this.valueChanged();
        });
    }
}

export default {
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
        onInit: '&?',
        availableOptions: '<?'
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