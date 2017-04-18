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
            // TODO move this to the Menu service
//            Menu.storeObject.jsonData = payload.object.jsonData;
//            Menu.storeObject.readPermission = payload.object.readPermission;
//            Menu.storeObject.editPermission = payload.object.editPermission;
//            Menu.storeObject.name = payload.object.name;
//            Menu.combineMenuItems();
            this.createMenuItemArray(Menu.menuHierarchy);
        }
    }.bind(this);
    
    this.retrieveMenu = function() {
        Menu.getMenuHierarchy().then(function(menuHierarchy) {
            this.createMenuItemArray(menuHierarchy);
        }.bind(this));
    };
    
    this.createMenuItemArray = function(menuHierarchy) {
        // combine root menu items and items under ui into a top level menu array
        var menuItems = [];
        menuHierarchy.children.forEach(function(item) {
            if (item.name === 'ui') {
                Array.prototype.push.apply(menuItems, item.children);
            } else {
                menuItems.push(item);
            }
        });
        this.menuItems = menuItems;
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
