/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './virtualSerialPortSelect.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maVirtualSerialPortSelect
 * @restrict E
 * @description Displays a select drop down of Virtual Serial Ports
 */

const $inject = Object.freeze(['$scope', 'maVirtualSerialPort']);
class VirtualSerialPortController {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope, maVirtualSerialPort) {
        this.$scope = $scope;
        this.maVirtualSerialPort = maVirtualSerialPort;
    }
    
    $onInit() {
        this.getVirtualSerialPorts();
    }
    
    $onChanges(changes) {
        if (changes.updatedItem && this.updatedItem) {
            this.getVirtualSerialPorts();
        }
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }

    getVirtualSerialPorts() {
        return this.maVirtualSerialPort.list().then(virtualSerialPorts => {
            this.virtualSerialPorts = virtualSerialPorts;
        });
    }

}

export default {
    template: componentTemplate,
    controller: VirtualSerialPortController,
    bindings: {
        selectMultiple: '<?',
        updatedItem: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    transclude: {
        labelSlot: '?maLabel'
    },
    designerInfo: {
        translation: 'ui.app.virtualSerialPort.select',
        icon: 'list'
    }
};
