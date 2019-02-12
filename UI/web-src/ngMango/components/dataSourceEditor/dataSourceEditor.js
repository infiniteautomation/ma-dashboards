/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import dataSourceEditorTemplate from './dataSourceEditor.html';
import './dataSourceEditor.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataSourceEditor
 * @restrict E
 * @description Editor for a data source, allows creating, updating or deleting
 */

const $inject = Object.freeze(['maDataSource', '$q', 'maDialogHelper', '$scope', '$window', 'maTranslate', '$attrs', '$parse',
    'maPoint', 'maEvents']);

class DataSourceEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return $inject; }
    
    constructor(maDataSource, $q, maDialogHelper, $scope, $window, maTranslate, $attrs, $parse,
            Point, maEvents) {
        this.maDataSource = maDataSource;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$window = $window;
        this.maTranslate = maTranslate;
        this.Point = Point;
        this.maEvents = maEvents;
        
        this.types = maDataSource.types;
        this.typesByName = maDataSource.typesByName;

        this.dynamicHeight = true;
        if ($attrs.hasOwnProperty('dynamicHeight')) {
            this.dynamicHeight = $parse($attrs.dynamicHeight)($scope.$parent);
        }
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render(true);
        
        this.$scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
            if (event.defaultPrevented) return;
            
            if (!this.confirmDiscard('stateChange')) {
                event.preventDefault();
                return;
            }
        });

        const oldUnload = this.$window.onbeforeunload;
        this.$window.onbeforeunload = (event) => {
            if (this.form && this.form.$dirty && this.checkDiscardOption('windowUnload')) {
                const text = this.maTranslate.trSync('ui.app.discardUnsavedChanges');
                event.returnValue = text;
                return text;
            }
        };
        
        this.$scope.$on('$destroy', () => {
            this.$window.onbeforeunload = oldUnload;
        });
    }
    
    $onChanges(changes) {
    }
    
    render(confirmDiscard = false) {
        if (confirmDiscard && !this.confirmDiscard('modelChange')) {
            this.setViewValue();
            return;
        }
        
        this.validationMessages = [];
        
        const viewValue = this.ngModelCtrl.$viewValue;
        if (viewValue instanceof this.maDataSource) {
            this.dataSource = viewValue.copy();
        } if (viewValue) {
            this.dataSource = Object.assign(Object.create(this.maDataSource.prototype), viewValue);
        } else {
            this.dataSource = null;
        }
        
        if (this.dataSource && this.dataSource.isNew()) {
            this.activeTab = 0;
        }

        if (this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.dataSource);
    }

    saveItem(event) {
        this.form.$setSubmitted();
        
        if (!this.form.$valid) {
            this.form.activateTabWithClientError();
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }
        
        this.validationMessages = [];
        
        this.dataSource.save().then(item => {
            this.setViewValue();
            this.render();
            this.maDialogHelper.toast(['ui.components.dataSourceSaved', this.dataSource.name || this.dataSource.xid]);
        }, error => {
            let statusText = error.mangoStatusText;
            
            if (error.status === 422) {
                statusText = error.mangoStatusTextShort;
                this.validationMessages = error.data.validationMessages;
            }
            
            this.maDialogHelper.errorToast(['ui.components.dataSourceSaveError', statusText]);
        });
    }
    
    revertItem(event) {
        if (this.confirmDiscard('revert')) {
            this.render();
        }
    }

    deleteItem(event) {
        const notifyName = this.dataSource.name || this.dataSource.originalId;
        this.maDialogHelper.confirm(event, ['ui.components.dataSourceConfirmDelete', notifyName]).then(() => {
            this.dataSource.delete().then(() => {
                this.maDialogHelper.toast(['ui.components.dataSourceDeleted', notifyName]);
                this.dataSource = null;
                this.setViewValue();
                this.render();
            }, error => {
                this.maDialogHelper.toast(['ui.components.dataSourceDeleteError', error.mangoStatusText]);
            });
        }, angular.noop);
    }
    
    checkDiscardOption(type) {
        return this.discardOptions === true || (this.discardOptions && this.discardOptions[type]);
    }
    
    confirmDiscard(type) {
        if (this.form && this.form.$dirty && this.checkDiscardOption(type)) {
            return this.$window.confirm(this.maTranslate.trSync('ui.app.discardUnsavedChanges'));
        }
        return true;
    }

    typeChanged() {
        const prevSource = this.dataSource;
        this.dataSource = this.typesByName[prevSource.modelType].createDataPoint();
        
        // copy only a select set of properties over
        this.dataSource.enabled = prevSource.enabled;
        this.dataSource.name = prevSource.name;
        this.dataSource.editPermission = prevSource.editPermission;
        this.purgeSettings = prevSource.purgeSettings;
    }

}

export default {
    template: dataSourceEditorTemplate,
    controller: DataSourceEditorController,
    bindings: {
        discardOptions: '<?confirmDiscard'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.dataSourceEditor',
        icon: 'link'
    }
};
