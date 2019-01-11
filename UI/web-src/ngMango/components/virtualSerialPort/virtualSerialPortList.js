/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './virtualSerialPortList.html';
import angular from 'angular';

/**
 * @ngdoc directive
 * @name ngMango.directive:maVirtualSerialPortList
 * @restrict E
 * @description Displays a list of virtual serial ports
 */

const $inject = Object.freeze(['$scope', 'maVirtualSerialPort', 'maDialogHelper']);
class VirtualSerialPortListController {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope, maVirtualSerialPort, maDialogHelper) {
        this.$scope = $scope;
        this.maVirtualSerialPort = maVirtualSerialPort;
        this.maDialogHelper = maDialogHelper;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
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
    
    newVirtualSerialPort() {
        this.new = true;
        this.selected = new this.maVirtualSerialPort();
        this.setViewValue();
    }

    selectVirtualSerialPort(virtualSerialPort) {
        this.new = false;
        this.selected = virtualSerialPort;
        this.setViewValue();
    }

    getVirtualSerialPorts() {
        return this.maVirtualSerialPort.list().then(virtualSerialPorts => {
            this.virtualSerialPorts = virtualSerialPorts;
            this.newVirtualSerialPort();
        });
    }

}

export default {
    template: componentTemplate,
    controller: VirtualSerialPortListController,
    bindings: {
        updatedItem: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'excelreports.ui.reportList',
        icon: 'date_range'
    }
};
