/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import componentTemplate from './virtualSerialPort.html';
import './virtualSerialPort.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maVirtualSerialPort
 * @restrict E
 * @description Displays a page to create Virtual Serial Ports
 */

const $inject = Object.freeze(['$scope', 'maVirtualSerialPort', '$mdMedia', '$state']);
class VirtualSerialPort {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope, maVirtualSerialPort, $mdMedia, $state) {
        this.$scope = $scope;
        this.maVirtualSerialPort = maVirtualSerialPort;
        this.$mdMedia = $mdMedia;
        this.$state = $state;
    }
    
    $onInit() {
        if (this.$state.params.xid) {
            this.maVirtualSerialPort.get(this.$state.params.xid).then((item) => {
                delete item.$promise;
                this.selected = item;
                this.itemUpdated(this.selected);
            }, () => {
                this.newItem(); 
                this.updateUrl();
            });
        } else {
            this.newItem();
            this.updateUrl();
        } 
    }

    newItem() {
        this.selected = new this.maVirtualSerialPort();
    }

    updateUrl() {
        this.$state.params.xid = this.selected && !this.selected.isNew() && this.selected.xid || null;
        this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
    }

    itemSelected(item) {
        this.updateUrl();
    }

    itemUpdated(item) {
        this.updatedItem = item;
        this.updateUrl();
    }

    itemDeleted(item) {
        this.deletedItem = item;
        this.updateUrl();
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