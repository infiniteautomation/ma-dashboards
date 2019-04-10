/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import serialPortSelectTemplate from './serialPortSelect.html';

class SerialPortSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maSerialPort', '$scope']; }
    
    constructor(maSerialPort, $scope) {
        this.maSerialPort = maSerialPort;
        this.$scope = $scope;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.getSerialPorts();
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }
    
    getSerialPorts() {
        this.serialPortPromise = this.maSerialPort.list().then(serialPorts => {
            this.serialPorts = serialPorts;
            return serialPorts;
        });
    }
    
}

export default {
    controller: SerialPortSelectController,
    template: serialPortSelectTemplate,
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
        showClear: '<?',
        selectMultiple: '<?',
        hideName: '<?'
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