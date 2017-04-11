/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

var SUBSCRIPTION_TYPES = ['add', 'update', 'delete'];

var jsonStoreMenuController = function jsonStoreMenuController($scope, Menu, jsonStoreEventManager, CUSTOM_USER_MENU_XID) {
    this.$onInit = function() {
        Menu.getMenu().then(function(storeObject) {
            this.menuItems = storeObject.jsonData.menuItems;
        }.bind(this));
        
        jsonStoreEventManager.smartSubscribe($scope, CUSTOM_USER_MENU_XID, SUBSCRIPTION_TYPES, this.updateHandler);
    };

    this.updateHandler = function updateHandler(event, payload) {
        this.menuItems = payload.action === 'delete' ? Menu.getDefaultMenu().jsonData.menuItems : payload.object.jsonData.menuItems;
    }.bind(this);
};

jsonStoreMenuController.$inject = ['$scope', 'Menu', 'jsonStoreEventManager', 'CUSTOM_USER_MENU_XID'];

return {
    controller: jsonStoreMenuController,
    template: '<dashboard-menu menu-items="$ctrl.menuItems" user="$ctrl.user"></dashboard-menu>',
    bindings: {
        user: '<user'
    }
};

}); // define
