/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';

var SUBSCRIPTION_TYPES = ['add', 'update', 'delete'];

JsonStoreMenuController.$inject = ['$scope', 'Menu', 'jsonStoreEventManager', 'CUSTOM_USER_MENU_XID', 'JsonStore'];
function JsonStoreMenuController($scope, Menu, jsonStoreEventManager, CUSTOM_USER_MENU_XID, JsonStore) {

    this.$onInit = function() {
        this.retrieveMenu();
        jsonStoreEventManager.smartSubscribe($scope, CUSTOM_USER_MENU_XID, SUBSCRIPTION_TYPES, this.updateHandler);
    };

    this.updateHandler = function updateHandler(event, payload) {
        if (payload.action === 'delete') {
            this.retrieveMenu();
        } else {
            Menu.storeObject.jsonData = payload.object.jsonData;
            Menu.storeObject.readPermission = payload.object.readPermission;
            Menu.storeObject.editPermission = payload.object.editPermission;
            Menu.storeObject.name = payload.object.name;
            Menu.combineMenuItems();
            this.menuItems = Menu.menuHierarchy;
        }
    }.bind(this);
    
    this.retrieveMenu = function() {
        Menu.getMenuHierarchy().then(function(menuItems) {
            this.menuItems = menuItems;
        }.bind(this));
    };
}

return {
    controller: JsonStoreMenuController,
    template: '<ma-ui-menu menu-items="$ctrl.menuItems" user="$ctrl.user"></ma-ui-menu>',
    bindings: {
        user: '<user'
    }
};

}); // define
