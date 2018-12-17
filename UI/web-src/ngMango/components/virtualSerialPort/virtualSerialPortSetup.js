/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './virtualSerialPortSetup.html';
import angular from 'angular';

const $inject = Object.freeze(['$scope']);

class VirtualSerialPortSetupController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope) {
        this.$scope = $scope;
    }

    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.virtualSerialPort);
    }

    render() {
        this.virtualSerialPort = this.ngModelCtrl.$viewValue;

        this.form.$setPristine();
        this.form.$setUntouched();
    }

    save() {  

        this.form.$setSubmitted();
        
    }

    cancel(event) {
        this.list = new this.maMailingList();
        this.setViewValue();
        this.render();
    }

}

export default {
    bindings: {},
    require: {
        ngModelCtrl: 'ngModel'
    },
    controller: VirtualSerialPortSetupController,
    template: componentTemplate
};
