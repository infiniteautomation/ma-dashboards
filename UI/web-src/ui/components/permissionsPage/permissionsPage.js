/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import permissionsPageTemplate from './permissionsPage.html';
import './permissionsPage.css';

class PermissionsPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maSystemPermission']; }
    
    constructor(maSystemPermission) {
        this.maSystemPermission = maSystemPermission;
    }
    
    $onInit() {
        this.maSystemPermission.buildQuery()
            .sort('moduleName', 'name')
            .query().then((permissions) => {
                this.permissions = permissions;
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
