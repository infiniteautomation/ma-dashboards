/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import permissionEditorTemplate from './permissionEditor.html';
import './permissionEditor.css';

class PermissionEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', 'maPermission', 'maSystemPermission', 'maDialogHelper', '$q', 'maMultipleValues']; }
    
    constructor($element, maPermission, maSystemPermission, maDialogHelper, $q, maMultipleValues) {
        this.maPermission = maPermission;
        this.maSystemPermission = maSystemPermission;
        this.maDialogHelper = maDialogHelper;
        this.$q = $q;
        this.maMultipleValues = maMultipleValues;
        $element.addClass( 'ma-permission-editor-row');
    }
    
    $onInit() {
        this.containerCtrl.register(this);
        if (this.ngModelCtrl) {
            this.ngModelCtrl.$render = () => this.render();
        }
    }

    $onChanges(changes) {
        if (changes.systemPermissionName && !this.ngModelCtrl) {
            if (this.systemPermissionName) {
                const permission = this.systemPermission = new this.maSystemPermission({
                    name: this.systemPermissionName
                });

                this.systemPermission.get().then(() => {
                    if (permission === this.systemPermission) {
                        this.render();
                    }
                }, error => {
                    if (permission === this.systemPermission) {
                        this.maDialogHelper.errorToast(['ui.permissions.errorGettingPermission', error.mangoStatusText]);
                        this.clearColumns();
                    }
                });
            } else {
                delete this.systemPermission;
                this.clearColumns();
            }
        }
    }

    $onDestroy() {
        this.containerCtrl.deregister(this);
    }

    render() {
        const viewValue = this.ngModelCtrl && this.ngModelCtrl.$viewValue ||
            this.systemPermission && this.systemPermission.permission || [];

        this.hasMultipleValues = this.maMultipleValues.hasMultipleValues(viewValue);
        if (this.hasMultipleValues) {
            const [first] = this.maMultipleValues.toArray(viewValue, 1);
            this.permission = new this.maPermission(first);
        } else {
            this.permission = new this.maPermission(viewValue);
        }

        const minterms = this.containerCtrl.minterms;
        this.columns = minterms.map(minterm => {
            const hasSuperadmin = minterm.has('superadmin');
            const checked = hasSuperadmin || this.permission.has(minterm);
            return {
                minterm,
                checked,
                hasSuperadmin
            };
        });

        this.additionalMinterms = this.permission.minterms.filter(a => !minterms.some(b => a.equals(b)));

        const mintermRoles = this.additionalMinterms.map(t => t.roles);
        this.containerCtrl.roleCache.loadItems([].concat(...mintermRoles));
    }

    clearColumns() {
        delete this.permission;
        delete this.columns;
        delete this.additionalMinterms();
    }
    
    columnChanged(column) {
        this.hasMultipleValues = false;

        if (column.checked) {
            this.permission.add(column.minterm);
        } else {
            this.permission.delete(column.minterm);
        }

        const permissionModel = this.permission.toArray();
        if (this.ngModelCtrl) {
            this.ngModelCtrl.$setViewValue(permissionModel);
        } else if (this.systemPermission) {
            this.systemPermission.permission = permissionModel;
            this.savePermission();
        }
    }

    savePermission() {
        const permission = this.systemPermission;
        delete permission.errors;
        delete permission.validationMessage;
        permission.promise = permission.save().catch(error => {
            if (error.status === 422) {
                permission.errors = {validationMessage: true};
                permission.validationMessage = error.mangoStatusText;
            } else {
                this.maDialogHelper.errorToast(['ui.permissions.errorSavingPermission', error.mangoStatusText]);
            }
            return this.$q.reject(error);
        });
    }
}

export default {
    transclude: true,
    require: {
        ngModelCtrl: '?ngModel',
        containerCtrl: '^^maPermissionEditorContainer'
    },
    bindings: {
        description: '@?',
        systemPermissionName: '@?',
        disabled: '<?ngDisabled'
    },
    controller: PermissionEditorController,
    template: permissionEditorTemplate
};
