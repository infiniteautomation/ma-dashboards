/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

MenuEditorFactory.$inject = ['Menu', '$mdDialog', 'Translate', 'Page', '$q'];
function MenuEditorFactory(Menu, $mdDialog, Translate, Page, $q) {

    function MenuEditor() {
    }
    
    MenuEditor.prototype.getMenuItemForPageXid = function getMenuItemForPageXid(pageXid) {
        return Menu.getMenu().then(function(menuItems) {
            var menuItem = null;
            menuItems.some(function(item) {
                if (item.linkToPage && item.pageXid === pageXid) {
                    menuItem = item;
                    return true;
                }
            });
            return menuItem;
        });
    };
    
    MenuEditor.prototype.editMenuItemForPageXid = function editMenuItemForPageXid(event, pageXid, defaults) {
        return this.getMenuItemForPageXid(pageXid).then(function(menuItem) {
            if (!menuItem) {
                menuItem = {
                    isNew: true,
                    name: 'ui.',
                    url: '/',
                    pageXid: pageXid,
                    linkToPage: true,
                    parent: Menu.menuHierarchy
                };
                if (defaults) {
                    angular.merge(menuItem, defaults);
                }
            }
            
            return this.editMenuItem(event, Menu.menuHierarchy, menuItem).then(function(newItem) {
                if (newItem.deleted) {
                    return Menu.removeMenuItem(menuItem.name).then(function() {
                        return null;
                    });
                } else {
                    return Menu.saveMenuItem(newItem, !menuItem.isNew && menuItem.name).then(function() {
                        return newItem;
                    });
                }
            });
        }.bind(this));
    };
    
    MenuEditor.prototype.editMenuItem = function editMenuItem(event, menuHierarchy, origItem) {
            // build flat menu item array so we can choose any item in dropdown
            var menuItems = [];
            var menuItemNameMap = {};
            
            Menu.forEach(menuHierarchy.children, function(menuItem) {
                menuItems.push(menuItem);
                menuItemNameMap[menuItem.name] = true;
            });

            // copy the item so we can discard changes
            var item = angular.copy(origItem);
            item.parent = origItem.parent;
            
            if (!item.name) {
                item.shortStateName = '';
            } else {
                var splitName = item.name.trim().split('.');
                item.shortStateName = splitName[splitName.length-1];
            }
            
            if (!item.menuHidden) {
                item.showOnMenu = true;
            }
            
            if (!item.dateBarOptions) {
                if (item.params && item.params.dateBar) {
                    item.dateBarOptions = item.params.dateBar.rollupControls ? 'dateAndRollup' : 'date';
                } else {
                    item.dateBarOptions = 'none';
                }
            }
            
            return $mdDialog.show({
                templateUrl: require.toUrl('./MenuEditorDialog.html'),
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                fullscreen: true,
                bindToController: true,
                controllerAs: '$ctrl',
                locals: {
                    item: item,
                    allMenuItems: menuItems,
                    root: menuHierarchy
                },
                controller: ['$mdDialog', function editItemController($mdDialog) {
                    var urlPathMap = {};
                    this.item.parent.children.forEach(function(item) {
                        urlPathMap[item.url] = true;
                    });

                    this.menuItems = this.allMenuItems.filter(function(item) {
                        return item.abstract && item.name !== this.item.name;
                    }.bind(this));

                    Page.getPages().then(function(store) {
                        this.pages = store.jsonData.pages;
                    }.bind(this));
                    
                    this.stateNameChanged = function() {
                        this.calculateStateName();
                        this.menuItemEditForm.stateName.$setValidity('stateExists', this.item.name === origItem.name || !menuItemNameMap[this.item.name]);
                    };

                    this.urlChanged = function() {
                        this.menuItemEditForm.url.$setValidity('urlExists', this.item.url === origItem.url || !urlPathMap[this.item.url]);
                    };
                    
                    this.cancel = function cancel() {
                        $mdDialog.cancel();
                    };
                    
                    this.save = function save() {
                        if (this.menuItemEditForm.$valid) {
                            $mdDialog.hide();
                        }
                    };
                    
                    this.deleteItem = function() {
                        this.item.deleted = true;
                        $mdDialog.hide();
                    };
                    
                    this.parentChanged = function() {
                        this.calculateStateName();
                    };
                    
                    this.calculateStateName = function() {
                        if (this.item.parent.name) {
                            this.item.name = this.item.parent.name + '.' + this.item.shortStateName;
                        } else {
                            this.item.name = this.item.shortStateName;
                        }
                    };
                }]
            }).then(function() {
                delete item.isNew;
                delete item.shortStateName;

                item.menuHidden = !item.showOnMenu;
                delete item.showOnMenu;
                
                if (item.templateUrl || item.template || item.linkToPage) {
                    delete item.abstract;
                    delete item.children;
                } else {
                    item.abstract = true;
                }

                switch(item.dateBarOptions) {
                case 'date': {
                    if (!item.params) item.params = {};
                    item.params.dateBar = {};
                    break;
                }
                case 'dateAndRollup': {
                    if (!item.params) item.params = {};
                    item.params.dateBar = {
                        rollupControls: true
                    };
                    break;
                }
                default:
                    if (item.params) {
                        delete item.params.dateBar;
                    }
                }
                delete item.dateBarOptions;
                
                // jshint eqnull:true
                if (item.weight == null) {
                    item.weight = 1000;
                }

                return item;
            });
    };

    return new MenuEditor();
}

return MenuEditorFactory;

}); // define
