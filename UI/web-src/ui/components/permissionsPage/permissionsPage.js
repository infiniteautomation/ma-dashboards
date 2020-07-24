/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import permissionsPageTemplate from './permissionsPage.html';
import './permissionsPage.css';

const filterSearchKeys = ['moduleName', 'moduleDescription', 'description', 'name'];

const sortByDescription = (a, b) => {
    if (a.description < b.description) return -1;
    if (a.description > b.description) return 1;
    return 0;
};

class PermissionsPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maSystemPermission', '$q', 'maDialogHelper']; }
    
    constructor(maSystemPermission, $q, maDialogHelper) {
        this.maSystemPermission = maSystemPermission;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
        this.expanded = {};
    }
    
    $onInit() {
        this.filterPermissions();
    }
    
    getPermissions(refresh = false) {
        if (!this.queryPromise || refresh) {
            this.queryPromise = this.maSystemPermission.buildQuery()
                .sort('moduleName', 'name')
                .query();
        }
        return this.queryPromise;
    }
    
    filterPermissions(filter) {
        return this.getPermissions().then((permissions) => {
            const modules = {};

            permissions.filter(permission => {
                return !filter || filterSearchKeys.some(k => permission[k].toLowerCase().includes(filter.toLowerCase()));
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

            // sort the modules by description
            // this.modules.sort(sortByDescription);

            // sort each module's permissions by description
            this.modules.forEach(module => {
                module.permissions.sort(sortByDescription);
            });

            // ensure that one section is expanded
            this.expanded = {};
            const noneExpanded = Object.values(this.expanded).every(v => !v);
            if (noneExpanded) {
                const module = this.modules.find(m => m.name === 'core') || this.modules[0];
                if (module) {
                    this.expanded[module.name] = true;
                }
            }

            return this.modules
        });
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
                this.maDialogHelper.errorToast(['ui.permissions.errorSavingPermission', error.mangoStatusText]);
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
