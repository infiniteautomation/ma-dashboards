/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import permissionsPageTemplate from './permissionsPage.html';
import './permissionsPage.css';

const filterSearchKeys = ['groupTitle', 'groupDescription', 'description', 'name'];

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
                .sort('groupName', 'name')
                .query();
        }
        return this.queryPromise;
    }
    
    filterPermissions(filter) {
        return this.getPermissions().then((permissions) => {
            const groups = {};

            permissions.filter(permission => {
                return !filter || filterSearchKeys.some(k => permission[k].toLowerCase().includes(filter.toLowerCase()));
            }).forEach(permission => {
                let group = groups[permission.groupName];
                if (!group) {
                    group = groups[permission.groupName] = {
                        name: permission.groupName,
                        title: permission.groupTitle,
                        description: permission.groupDescription,
                        permissions: []
                    };
                }
                group.permissions.push(permission);
            });

            this.groups = Object.values(groups);

            // sort the modules by description
            // this.groups.sort(sortByDescription);

            // sort each module's permissions by description
            this.groups.forEach(module => {
                module.permissions.sort(sortByDescription);
            });

            // ensure that one section is expanded
            this.expanded = {};
            const noneExpanded = Object.values(this.expanded).every(v => !v);
            if (noneExpanded) {
                const module = this.groups.find(m => m.name === 'core') || this.groups[0];
                if (module) {
                    this.expanded[module.name] = true;
                }
            }

            return this.groups;
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
