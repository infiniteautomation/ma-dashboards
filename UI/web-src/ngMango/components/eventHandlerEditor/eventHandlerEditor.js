/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import eventHandlerEditorTemplate from './eventHandlerEditor.html';
import './eventHandlerEditor.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventHandlerEditor
 * @restrict E
 * @description Editor for an event handler, allows creating, updating or deleting
 */

class EventHandlerEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventHandler', '$q', 'maDialogHelper', '$scope', '$window', 'maTranslate', '$element', 'maUtil', '$attrs', '$parse']; }
    
    constructor(maEventHandler, $q, maDialogHelper, $scope, $window, maTranslate, $element, maUtil, $attrs, $parse) {
        this.maEventHandler = maEventHandler;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$window = $window;
        this.maTranslate = maTranslate;
        this.$element = $element;
        this.maUtil = maUtil;
        
        this.handlerTypes = maEventHandler.handlerTypes();
        this.handlerTypesByName = maEventHandler.handlerTypesByName();
        
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
        if (viewValue) {
            if (viewValue instanceof this.maEventHandler) {
                this.eventHandler = viewValue.copy();
            } else {
                this.eventHandler = new this.maEventHandler(viewValue);
            }
        } else {
            this.eventHandler = null;
        }

        if (this.eventHandler && this.eventHandler.isNew()) {
            this.activeTab = 0;
        }

        if (this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.eventHandler);
    }

    saveItem(event) {
        this.form.$setSubmitted();
        
        if (!this.form.$valid) {
            this.activateTabWithClientError();
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }
        
        this.validationMessages = [];
        
        this.eventHandler.save().then(item => {
            this.setViewValue();
            this.render();
            this.maDialogHelper.toast(['ui.components.eventHandlerSaved', this.eventHandler.alias || this.eventHandler.xid]);
        }, error => {
            let statusText = error.mangoStatusText;
            
            if (error.status === 422) {
                statusText = error.mangoStatusTextShort;
                this.validationMessages = error.data.result.messages;
                
                this.activateTabWithValidationError();
            }
            
            this.maDialogHelper.errorToast(['ui.components.eventHandlerSaveError', statusText]);
        });
    }
    
    revertItem(event) {
        if (this.confirmDiscard('revert')) {
            this.render();
        }
    }

    deleteItem(event) {
        const notifyName = this.eventHandler.alias || this.eventHandler.getOriginalId();
        this.maDialogHelper.confirm(event, ['ui.components.eventHandlerConfirmDelete', notifyName]).then(() => {
            this.eventHandler.delete().then(() => {
                this.maDialogHelper.toast(['ui.components.eventHandlerDeleted', notifyName]);
                this.eventHandler = null;
                this.setViewValue();
                this.render();
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
    
    activateTabWithClientError() {
        Object.values(this.form.$error).some(ctrls => {
            return ctrls.some(ctrl => {
                this.activateTab(ctrl.$$element[0]);
                return true;
            });
        });
    }
    
    activateTabWithValidationError() {
        const withProperty = this.validationMessages.filter(m => m.property);
        if (withProperty.length) {
            const property = withProperty[0].property;
            const inputElement = this.maUtil.findInputElement(property, this.form);
            this.activateTab(inputElement);
        }
    }
    
    activateTab(query) {
        if (!query) return;
        
        const tabElements = this.$element[0].querySelectorAll('md-tab-content');

        const index = Array.prototype.findIndex.call(tabElements, tab => {
            if (query instanceof Node) {
                return tab.contains(query);
            }
            
            return !!tab.querySelector(query);
        });
        
        if (index >= 0) {
            this.activeTab = index;
        }
    }
}

export default {
    template: eventHandlerEditorTemplate,
    controller: EventHandlerEditorController,
    bindings: {
        discardOptions: '<?confirmDiscard'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.eventHandlerEditor',
        icon: 'link'
    }
};
