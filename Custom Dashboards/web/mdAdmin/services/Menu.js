/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

function MenuFactory(MENU_ITEMS, mdAdminSettings, JsonStore, CUSTOM_USER_MENU_XID, $q) {

    var firstRun = true;
    
    function Menu() {
    }
    
    Menu.prototype.getMenu = function getMenu() {
        // custom menu items are retrieved on bootstrap, don't get them twice on app startup
        // after first run use the standard JsonStore http request
        if (firstRun) {
            firstRun = false;
            var menuStore = this.getDefaultMenu();
            if (mdAdminSettings.customMenuItems) {
                menuStore.jsonData.menuItems = mdAdminSettings.customMenuItems;
            }
            return $q.when(menuStore);
        }
        return JsonStore.get({xid: CUSTOM_USER_MENU_XID}).$promise.then(null, function() {
            // no menu exists in JsonStore, create one
            return this.getDefaultMenu();
        }.bind(this));
    };
    
    Menu.prototype.getDefaultMenu = function getDefaultMenu() {
        var storeObject = new JsonStore();
        storeObject.xid = CUSTOM_USER_MENU_XID;
        storeObject.name = CUSTOM_USER_MENU_XID;
        storeObject.jsonData = {};
        storeObject.editPermission = 'edit-menus';
        storeObject.readPermission = 'user';
        
        var menuItems = angular.copy(MENU_ITEMS);
        var i = 1;
        this.eachMenuItem(menuItems, null, function(menuItem) {
            menuItem.id = i++;
            menuItem.builtIn = true;
        });
        storeObject.jsonData.menuItems = menuItems;
        storeObject.jsonData.defaultUrl = '/home';
        
        return storeObject;
    };
    
    Menu.prototype.eachMenuItem = function eachMenuItem(menuItems, parent, fn) {
        if (!menuItems) return;
        for (var i = 0; i < menuItems.length; i++) {
            var menuItem = menuItems[i];
            var result = fn(menuItem, parent, menuItems, i);
            if (result === 'continue') continue;
            else if (result) return result;
            result = this.eachMenuItem(menuItem.children, menuItem, fn);
            if (result) return result;
        }
    };

    return new Menu();
}

MenuFactory.$inject = ['MENU_ITEMS', 'mdAdminSettings', 'JsonStore', 'CUSTOM_USER_MENU_XID', '$q'];
return MenuFactory;

}); // define
