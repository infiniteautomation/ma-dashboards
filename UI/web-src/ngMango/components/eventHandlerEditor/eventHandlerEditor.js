/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
    static get $inject() { return ['maEventHandler', '$q', 'maDialogHelper', '$scope', '$window', 'maTranslate', '$attrs', '$parse', 'maUtil']; }

    constructor(maEventHandler, $q, maDialogHelper, $scope, $window, maTranslate, $attrs, $parse, maUtil) {
        this.maEventHandler = maEventHandler;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$window = $window;
        this.maTranslate = maTranslate;

        this.handlerTypes = maEventHandler.handlerTypes().map(t => {
            const item = angular.copy(t);
            maTranslate.tr(item.description).then(translated => {
                item.descriptionTranslated = translated;
            });
            return item;
        });
        this.handlerTypesByName = maUtil.createMapObject(this.handlerTypes, 'type');

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
                this.eventHandler = this.maEventHandler.create('EMAIL');
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

        // allow resubmitting a form with validationMessage errors by setting them all back to valid
        this.form.setValidationMessageValidity(true);

        if (!this.form.$valid) {
            this.form.activateTabWithClientError();
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

    typeChanged() {
        const previous = this.eventHandler;
        this.eventHandler = this.handlerTypesByName[previous.handlerType].create();

        // copy only a select set of properties over
        for (const key of Object.keys(this.maEventHandler.defaultProperties)) {
            this.eventHandler[key] = previous[key];
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
        icon: 'assignment_turned_in'
    }
};
