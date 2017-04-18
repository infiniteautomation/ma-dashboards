/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', '../util/loadLoginTranslations'], function(angular, loadLoginTranslations) {
'use strict';

MenuProvider.$inject = ['$stateProvider', 'MENU_ITEMS', 'MD_ADMIN_SETTINGS'];
function MenuProvider($stateProvider, MENU_ITEMS, MD_ADMIN_SETTINGS) {
    // register the built in MENU_ITEMS
    registerStates(MENU_ITEMS);
    
    // register the custom menu items retrieved at bootstrap
    if (MD_ADMIN_SETTINGS.customMenuItems)
        // TODO check this isn't going to interfere with initial menu refresh, eg. missing template url
        // might have to copy first
        registerStates(MD_ADMIN_SETTINGS.customMenuItems);
    
    // Used by AngularJS modules to register a menu item
    this.registerMenuItems = function registerMenuItems(menuItems) {
        Array.prototype.push.apply(MENU_ITEMS, menuItems);
        registerStates(menuItems);
    };

    function registerStates(menuItems) {
        menuItems.forEach(function(menuItem) {
            if (!menuItem.name) return;

            if (menuItem.linkToPage) {
                delete menuItem.templateUrl;
                menuItem.template = '<page-view xid="' + menuItem.pageXid + '" flex layout="column"></page-view>';
            }

            if (menuItem.templateUrl) {
                delete menuItem.template;
            }
            if (!menuItem.templateUrl && !menuItem.template && !menuItem.views) {
                menuItem.template = '<div ui-view></div>';
                menuItem.abstract = true;
            }

            if (menuItem.name.indexOf('ui.') !== 0) {
                if (!menuItem.resolve) menuItem.resolve = {};
                if (!menuItem.resolve.loginTranslations) {
                    menuItem.resolve.loginTranslations = loadLoginTranslations;
                }
            }
            
            if (menuItem.name.indexOf('ui.examples.') === 0) {
                if (!menuItem.params) menuItem.params = {};
                menuItem.params.dateBar = {
                    rollupControls: true
                };
            }

            try {
                $stateProvider.state(menuItem);
            } catch (error) {
                var endsWith = 'is already defined';
                if (error.message && error.message.substr(-endsWith.length) === endsWith) {
                    // state already exists, this happens during normal operation
                    //console.log(error);
                } else {
                    console.error(error);
                }
            }
        });
    }

    this.$get = MenuFactory;

    MenuFactory.$inject = ['uiSettings', 'JsonStore', 'CUSTOM_USER_MENU_XID', '$q'];
    function MenuFactory(uiSettings, JsonStore, CUSTOM_USER_MENU_XID, $q) {
    
        function Menu() {
            this.storeObject = new JsonStore();
            this.storeObject.xid = CUSTOM_USER_MENU_XID;
            this.storeObject.name = CUSTOM_USER_MENU_XID;
            this.storeObject.editPermission = 'edit-menus';
            this.storeObject.readPermission = 'user';
            this.storeObject.jsonData = {
                menuItems: []
            };
    
            this.defaultMenuItems = MENU_ITEMS;
            this.defaultMenuItemsByName = {};
    
            this.defaultMenuItems.forEach(function(item) {
                item.builtIn = true;
                // jshint eqnull:true
                if (item.weight == null) {
                    item.weight = 1000;
                }
                this.defaultMenuItemsByName[item.name] = item;
            }.bind(this));
        }

        Menu.prototype.refresh = function refresh() {
            // custom menu items are retrieved on bootstrap, don't get them twice on app startup
            // after first run use the standard JsonStore http request
            if (uiSettings.customMenuItems) {
                this.storeObject.jsonData.menuItems = uiSettings.customMenuItems;
                delete uiSettings.customMenuItems;
                
                return $q.when(this.storeObject);
            }
            
            return JsonStore.get({xid: CUSTOM_USER_MENU_XID}).$promise.then(function(store) {
                return (this.storeObject = store);
            }.bind(this), function() {
                // CUSTOM_USER_MENU_XID doesn't exist, or error
                return this.storeObject;
            }.bind(this));
        };

        Menu.prototype.combineMenuItems = function combineMenuItems() {
            var customMenuItems = this.storeObject.jsonData.menuItems;
            this.menuItems = angular.copy(this.defaultMenuItems);
            this.menuItemsByName = {};
    
            this.menuItems.forEach(function(item) {
                this.menuItemsByName[item.name] = item;
            }.bind(this));
            
            customMenuItems.forEach(function(item) {
                if (this.menuItemsByName[item.name]) {
                    angular.merge(this.menuItemsByName[item.name], item);
                } else {
                    this.menuItems.push(item);
                    // jshint eqnull:true
                    if (item.weight == null) {
                        item.weight = 1000;
                    }
                }
            }.bind(this));
            
            this.menuHierarchy = unflattenMenu(this.menuItems);
            
            return this.menuItems;
        };

        Menu.prototype.getMenu = function getMenu() {
            return this.refresh().then(function(store) {
                return this.combineMenuItems();
            }.bind(this));
        };
        
        Menu.prototype.getMenuHierarchy = function getMenuHierarchy() {
            return this.getMenu().then(function() {
                return this.menuHierarchy;
            }.bind(this));
        };
        
        Menu.prototype.deleteMenu = function deleteMenu() {
            this.storeObject.jsonData.menuItems = [];
            return this.storeObject.$save().then(function() {
                return this.combineMenuItems();
            }.bind(this));
        };
        
        Menu.prototype.saveMenu = function saveMenu(menuHierarchy) {
            var newMenuItems = flattenMenu(menuHierarchy);
            
            var different = [];
            newMenuItems.forEach(function(item, index, array) {
                item = cleanMenuItemForSave(item);
                array.splice(index, 1, item);
                
                var originalItem = this.defaultMenuItemsByName[item.name];
                if (!originalItem) {
                    different.push(item);
                } else if (!angular.equals(item, originalItem)) {
                    var difference = calculateDifference(item, originalItem);
                    different.push(difference);
                    
                    if (Object.keys(difference).length === 1) {
                        debugger;
                    }
                }
            }.bind(this));
    
            this.storeObject.jsonData.menuItems = different;
            return this.storeObject.$save().then(function() {
                registerStates(newMenuItems);
                return this.combineMenuItems();
            }.bind(this));
        };

        Menu.prototype.saveMenuItem = function saveMenuItem(menuItem, originalName) {
            // removes the original item, takes care of renaming
            if (originalName) {
                this.storeObject.jsonData.menuItems.some(function(item, i, array) {
                    if (item.name === originalName) {
                        array.splice(i, 1);
                        return true;
                    }
                });
            }

            menuItem = cleanMenuItemForSave(menuItem);
            
            var originalItem = this.defaultMenuItemsByName[menuItem.name];
            if (!originalItem) {
                this.storeObject.jsonData.menuItems.push(menuItem);
            } else if (!angular.equals(menuItem, originalItem)) {
                var difference = calculateDifference(menuItem, originalItem);
                this.storeObject.jsonData.menuItems.push(difference);
            }

            return this.storeObject.$save().then(function() {
                registerStates([menuItem]);
                return this.combineMenuItems();
            }.bind(this));
        };
        
        Menu.prototype.removeMenuItem = function removeMenuItem(stateName) {
            var found = this.storeObject.jsonData.menuItems.some(function(item, i, array) {
                if (item.name === stateName) {
                    array.splice(i, 1);
                    return true;
                }
            });
            
            if (found) {
                return this.storeObject.$save().then(function() {
                    return this.combineMenuItems();
                }.bind(this));
            } else {
                return $q.reject('doesnt exist');
            }
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
    
        function flattenMenu(menuItems, flatMenuItems) {
            if (!flatMenuItems) flatMenuItems = [];
            
            menuItems.forEach(function(item) {
                flatMenuItems.push(item);
                if (item.children) {
                    flattenMenu(item.children, flatMenuItems);
                }
            });
            
            return flatMenuItems;
        }
        
        function unflattenMenu(flatMenuItems) {
            var hierarchyRoot = {
                children: {},
                item: {}
            };
            
            // turns the flat menu item array into a hierarchical structure
            // according to the state names
            flatMenuItems.forEach(function(item) {
                if (!item.name) return;
                var path = item.name.split('.');
                buildMenuHierarchy(hierarchyRoot, item, path);
            });
    
            // turns the hierarchical structure into actual menu items
            var rootMenuItem = createMenuItem(hierarchyRoot, true);
            var menuItems = rootMenuItem.children;
            
            // gets the main ui state, removes it and adds its children instead
            var uiItem;
            menuItems.some(function(item, i, array) {
                if (item.name === 'ui') {
                    uiItem = item;
                    array.splice(i, 1);
                    return true;
                }
            });
            Array.prototype.push.apply(menuItems, uiItem.children);
            
            return menuItems;
        }
    
        function buildMenuHierarchy(item, toAdd, path) {
            var segmentName = path.shift();
            var child = item.children[segmentName];
            if (!child) {
                child = item.children[segmentName] = {
                    children: {}
                };
            }
            if (!path.length) {
                child.item = toAdd;
            } else {
                buildMenuHierarchy(child, toAdd, path);
            }
        }
        
        function createMenuItem(item, isRoot) {
            var childArray = [];
            for (var key in item.children) {
                var transformedChild = createMenuItem(item.children[key]);
                if (!isRoot) {
                    transformedChild.parent = item.item;
                }
                childArray.push(transformedChild);
            }
            if (childArray.length) {
                item.item.children = childArray;
            }
            return item.item;
        }
        
        function calculateDifference(newItem, originalItem) {
            var difference = {
                name: originalItem.name
            };
            
            ['menuHidden', 'weight', 'menuIcon', 'menuTr', 'menuText', 'permission'].forEach(function(property) {
                propertyDiff(property, newItem, originalItem, difference);
            });
            
            if (!angular.equals(newItem.params, originalItem.params)) {
                difference.params = newItem.params;
            }

            return difference;

            function propertyDiff(property, newItem, originalItem, difference) {
                if (newItem[property] !== originalItem[property]) {
                    difference[property] = newItem[property];
                    if (difference[property] === undefined) {
                        difference[property] = null;
                    }
                }
            }
        }
        
        function cleanMenuItemForSave(item) {
            item = angular.copy(item);
            delete item.parent;
            delete item.children;
            if (item.linkToPage && item.pageXid) {
                delete item.template;
            } else {
                delete item.linkToPage;
                delete item.pageXid;
            }
            return item;
        }
    
        return new Menu();
    }

}

return MenuProvider;

}); // define
