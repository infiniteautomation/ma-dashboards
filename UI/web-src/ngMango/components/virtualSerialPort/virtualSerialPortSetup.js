/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './virtualSerialPortSetup.html';

const $inject = Object.freeze(['$scope', 'maDialogHelper', 'maVirtualSerialPort']);

class VirtualSerialPortSetupController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope, maDialogHelper, maVirtualSerialPort) {
        this.$scope = $scope;
        this.maDialogHelper = maDialogHelper;
        this.maVirtualSerialPort = maVirtualSerialPort;
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

        this.virtualSerialPort.save().then(response => {
            this.updateItem();
            this.maDialogHelper.toastOptions({
                textTr: ['systemSettings.comm.virtual.serialPortSaved'],
                hideDelay: 5000
            });
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.virtualSerialPort.notSaved', error.mangoStatusText],
                classes: 'md-warn',
                hideDelay: 5000
            });
        });
        
    }

    delete() {
        console.log(this.virtualSerialPort);
        this.virtualSerialPort.delete().then(response => {
            this.updateItem();
            this.maDialogHelper.toastOptions({
                textTr: ['systemSettings.comm.virtual.serialPortRemoved'],
                hideDelay: 5000
            });
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.virtualSerialPort.notRemoved', error.mangoStatusText],
                classes: 'md-warn',
                hideDelay: 5000
            });
        });
        
    }

    cancel(event) {
        this.virtualSerialPort = new this.maVirtualSerialPort();
        this.updateItem();
        this.setViewValue();
        this.render();
    }

    updateItem() {
        if (typeof this.itemUpdated === 'function') {
            const copyOfItem = angular.copy(this.virtualSerialPort);
            this.itemUpdated({$item: copyOfItem});
        }
    }

}

export default {
    bindings: {
        itemUpdated: '&?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    controller: VirtualSerialPortSetupController,
    template: componentTemplate
};
