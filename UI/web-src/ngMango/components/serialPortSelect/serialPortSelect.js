/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import serialPortSelectTemplate from './serialPortSelect.html';
import './serialPortSelect.css';

class SerialPortSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maSerialPort', 'maDialogHelper']; }
    
    constructor(maSerialPort, maDialogHelper) {
        this.maSerialPort = maSerialPort;
        this.maDialogHelper = maDialogHelper;
        
        this.showClear = true;
    }
    
    $onInit() {
        this.getSerialPorts();
    }

    getSerialPorts(params = {}) {
        this.serialPortPromise = this.maSerialPort.list(params).then(serialPorts => {
            this.serialPorts = serialPorts;
            return serialPorts;
        });

        return this.serialPortPromise;
    }

    refreshList() {
        this.getSerialPorts({refresh: true}).then(response => {
            this.maDialogHelper.toast('ui.app.serialPort.portListRefreshed');
        });
    }
    
    setValue(value) {
        this.ngModelCtrl.$setViewValue(value);
        this.ngModelCtrl.$setTouched(value);
        this.ngModelCtrl.$render();
    }
}

export default {
    controller: SerialPortSelectController,
    template: serialPortSelectTemplate,
    require: {
        ngModelCtrl: 'ngModel'
    },
    bindings: {
        showIcon: '<?',
        showClear: '<?',
        disabled: '@?',
        required: '@?'
    },
    transclude: {
        label: '?maLabel'
    },
    designerInfo: {
        translation: 'ui.components.maSerialPortSelect',
        icon: 'storage',
        attributes: {
            showClear: {type: 'boolean'}
        }
    }
};