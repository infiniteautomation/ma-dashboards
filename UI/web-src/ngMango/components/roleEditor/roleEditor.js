/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import roleEditorTemplate from './roleEditor.html';
import './roleEditor.css';

class RoleEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maRole', 'maDialogHelper']; }
    
    constructor(Role, maDialogHelper) {
        this.Role = Role;
        this.maDialogHelper = maDialogHelper;
    }

    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }

    $onChanges(changes) {
        if (changes.disabledAttr) {
            this.disabled = !!this.disabledAttr;
        }
    }
    
    render() {
        this.resetForm();
        const viewValue = this.ngModelCtrl.$viewValue;
        this.role = viewValue instanceof this.Role ? viewValue.copy() : null;
    }

    resetForm() {
        delete this.validationMessages;
        if (this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
    }
    
    save() {
        this.form.$setSubmitted();
        if (!this.form.$valid) {
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }

        this.saving = true;
        const name = this.role.name;
        this.role.save().then(role => {
            this.maDialogHelper.toast(['roles.saved', name]);
            this.ngModelCtrl.$setViewValue(role.copy());
        }, error => {
            if (error.status === 422 && error.data && error.data.result && error.data.result.messages) {
                this.validationMessages = error.data.result.messages;
            }
            this.maDialogHelper.errorToast(['roles.errorSaving', name, error.mangoStatusText]);
        }).finally(() => delete this.saving);
    }
    
    revert() {
        this.render();
    }
    
    remove(event) {
        this.deleting = true;
        const name = this.role.name;
        this.maDialogHelper.confirm(event, ['roles.confirmDelete', name]).then(() => {
            this.role.delete().then(() => {
                this.role = null;
                this.resetForm();
                this.maDialogHelper.toast(['roles.deleted', name]);
                this.ngModelCtrl.$setViewValue(null);
            }, error => {
                this.maDialogHelper.errorToast(['roles.errorDeleting', name, error.mangoStatusText]);
            });
        }).catch(e => null).finally(() => delete this.deleting);
    }
}

export default {
    controller: RoleEditorController,
    template: roleEditorTemplate,
    bindings: {
        disabledAttr: '@?disabled'
    },
    require: {
        ngModelCtrl: 'ngModel'
    }
};
