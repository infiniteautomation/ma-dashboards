/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

PermissionsMenuController.$inject = ['maPermissions'];
function PermissionsMenuController(Permissions) {
    this.Permissions = Permissions;
    this.permissions = [];
    this.permissionsByName = {};
}

PermissionsMenuController.prototype.$onInit = function() {
    this.ngModelCtrl.$render = this.render.bind(this);
    
    this.Permissions.getAll().then(function(permissions) {
        for (var i = 0; i < permissions.length; i++) {
            var permName = permissions[i];
            if (this.permissionsByName[permName]) {
                this.permissionsByName[permName].fromRest = true;
            } else {
                var permission = {name: permName, value: false, fromRest: true};
                this.permissions.push(permission);
                this.permissionsByName[permName] = permission;
            }
        }
    }.bind(this));
};

// ng-model value changed outside of this directive
PermissionsMenuController.prototype.render = function render() {
    var permission;
    
    // remove all permissions not retrieved from REST
    for (var i = 0; i < this.permissions.length;) {
        permission = this.permissions[i];
        if (!permission.fromRest) {
            this.permissions.splice(i, 1);
            delete this.permissionsByName[permission.name];
        } else {
            i++;
        }
    }
    
    // undefined if invalid
    if (this.ngModelCtrl.$viewValue) {
        var array = this.ngModelCtrl.$viewValue.split(',');
        for (i = 0; i < array.length; i++) {
            var permName = array[i].trim();
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
    var permissionNames = [];
    for (var i = 0; i < this.permissions.length; i++) {
        var permission = this.permissions[i];
        if (permission.value) {
            permissionNames.push(permission.name);
        }
    }
    this.ngModelCtrl.$setViewValue(permissionNames.join(', '));
};

return {
    controller: PermissionsMenuController,
    templateUrl: require.toUrl('./permissionsMenu.html'),
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {}
};

}); // define
