/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import menuTemplate from './menu.html';
import angular from 'angular';


MenuController.$inject = [];
function MenuController() {
    this.childVisible = function childVisible(menuItems) {
        var visibleCount = 0;
        for (var i = 0; i < menuItems.length; i++) {
            var menuItem = menuItems[i];
            
            var info = this.visibleMap[menuItem.name] = {};
            
            if (menuItem.children && menuItem.abstract) {
                info.visibleChildren = this.childVisible(menuItem.children);
                info.visible = !menuItem.menuHidden && !!info.visibleChildren && this.user.hasPermission(menuItem.permission);
            } else {
                info.visible = !menuItem.menuHidden && this.user.hasPermission(menuItem.permission);
            }
            if (info.visible) {
                visibleCount++;
            }
        }
        return visibleCount;
    };

    this.$onChanges = function(changes) {
        if (this.user && this.origMenuItems) {
            this.copyMenu();
        }
    };
    
    this.copyMenu = function() {
        var items = this.origMenuItems;
        this.visibleMap = {};
        this.childVisible(items);
        this.menuItems = items;
    };
    
    this.isVisible = function(item) {
        return this.visibleMap[item.name].visible;
    };
    
    this.menuOpened = function menuOpened(toggleCtrl) {
        var submenu = null;
        var ctrl = toggleCtrl;
        while(ctrl) {
            if (ctrl.item.submenu) {
                submenu = ctrl.item;
                break;
            }
            ctrl = ctrl.parentToggle;
        }
        this.openSubmenu = submenu;
        
        this.openMenu = toggleCtrl.item;
        this.openMenuLevel = toggleCtrl.menuLevel + 1;
    };
    
    this.menuClosed = function menuOpened(toggleCtrl) {
        if (this.openSubmenu && toggleCtrl.item.name === this.openSubmenu.name) {
            delete this.openSubmenu;
        }
        if (this.openMenu && this.openMenu.name.indexOf(toggleCtrl.item.name) === 0) {
            this.openMenu = toggleCtrl.parentToggle ? toggleCtrl.parentToggle.item : null;
            this.openMenuLevel = toggleCtrl.menuLevel;
        }
    };
}

export default {
    controller: MenuController,
    template: menuTemplate,
    bindings: {
        origMenuItems: '<menuItems',
        user: '<user'
    }
};


