/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import permissionsMenuTemplate from './permissionsMenu.html';

PermissionsMenuController.$inject = ['maPermissions'];
function PermissionsMenuController(Permissions) {
    this.Permissions = Permissions;
    this.permissions = [];
    this.permissionsByName = {};
}

PermissionsMenuController.prototype.$onInit = function() {
    this.ngModelCtrl.$render = this.render.bind(this);
    
    this.Permissions.getAll().then(function(permissions) {
        for (let i = 0; i < permissions.length; i++) {
            const permName = permissions[i];
            if (this.permissionsByName[permName]) {
                this.permissionsByName[permName].fromRest = true;
            } else {
                const permission = {name: permName, value: false, fromRest: true};
                this.permissions.push(permission);
                this.permissionsByName[permName] = permission;
            }
        }
    }.bind(this));
};

// ng-model value changed outside of this directive
PermissionsMenuController.prototype.render = function render() {
    let permission;
    
    // remove all permissions not retrieved from REST
    for (let i = 0; i < this.permissions.length;) {
        permission = this.permissions[i];
        if (!permission.fromRest) {
            this.permissions.splice(i, 1);
            delete this.permissionsByName[permission.name];
        } else {
        	permission.value = false;
            i++;
        }
    }
    
    // undefined if invalid
    if (this.ngModelCtrl.$viewValue) {
        let array;

        if (Array.isArray(this.ngModelCtrl.$viewValue)) {
            array = this.ngModelCtrl.$viewValue;
        } else {
            array = this.ngModelCtrl.$viewValue.split(','); 
        }
        
        for (let i = 0; i < array.length; i++) {
            const permName = array[i].trim();
            if (!permName) continue;
            
            if (this.permissionsByName[permName]) {
                this.permissionsByName[permName].value = true;
            } else {
                permission = {name: permName, value: true, fromRest: false};
                this.permissions.push(permission);
                this.permissionsByName[permName] = permission;
            }
        }
    }
};

PermissionsMenuController.prototype.checkboxChanged = function checkboxChanged() {
    const permissionNames = [];
    for (let i = 0; i < this.permissions.length; i++) {
        const permission = this.permissions[i];
        if (permission.value) {
            permissionNames.push(permission.name);
        }
    }
    this.ngModelCtrl.$setViewValue(permissionNames.join(', '));
};

export default {
    controller: PermissionsMenuController,
    template: permissionsMenuTemplate,
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
        disabled: '@?'
    },
    designerInfo: {
        translation: 'ui.components.maPermissionsMenu',
        icon: 'verified_user'
    }
};


