/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import menuToggleTemplate from './menuToggle.html';

// in pixels, this used to be calculated using clientHeight but it stopped working in Chrome 87 so its now hardcoded
const menuItemHeight = 40;

class MenuToggleController {

    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$state', '$timeout', '$element', '$scope', 'maTranslate']; }

    constructor($state, $timeout, $element, $scope, Translate) {
        this.$state = $state;
        this.$timeout = $timeout;
        this.$element = $element;
        this.$scope = $scope;
        this.Translate = Translate;
    }

    $onInit() {
        this.menuLevel = this.parentToggle ? this.parentToggle.menuLevel + 1 : 1;
        this.height = 0;
        this.addedHeight = 0;
        
        // close/open menus when changing states
        this.$scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
            if (this.$state.includes(this.item.name)) {
                this.open();
            } else {
                //this.close();
            }
        });

        // recalculate height on switch user
        this.$scope.$maSubscribe('maUser/currentUserChanged', (event, user) => {
            // ignore logout
            if (user != null) {
                this.$timeout(() => this.calcHeight(), 0);
            }
        });
    }

    $onChanges(changes) {
        if (changes.openMenu) {
            if (this.isOpen && (!this.openMenu || this.openMenu.name.indexOf(this.item.name) !== 0)) {
                this.close();
            }
        }
        if (changes.item) {
            if (!changes.item.isFirstChange()) {
                const info = this.menu.visibleMap[changes.item.currentValue.name];
                if (info.visibleChildren !== this.prevVisibleChildren) {
                    this.prevVisibleChildren = info.visibleChildren;
                    // do on next cycle as elements have not been added/removed yet
                    this.$timeout(() => this.calcHeight(), 0);
                }
            }

            this.menuText = this.item.menuText;
            if (!this.menuText) {
                this.Translate.tr(this.item.menuTr).then(text => this.menuText = text);
            }
        }
    }
    
    isVisible(item) {
        if (!this.menu) return false;
        return this.menu.visibleMap[item.name].visible;
    }

    $postLink() {
        this.$ul = this.$element.maFind('ul');
        this.calcHeight();
        if (this.$state.includes(this.item.name) && !this.isOpen) {
            this.open();
        }
    }
    
    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        if (this.parentToggle) {
            // ensures the transition property is recalculated, use if doing calcHeight() above
            //$window.getComputedStyle(this.parentToggle.$ul[0]).transition;
            this.parentToggle.addHeight(this.height);
        }
        
        this.menu.menuOpened(this);
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        if (this.parentToggle) {
            this.parentToggle.addHeight(-this.height);
        }
        
        this.menu.menuClosed(this);
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * calculates the height of ul and sets its height style so transition works correctly
     */
    calcHeight() {
        this.height = this.menu.visibleMap[this.item.name].visibleChildren * menuItemHeight;
        this.$ul.css({
            height: (this.height + this.addedHeight) + 'px'
        });
    }

    /**
     * calculates the ul's current height and adds x pixels to the css height
     * @param add
     */
    addHeight(add) {
        this.addedHeight += add;

        this.$ul.css({
            height: (this.height + this.addedHeight) + 'px'
        });
    }
}

export default {
    controller: MenuToggleController,
    require: {
        menu: '^^maUiMenu',
        parentToggle: '?^^maUiMenuToggle'
    },
    template: menuToggleTemplate,
    bindings: {
        item: '<menuItem',
        openMenu: '<'
    }
};
