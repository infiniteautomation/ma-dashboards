/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import jsonStoreTableTemplate from './jsonStoreTable.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maJsonStoreTable
 * @restrict E
 * @description Displays a table of all the JSON store objects and allows editing and deleting them
 */

const $inject = Object.freeze(['maJsonStore', '$q', '$filter', '$injector', '$window', 'maTranslate', '$scope', 'maPermission']);
class JsonStoreTableController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return $inject; }
    
    constructor(maJsonStore, $q, $filter, $injector, $window, maTranslate, $scope, maPermission) {
        this.maJsonStore = maJsonStore;
        this.$q = $q;
        this.$filter = $filter;
        this.$window = $window;
        this.maTranslate = maTranslate;
        this.$scope = $scope;
        this.maPermission = maPermission;
        
        if ($injector.has('maDialogHelper')) {
            this.maDialogHelper = $injector.get('maDialogHelper');
        }

        this.tableOrder = 'name';
        
        // so mdDataTable can call reorder with correct context
        this.reorder = () => this.reorderTable();
    }
    
    $onInit() {
        this.queryPromise = this.maJsonStore.query().$promise.then((items) => {
            this.items = items;
            
            const promises = [];
            items.forEach(item => {
                promises.push(item.$get().$promise);
            });
            
            return this.$q.all(promises);
        }).then(() => {
            this.reorderTable();
            
            this.maJsonStore.notificationManager.subscribe((...args) => {
                this.updateHandler(...args);
            }, this.$scope);
        });
    }

    $onChanges(changes) {
    }
    
    updateHandler(event, item, attributes) {
        const index = this.items.findIndex(listItem => listItem.id === item.id);
        if (index >= 0) {
            if (event.name === 'update' || event.name === 'create') {
                this.items[index] = item;
            } else if (event.name === 'delete') {
                this.items.splice(index, 1);
            }
        } else if (event.name === 'update' || event.name === 'create') {
            this.items.push(item);
        }
        this.reorderTable();
    }
    
    reorderTable() {
        this.orderedItems = this.$filter('orderBy')(this.items, this.tableOrder);
    }
    
    deleteItem(event, item, index) {
        let confirm;
        if (this.maDialogHelper) {
            confirm = this.maDialogHelper.confirm(event, ['ui.components.jsonStoreConfirmDelete', item.name]);
        } else {
            const confirmText = this.maTranslate.trSync(['ui.components.jsonStoreConfirmDelete', item.name]);
            confirm = this.$window.confirm(confirmText) ? this.$q.when() : this.$q.reject();
        }
        
        confirm.then(() => {
            item.$delete().then(() => {
                // just in case the websocket is not connected, we still want to remove the item from our list
                this.maJsonStore.notificationManager.notifyIfNotConnected('delete', item, item.xid);
            });
        }, angular.noop);
    }

    formatPermission(permission) {
        return new this.maPermission(permission).toString();
    }
}

export default {
    template: jsonStoreTableTemplate,
    controller: JsonStoreTableController,
    bindings: {
        editClicked: '&?'
    },
    designerInfo: {
        translation: 'ui.dox.jsonStoreTable',
        icon: 'sd_storage'
    }
};


