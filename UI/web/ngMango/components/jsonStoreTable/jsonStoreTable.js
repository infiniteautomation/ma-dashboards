/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

/**
 * @ngdoc directive
 * @name ngMango.directive:maJsonStoreTable
 * @restrict E
 * @description Displays a table of all the JSON store objects and allows editing and deleting them
 */

const $inject = Object.freeze(['maJsonStore', 'maJsonStoreEventManager', '$q', '$filter', '$injector', '$window', 'maTranslate']);
class JsonStoreTableController {
    static get $inject() { return $inject; }
    
    constructor(maJsonStore, maJsonStoreEventManager, $q, $filter, $injector, $window, maTranslate) {
        this.maJsonStore = maJsonStore;
        this.maJsonStoreEventManager = maJsonStoreEventManager;
        this.$q = $q;
        this.$filter = $filter;
        this.$window = $window;
        this.maTranslate = maTranslate;
        
        if ($injector.has('maDialogHelper')) {
            this.maDialogHelper = $injector.get('maDialogHelper');
        }
        
        this.tableOrder = 'name';
        
        // so mdDataTable can call reorder with correct context
        this.reorder = () => this.reorderTable();
    }
    
    $onInit() {
        this.maJsonStore.query().$promise.then((items) => {
            this.items = items;
            this.reorderTable();
        });
    }
    
    $onChanges(changes) {
    }
    
    reorderTable() {
        this.orderedItems = this.$filter('orderBy')(this.items, this.tableOrder);
    }
    
    deleteItem(event, item, index) {
        let confirm;
        if (this.maDialogHelper) {
            confirm = this.maDialogHelper.confirm(event, ['ui.components.confirmDeleteJsonStore', item.name]);
        } else {
            const confirmText = this.maTranslate.trSync(['ui.components.confirmDeleteJsonStore', item.name]);
            confirm = this.$window.confirm(confirmText) ? this.$q.when() : this.$q.reject();
        }
        
        confirm.then(() => {
            item.$delete().then(() => {
               this.items.splice(index, 1);
               this.reorderTable();
            });
        }, angular.noop);
    }
}

return {
    templateUrl: require.toUrl('./jsonStoreTable.html'),
    controller: JsonStoreTableController,
    bindings: {},
    designerInfo: {
        translation: 'ui.dox.jsonStoreTable',
        icon: 'sd_storage'
    }
};

}); // define
