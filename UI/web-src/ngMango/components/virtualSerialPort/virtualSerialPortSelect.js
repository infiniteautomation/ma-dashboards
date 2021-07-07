/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
        this.ngModelCtrl.$render = () => this.render();
        this.getItems();
    }
    
    $onChanges(changes) {
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

    setViewValue(selected) {
        this.ngModelCtrl.$setViewValue(selected);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }

    getItems() {
        return this.maVirtualSerialPort.list().then(items => {
            this.items = items;
        });
    }

    selectItem() {
        const selectedItem = this.selected.copy();
        this.setViewValue(selectedItem);

        if (typeof this.onSelect === 'function') {
            const copyOfItem = this.selected.copy(); 
            this.onSelect({$item: copyOfItem});
        }
    }

    newItem() {
        this.selected = new this.maVirtualSerialPort();
        this.setViewValue(this.selected);
    }

}

export default {
    template: componentTemplate,
    controller: VirtualSerialPortController,
    bindings: {
        selectMultiple: '<?',
        updatedItem: '<?',
        deletedItem: '<?',
        onSelect: '&?'
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
