/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import permissionsPageTemplate from './permissionsPage.html';
import './permissionsPage.css';

const filterSearchKeys = ['moduleName', 'moduleDescription', 'description', 'name'];

class PermissionsPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maSystemPermission', '$q', 'maDialogHelper']; }
    
    constructor(maSystemPermission, $q, maDialogHelper) {
        this.maSystemPermission = maSystemPermission;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
    }
    
    $onInit() {
        this.getPermissions();
    }
    
    getPermissions() {
        const queryPromise = this.maSystemPermission.buildQuery()
        .sort('moduleName', 'name')
        .query().then((permissions) => {
            this.permissions = permissions;
            this.filterPermissions();
        }).finally(() => {
            if (this.permissionQuery === queryPromise) {
                delete this.permissionQuery
            }
        });
        
        return (this.permissionQuery = queryPromise);
    }
    
    filterPermissions() {
        const modules = {};
        const filter = this.filter && this.filter.toLowerCase();
        
        this.permissions.filter(permission => {
            if (!filter) return true;
            return filterSearchKeys.some(k => permission[k].toLowerCase().includes(filter));
        }).forEach(permission => {
            let module = modules[permission.moduleName];
            if (!module) {
                module = modules[permission.moduleName] = {
                    name: permission.moduleName,
                    description: permission.moduleDescription,
                    permissions: []
                };
            }
            module.permissions.push(permission);
        });
        
        this.modules = Object.values(modules);
        
        const current = this.selectedModule && this.modules.find(m => m.name === this.selectedModule.name);
        if (current) {
            this.selectedModule = current;
        } else {
            this.selectedModule = this.modules.find(m => m.name === 'core') || this.modules[0];
        }
    }
    
    savePermission(permission) {
        const ngModelCtrl = this.form && this.form[permission.name];
        
        permission.promise = permission.save().then(() => {
            if (ngModelCtrl) {
                ngModelCtrl.$setValidity('validationMessage', true);
                delete ngModelCtrl.validationMessage;
            }
        }, error => {
            if (error.status === 422 && ngModelCtrl) {
                ngModelCtrl.$setValidity('validationMessage', false);
                ngModelCtrl.validationMessage = error.mangoStatusText;
            } else {
                this.maDialogHelper.errorToast(['ui.components.errorSavingSettings', error.mangoStatusText]);
            }
            return this.$q.reject(error);
        });
    }
}

export default {
    bindings: {
    },
    controller: PermissionsPageController,
    template: permissionsPageTemplate
};
