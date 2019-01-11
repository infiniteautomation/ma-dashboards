/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './virtualSerialPort.html';
import './virtualSerialPort.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maVirtualSerialPort
 * @restrict E
 * @description Displays a page to create Virtual Serial Ports
 */

const $inject = Object.freeze(['$scope', 'maVirtualSerialPort', '$mdMedia']);
class VirtualSerialPort {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope, maVirtualSerialPort, $mdMedia) {
        this.$scope = $scope;
        this.maVirtualSerialPort = maVirtualSerialPort;
        this.$mdMedia = $mdMedia;
    }
    
    $onInit() {
        this.newVirtualSerialPort();
    }

    newVirtualSerialPort() {
        this.selected = new this.maVirtualSerialPort();
    }

}

export default {
    template: componentTemplate,
    controller: VirtualSerialPort,
    bindings: {
    },
    require: {},
    designerInfo: {
        translation: 'systemSettings.comm.virtual.serialPorts',
        icon: 'settings_input_hdmi'
    }
};