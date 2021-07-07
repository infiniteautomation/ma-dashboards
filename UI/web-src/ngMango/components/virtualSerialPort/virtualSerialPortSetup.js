/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
        this.ngModelCtrl.$setViewValue(this.selected);
    }

    render() {
        this.validationMessages = [];

        if (this.ngModelCtrl.$viewValue) {
            this.selected = this.ngModelCtrl.$viewValue.copy();
        }

        this.form.$setPristine();
        this.form.$setUntouched();
    }

    revert(event) {
        this.render();
    }

    save() {  
        this.form.$setSubmitted();

        this.selected.save().then(response => {
            
            this.updateItem();
            this.setViewValue();
            this.render();

            this.maDialogHelper.toastOptions({
                textTr: ['systemSettings.comm.virtual.serialPortSaved'],
                hideDelay: 5000
            });
        }, error => {
            if (error.status === 422) {
                this.validationMessages = error.data.result.messages;
            }

            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.virtualSerialPort.notSaved', error.mangoStatusText],
                classes: 'md-warn',
                hideDelay: 5000
            });
        });
        
    }

    delete() {
        this.maDialogHelper.confirm(event, ['ui.app.virtualSerialPort.deleteConfirm']).then(() => {
            this.selected.delete().then(response => {
                this.deleteItem();
                this.selected = new this.maVirtualSerialPort();
                this.setViewValue();
                this.render();
    
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
        });
        
    }

    updateItem() {
        if (typeof this.itemUpdated === 'function') {
            const copyOfItem = this.selected.copy();
            this.itemUpdated({$item: copyOfItem});
        }
    }

    deleteItem() {
        if (typeof this.itemDeleted === 'function') {
            const copyOfItem = this.selected.copy();
            this.itemDeleted({$item: copyOfItem});
        } 
    }

}

export default {
    bindings: {
        itemUpdated: '&?',
        itemDeleted: '&?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    controller: VirtualSerialPortSetupController,
    template: componentTemplate
};
