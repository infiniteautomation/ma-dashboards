/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import permissionsPageTemplate from './permissionsPage.html';
import './permissionsPage.css';

const filterSearchKeys = ['moduleName', 'moduleDescription', 'description', 'name'];

class PermissionsPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maSystemPermission']; }
    
    constructor(maSystemPermission) {
        this.maSystemPermission = maSystemPermission;
    }
    
    $onInit() {
        this.getPermissions();
    }
    
    getPermissions() {
        
        this.maSystemPermission.buildQuery()
        .sort('moduleName', 'name')
        .query().then((permissions) => {
            this.allPermissions = permissions;
            this.filterPermissions();
        });
    }
    
    filterPermissions() {
        this.permissions = {};
        const filter = this.filter && this.filter.toLowerCase();
        
        this.allPermissions.filter(permission => {
            if (!filter) return true;
            return filterSearchKeys.some(k => permission[k].toLowerCase().includes(filter));
        }).forEach(permission => {
            if (!this.permissions[permission.moduleName]) {
                this.permissions[permission.moduleName] = [];
            }
            this.permissions[permission.moduleName].push(permission);
        });
    }
    
    savePermission(permission) {
        const ngModelCtrl = this.form && this.form[permission.name];
        
        permission.save().then(() => {
            if (ngModelCtrl) {
                modelCtrl.$setValidity('validationMessage', true);
                delete modelCtrl.validationMessage;
            }
        }, error => {
            if (error.status === 422 && ngModelCtrl) {
                ngModelCtrl.$setValidity('validationMessage', false);
                ngModelCtrl.validationMessage = error.mangoStatusText;
            } else {
                // TODO notify
            }
        });
    }
}

export default {
    bindings: {
    },
    controller: PermissionsPageController,
    template: permissionsPageTemplate
};
