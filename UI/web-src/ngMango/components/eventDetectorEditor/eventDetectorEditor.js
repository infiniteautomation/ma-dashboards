/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventDetectorEditorTemplate from './eventDetectorEditor.html';
import './eventDetectorEditor.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventDetectorEditor
 * @restrict E
 * @description Editor for an event detector, allows creating, updating or deleting
 */

class EventDetectorEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventDetector', '$q', 'maDialogHelper', '$scope', '$window', 'maTranslate', '$attrs', '$parse']; }
    
    constructor(maEventDetector, $q, maDialogHelper, $scope, $window, maTranslate, $attrs, $parse) {
        this.maEventDetector = maEventDetector;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$window = $window;
        this.maTranslate = maTranslate;
        
        this.detectorTypes = maEventDetector.detectorTypes();
        this.detectorTypesByName = maEventDetector.detectorTypesByName();
        
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
            if (viewValue instanceof this.maEventDetector) {
                this.eventDetector = viewValue.copy();
            } else {
                this.eventDetector = new this.maEventDetector(viewValue);
            }
        } else {
            this.eventDetector = null;
        }

        if (this.eventDetector && this.eventDetector.isNew()) {
            this.activeTab = 0;
        }

        if (this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.eventDetector);
    }

    saveItem(event) {
        this.form.$setSubmitted();
        
        if (!this.form.$valid) {
            this.form.activateTabWithClientError();
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }
        
        this.validationMessages = [];

        const notifyName = this.eventDetector.description || this.eventDetector.getOriginalId() || this.eventDetector.xid;
        this.eventDetector.save().then(item => {
            this.setViewValue();
            this.render();
            this.maDialogHelper.toast(['ui.eventDetectors.saved', item.description]);
        }, error => {
            let statusText = error.mangoStatusText;
            
            if (error.status === 422) {
                statusText = error.mangoStatusTextShort;
                this.validationMessages = error.data.result.messages;
            }
            
            this.maDialogHelper.errorToast(['ui.app.saveError', notifyName, statusText]);
        });
    }
    
    revertItem(event) {
        if (this.confirmDiscard('revert')) {
            this.render();
        }
    }

    deleteItem(event) {
        const notifyName = this.eventDetector.description || this.eventDetector.getOriginalId();
        this.maDialogHelper.confirm(event, ['ui.eventDetectors.confirmDelete', notifyName]).then(() => {
            this.eventDetector.delete().then(() => {
                this.maDialogHelper.toast(['ui.eventDetectors.deleted', notifyName]);
                this.eventDetector = null;
                this.setViewValue();
                this.render();
            });
        }, error => {
            this.maDialogHelper.errorToast(['ui.app.deleteError', notifyName, error.mangoStatusText]);
        });
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
}

export default {
    template: eventDetectorEditorTemplate,
    controller: EventDetectorEditorController,
    bindings: {
        discardOptions: '<?confirmDiscard'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.eventDetectorEditor',
        icon: 'change_history'
    }
};
