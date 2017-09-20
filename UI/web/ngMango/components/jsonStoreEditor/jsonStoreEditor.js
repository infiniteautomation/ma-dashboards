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
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
        if (changes.xid) {
            
        }
    }
    
    render() {
        this.validationMessages = [];
        
        if (this.ngModelCtrl.$viewValue) {
            this.storeItem = angular.copy(this.ngModelCtrl.$viewValue);
        } else {
            this.storeItem = this.maJsonStore.newItem();
        }

        this.form.$setPristine();
        this.form.$setUntouched();
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.storeItem);
    }

    loadXid() {
        this.maJsonStore.get({xid: this.xid}).$promise.then(null, error => {
            if (error.status === 404) {
                this.storeItem = this.maJsonStore.newItem(this.xid);
            } else {
                this.maDialogHelper.errorToast(['ui.components.jsonStoreGetError', error.mangoStatusText]);
            }
        }).then(item => {
            this.storeItem = item;
        });
    }
    
    saveItem(event) {
        this.form.$setSubmitted();
        
        if (!this.form.$valid) {
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }
        
        this.storeItem.$save().then(item => {
            this.setViewValue();
            this.render();
            this.maDialogHelper.toast(['ui.components.jsonStoreSaved', this.storeItem.name]);
        }, error => {
            this.validationMessages = error.validationMessages;
            this.maDialogHelper.errorToast(['ui.components.jsonStoreSaveError', error.mangoStatusText]);
        });
    }
    
    revertItem(event) {
        this.render();
    }

    deleteItem(event) {
        this.maDialogHelper.confirm(event, ['ui.components.jsonStoreConfirmDelete', this.storeItem.name]).then(() => {
            this.storeItem.$delete().then(() => {
                this.maDialogHelper.toast(['ui.components.jsonStoreDeleted', this.storeItem.name]);
                this.storeItem = this.maJsonStore.newItem();
                this.setViewValue();
                this.render();
            });
        }, angular.noop);
    }
}

return {
    templateUrl: require.toUrl('./jsonStoreEditor.html'),
    controller: JsonStoreEditorController,
    bindings: {
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.dox.jsonStoreEditor',
        icon: 'sd_storage'
    }
};

}); // define
