/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import componentTemplate from './virtualSerialPortList.html';

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
        this.getItems();
    }
    
    $onChanges(changes) {
        if (this.items) {
            if (changes.updatedItem && this.updatedItem) {
                const foundIndex = this.items.findIndex(item => item.xid === this.updatedItem.xid);
    
                if (foundIndex >= 0) {
                    // if we found it then replace it in the list
                    this.items[foundIndex] = this.updatedItem;
                    this.selected = this.updatedItem;
                    
                } else {
                    // otherwise add it to the list
                    this.items.push(this.updatedItem);
                    this.selected = this.items[this.items.length - 1];
                }
    
                this.new = false;
            }
    
            if (changes.deletedItem && this.deletedItem) {
                const foundIndex = this.items.findIndex(item => item.xid === this.deletedItem.xid);
    
                if (foundIndex >= 0) {
                    this.selected = this.updatedItem;
                    this.items.splice(foundIndex, 1);
                    this.newItem();
                } 
            }
        }
    }

    getItems() {
        return this.maVirtualSerialPort.list().then(items => {
            this.items = items;
            this.newItem();
        });
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }
    
    newItem() {
        this.new = true;
        this.selected = new this.maVirtualSerialPort();
        this.setViewValue();
        this.onSelectItem();
    }

    selectItem(item) {
        this.new = false;
        this.selected = item.copy();
        this.setViewValue();
        this.onSelectItem();
    }

    onSelectItem() {
        if (typeof this.onSelect === 'function') {
            const copyOfItem = this.selected.copy(); 
            this.onSelect({$item: copyOfItem});
        }
    }

}

export default {
    template: componentTemplate,
    controller: VirtualSerialPortListController,
    bindings: {
        updatedItem: '<?',
        deletedItem: '<?',
        onSelect: '&?',
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.app.virtualSerialPort.select',
        icon: 'list'
    }
};
