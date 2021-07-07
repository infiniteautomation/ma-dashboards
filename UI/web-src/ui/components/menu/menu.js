/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import menuTemplate from './menu.html';
import './menu.css';

class MenuController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }

    childVisible(menuItems) {
        let visibleCount = 0;
        for (let i = 0; i < menuItems.length; i++) {
            const menuItem = menuItems[i];
            
            const info = this.visibleMap[menuItem.name] = {};
            
            if (menuItem.children && menuItem.abstract) {
                info.visibleChildren = this.childVisible(menuItem.children);
                info.visible = !menuItem.menuHidden &&
                    !!info.visibleChildren && (
                        this.user.hasPermission(menuItem.permission) ||
                        this.user.hasSystemPermission(...menuItem.systemPermission)
                    );
            } else {
                info.visible = !menuItem.menuHidden && (
                    this.user.hasPermission(menuItem.permission) ||
                    this.user.hasSystemPermission(...menuItem.systemPermission)
                );
            }
            if (info.visible) {
                visibleCount++;
            }
        }
        return visibleCount;
    }

    $onChanges(changes) {
        if (this.user && this.menuItems) {
            this.visibleMap = {};
            this.childVisible(this.menuItems);
        }
    }

    isVisible(item) {
        return this.visibleMap && this.visibleMap[item.name].visible;
    }
    
    menuOpened(toggleCtrl) {
        let submenu = null;
        let ctrl = toggleCtrl;
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
    }
    
    menuClosed(toggleCtrl) {
        if (this.openSubmenu && toggleCtrl.item.name === this.openSubmenu.name) {
            delete this.openSubmenu;
        }
        if (this.openMenu && this.openMenu.name.indexOf(toggleCtrl.item.name) === 0) {
            this.openMenu = toggleCtrl.parentToggle ? toggleCtrl.parentToggle.item : null;
            this.openMenuLevel = toggleCtrl.menuLevel;
        }
    }
}

export default {
    controller: MenuController,
    template: menuTemplate,
    bindings: {
        menuItems: '<',
        user: '<'
    }
};
