/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';

UiMenuController.$inject = [];
function UiMenuController() {
    this.childVisible = function childVisible(menuItems) {
        var visibleCount = 0;
        for (var i = 0; i < menuItems.length; i++) {
            var menuItem = menuItems[i];
            
            if (menuItem.children) {
                menuItem.visibleChildren = this.childVisible(menuItem.children);
                menuItem.visible = !menuItem.menuHidden && !!menuItem.visibleChildren && this.user.hasPermission(menuItem.permission);
            } else {
                menuItem.visible = !menuItem.menuHidden && this.user.hasPermission(menuItem.permission);
            }
            if (menuItem.visible) {
                visibleCount++;
            }
        }
        return visibleCount;
    };

    this.$onChanges = function(changes) {
        if (this.user && this.menuItems) {
            this.childVisible(this.menuItems);
        } else {
            this.menuItems = [];
        }
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

return {
    controller: UiMenuController,
    templateUrl: require.toUrl('./uiMenu.html'),
    bindings: {
        menuItems: '<',
        user: '<user'
    }
};

}); // define
