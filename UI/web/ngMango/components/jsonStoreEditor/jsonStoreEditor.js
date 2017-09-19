/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

/**
 * @ngdoc directive
 * @name ngMango.directive:maJsonStoreEditor
 * @restrict E
 * @description Given a JSON store XID, allows editing of the JSON store's name, permissions and content
 */

const $inject = Object.freeze(['maJsonStore', '$q', 'maDialogHelper']);
class JsonStoreEditorController {
    static get $inject() { return $inject; }
    
    constructor(maJsonStore, $q, maDialogHelper) {
        this.maJsonStore = maJsonStore;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
    }
    
    $onInit() {
    }
    
    $onChanges(changes) {
        if (changes.xid && this.xid) {
            this.loadXid();
        }
    }
    
    loadXid() {
        return this.maJsonStore.get({xid: this.xid}).$promise.then(null, error => {
            if (error.status === 404) {
                var item = new this.maJsonStore();
                item.xid = this.xid;
                item.name = this.xid;
                item.jsonData = {};
                return item;
            }
            return this.$q.reject(error);
        }).then(item => {
            this.storeItem = item;
        });
    }

    deleteItem(event) {
        this.maDialogHelper.confirm(event, ['ui.components.confirmDeleteJsonStore', this.storeItem.name]).then(() => {
            return this.storeItem.$delete().then(() => {
                this.loadXid();
            });
        }, angular.noop);
    }
}

return {
    templateUrl: require.toUrl('./jsonStoreEditor.html'),
    controller: JsonStoreEditorController,
    bindings: {
        xid: '@'
    },
    designerInfo: {
        translation: 'ui.dox.jsonStoreEditor',
        icon: 'sd_storage'
    }
};

}); // define
