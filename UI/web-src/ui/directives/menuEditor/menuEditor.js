/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import menuEditorTemplate from './menuEditor.html';
import './menuEditor.css';
import angular from 'angular';

menuEditorDirective.$inject = ['maUiMenu', '$mdDialog', 'maTranslate', '$mdMedia', 'maUiMenuEditor'];
function menuEditorDirective(Menu, $mdDialog, Translate, $mdMedia, maUiMenuEditor) {

    class MenuEditorController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$element']; }

        constructor($element) {
            this.$element = $element;
            this.$mdMedia = $mdMedia;
        }

        $onInit() {
            this.getHierarchy();
        }

        scrollToTopOfMdContent() {
            let elem = this.$element[0];
            while ((elem = elem.parentElement)) {
                if (elem.tagName === 'MD-CONTENT') {
                    elem.scrollTop = 0;
                    break;
                }
            }
        }

        setHierarchy(menuHierarchy) {
            this.menuHierarchy = angular.copy(menuHierarchy);
            this.path = [];
            this.enterSubmenu(null, this.menuHierarchy);

            const uiItem = this.menuHierarchy.children.find(item => item.name === 'ui');
            if (uiItem) {
                this.enterSubmenu(null, uiItem);
            }
        }

        getHierarchy() {
            Menu.getMenuHierarchy().then(h => this.setHierarchy(h));
        }

        enterSubmenu(event, menuItem) {
            this.path.push(menuItem);
            this.currentItem = menuItem;
            this.getChildren();
            this.scrollToTopOfMdContent();
        }

        goToIndex(event, index) {
            this.path.splice(index+1, this.path.length - 1 - index);
            this.currentItem = this.path[this.path.length-1];
            this.getChildren();
            this.scrollToTopOfMdContent();
        }

        getChildren() {
            this.editItems = this.currentItem.children || [];
        }

        deleteCustomMenu(event) {
            const confirm = $mdDialog.confirm()
                .title(Translate.trSync('ui.app.areYouSure'))
                .textContent(Translate.trSync('ui.app.confirmRestoreDefaultMenu'))
                .ariaLabel(Translate.trSync('ui.app.areYouSure'))
                .targetEvent(event)
                .ok(Translate.trSync('common.ok'))
                .cancel(Translate.trSync('common.cancel'));

            $mdDialog.show(confirm).then(() => {
                Menu.deleteMenu().then(h => this.setHierarchy(h));
            });
        }

        removeItem(toBeRemoved) {
            const index = this.editItems.findIndex(item => toBeRemoved.name === item.name);
            if (index >= 0) {
                this.editItems.splice(index, 1);
            }
        }

        createNewChild() {
            return {
                isNew: true,
                name: this.currentItem.name ? this.currentItem.name + '.' : '',
                url: '/',
                parent: this.currentItem,
                linkToPage: true,
                permission: []
            };
        }

        editItem(event, origItem = this.createNewChild()) {
            const parent = origItem.parent;
            const isNew = origItem.isNew;

            maUiMenuEditor.editMenuItem(event, this.menuHierarchy, origItem).then(item => {
                const newParent = item.parent;

                // remove item from the original parent's children if it was deleted or moved
                if (!isNew && (item.deleted || parent !== newParent)) {
                    const index = parent.children.findIndex(item => item.name === origItem.name);
                    if (index >= 0) {
                        parent.children.splice(index, 1);
                    }
                    if (!parent.children.length) {
                        delete parent.children;
                    }
                    if (item.deleted) {
                        return;
                    }
                }

                // copy item properties back onto original item
                if (!isNew) {
                    const children = origItem.children;

                    // update child state names
                    if (item.name !== origItem.name) {
                        Menu.forEach(children, child => {
                            const search = origItem.name + '.';
                            if (child.name.indexOf(search) === 0) {
                                child.name = item.name + '.' + child.name.substring(search.length);
                            } else {
                                throw new Error('child has invalid name: ' + child.name);
                            }
                        });
                    }

                    // prevent stack overflow from cyclic copy of children/parent
                    delete item.children;
                    delete item.parent;

                    item = angular.copy(item, origItem);

                    // set the original children/parent back on the item
                    item.children = children;
                    item.parent = newParent;
                }

                // add item back into new parent's children
                if (isNew || parent !== newParent) {
                    if (!newParent.children)
                        newParent.children = [];
                    newParent.children.push(item);

                    // sort array by weight then name
                    Menu.sortMenuItems(newParent.children);
                }
            }, () => null);
        }

        /**
         * updates the weights, attempting to keep them as close as possible to the original array
         * @param menuItem
         */
        updateWeights(menuItem = this.menuHierarchy) {
            let weight = -Infinity;
            menuItem.children.forEach((item, index, array) => {
                if (item.weight > weight) {
                    weight = item.weight;
                } else {
                    if (index !== 0 && array[index - 1].name > item.name) {
                        weight++;
                    }
                    item.weight = weight;
                }
                if (Array.isArray(item.children)) {
                    this.updateWeights(item);
                }
            });
        }

        saveMenu() {
            this.updateWeights();
            Menu.saveMenu(this.menuHierarchy).then(h => this.setHierarchy(h));
        }
    }

    return {
        restrict: 'E',
        scope: {},
        template: menuEditorTemplate,
        controller: MenuEditorController,
        controllerAs: '$ctrl',
        bindToController: true
    };
}

export default menuEditorDirective;
