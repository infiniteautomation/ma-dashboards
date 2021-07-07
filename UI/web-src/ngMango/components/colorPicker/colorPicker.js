/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import colorPickerTemplate from './colorPicker.html';
import './colorPicker.css';
import tinycolor from 'tinycolor2';

class ColorPickerController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$injector', '$attrs']; }
    
    constructor($injector, $attrs) {
        this.$attrs = $attrs;
        if ($injector.has('$mdColorPicker')) {
            this.$mdColorPicker = $injector.get('$mdColorPicker');
        }
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
    }
    
    goBack() {
        this.dataPoint = null;
        this.setViewValue();
        this.render();
    }
    
    render() {
        this.color = this.ngModelCtrl.$viewValue;
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.color);
    }
    
    chooseColor(event) {
        if (!this.$mdColorPicker) return;
    
        this.$mdColorPicker.show({
            value: this.color || tinycolor.random().toHexString(),
            defaultValue: '',
            random: false,
            clickOutsideToClose: true,
            hasBackdrop: true,
            skipHide: true,
            preserveScope: false,
            mdColorAlphaChannel: true,
            mdColorSpectrum: true,
            mdColorSliders: false,
            mdColorGenericPalette: true,
            mdColorMaterialPalette: false,
            mdColorHistory: false,
            mdColorDefaultTab: 0,
            $event: event
        }).then(color => {
            this.color = color;
            this.setViewValue();
        }, error => null);
    }
}

export default {
    template: colorPickerTemplate,
    controller: ColorPickerController,
    bindings: {
        disabled: '@?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    }
};
