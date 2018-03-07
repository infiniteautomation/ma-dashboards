/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import loadLoginTranslations from '../util/loadLoginTranslations';


MenuProvider.$inject = ['$stateProvider', 'MA_UI_MENU_ITEMS', 'MA_UI_CUSTOM_MENU_ITEMS'];
function MenuProvider($stateProvider, MA_UI_MENU_ITEMS, MA_UI_CUSTOM_MENU_ITEMS) {
    // register the built in MA_UI_MENU_ITEMS
    registerStates(MA_UI_MENU_ITEMS);

    // Used by AngularJS modules to register a menu item
    this.registerMenuItems = function registerMenuItems(menuItems) {
        Array.prototype.push.apply(MA_UI_MENU_ITEMS, menuItems);
        registerStates(menuItems);
    };
    
    this.registerCustomMenuItems = function registerCustomMenuItems() {
        if (!MA_UI_CUSTOM_MENU_ITEMS) return;
        
        var menuItemsByName = {};
        MA_UI_MENU_ITEMS.forEach(function(item) {
            menuItemsByName[item.name] = item;
        }.bind(this));

        var onlyCustomMenuItems = MA_UI_CUSTOM_MENU_ITEMS.filter(function(item, index, array) {
            if (!menuItemsByName[item.name]) {
                return item;
            }
        });

        // register the custom menu items retrieved at bootstrap
        registerStates(onlyCustomMenuItems);
    };

    function registerStates(menuItems) {
        menuItems.forEach(function(menuItem) {
            if (!menuItem.name) return;

            if (menuItem.linkToPage) {
                delete menuItem.templateUrl;
                menuItem.template = '<ma-ui-page-view xid="' + menuItem.pageXid + '" flex layout="column"></ma-ui-page-view>';
            }

            if (menuItem.templateUrl) {
                delete menuItem.template;
                delete menuItem.templateProvider;
            }

            if (!menuItem.templateUrl && !menuItem.template && !menuItem.templateProvider && !menuItem.views && !menuItem.href) {
                if (menuItem.resolve && menuItem.resolve.viewTemplate) {
                    menuItem.templateProvider = ['viewTemplate', '$templateCache', function(viewTemplate, $templateCache) {
                        const templateUrl = menuItem.name + '.tmpl.html';
                        const template = viewTemplate.default;
                        
                        $templateCache.put(templateUrl, template);
                        
                        return template;
                    }];
                } else {
                    menuItem.template = '<div ui-view></div>';
                    menuItem.abstract = true;
                }
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

    MenuFactory.$inject = ['maJsonStore', 'MA_UI_MENU_XID', '$q', '$rootScope', 'maJsonStoreEventManager', 'MA_UI_EDIT_MENUS_PERMISSION',
        'MA_UI_CUSTOM_MENU_STORE'];
    function MenuFactory(JsonStore, MA_UI_MENU_XID, $q, $rootScope, jsonStoreEventManager, MA_UI_EDIT_MENUS_PERMISSION,
            MA_UI_CUSTOM_MENU_STORE) {

        var SUBSCRIPTION_TYPES = ['add', 'update', 'delete'];

        function Menu() {
            this.defaultMenuItems = MA_UI_MENU_ITEMS;
            this.defaultMenuItemsByName = {};
    
            this.defaultMenuItems.forEach(function(item) {
                setDefaults(item);
                item.builtIn = true;
                this.defaultMenuItemsByName[item.name] = item;
            }.bind(this));

            this.firstRefresh = true;
            
            if (MA_UI_CUSTOM_MENU_STORE) {
                this.storeObject = new JsonStore(MA_UI_CUSTOM_MENU_STORE);
                delete this.storeObject.$promise;
                delete this.storeObject.$resolved;
            } else {
                this.storeObject = this.defaultMenuStore();
            }
            jsonStoreEventManager.subscribe(MA_UI_MENU_XID, SUBSCRIPTION_TYPES, this.updateHandler.bind(this));
        }

        Menu.prototype.defaultMenuStore = function defaultMenuStore() {
            const storeObject = new JsonStore();
            
            storeObject.xid = MA_UI_MENU_XID;
            storeObject.name = 'UI Menu';
            storeObject.editPermission = MA_UI_EDIT_MENUS_PERMISSION;
            storeObject.readPermission = 'user';
            storeObject.publicData = false;
            storeObject.jsonData = {
                menuItems: []
            };
            
            return storeObject;
        };

        Menu.prototype.updateHandler = function updateHandler(event, payload) {
            var changed = false;
            if (payload.action === 'delete') {
                this.storeObject.jsonData = {
                    menuItems: []
                };
                changed = true;
            } else {
                if (!angular.equals(this.storeObject.jsonData, payload.object.jsonData)) {
                    this.storeObject.jsonData = payload.object.jsonData;
                    changed = true;
                }
                this.storeObject.readPermission = payload.object.readPermission;
                this.storeObject.editPermission = payload.object.editPermission;
                this.storeObject.name = payload.object.name;
            }
            
            if (changed) {
                this.combineMenuItems();
                // register the custom menu items which may have been added
                registerStates(this.customMenuItems);
                $rootScope.$apply($rootScope.$broadcast('maUIMenuChanged', this.menuHierarchy));
            }
        };

        Menu.prototype.refresh = function refresh(forceRefresh) {
            // if the websocket is connected then we can assume we always have the latest menu items
            // just return our current store item
            if (!forceRefresh && this.storePromise && jsonStoreEventManager.isConnected()) {
                return this.storePromise;
            }
            
            // custom menu items are retrieved on bootstrap, don't get them twice on app startup
            // after first run use the standard JsonStore http request
            if (MA_UI_CUSTOM_MENU_STORE && this.firstRefresh) {
                this.storePromise = $q.when(this.storeObject);
            } else {
                this.storePromise = JsonStore.get({xid: MA_UI_MENU_XID}).$promise.then(null, error => {
                    if (error.status === 404) {
                        return this.defaultMenuStore();
                    }
                    delete this.storePromise;
                    return $q.reject(error);
                }).then(store => {
                    this.storeObject = store;
                    return store;
                });
            }
            
            this.firstRefresh = false;
            return this.storePromise;
        };

        Menu.prototype.combineMenuItems = function combineMenuItems() {
            var jsonMenuItems = angular.copy(this.storeObject.jsonData.menuItems);
            this.menuItems = angular.copy(this.defaultMenuItems);
            this.menuItemsByName = {};
            
            // contains only menu items that arent built in
            this.customMenuItems = [];
    
            this.menuItems.forEach(function(item) {
                this.menuItemsByName[item.name] = item;
            }.bind(this));
            
            jsonMenuItems.forEach(function(item) {
                if (this.menuItemsByName[item.name]) {
                    angular.merge(this.menuItemsByName[item.name], item);
                } else {
                    setDefaults(item);
                    this.menuItems.push(item);
                    // need to copy it as unflattenMenu() will add a parent/children to it below
                    this.customMenuItems.push(angular.copy(item));
                }
            }.bind(this));
            
            // set defaults
            this.menuItems.forEach(function(menuItem) {
                if (menuItem.weight == null) {
                    menuItem.weight = 1000;
                }
                if (menuItem.permission == null) {
                    menuItem.permission = 'user';
                }
            });
            
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
                this.combineMenuItems();
                $rootScope.$broadcast('maUIMenuChanged', this.menuHierarchy);
                return this.menuHierarchy;
            }.bind(this));
        };
        
        Menu.prototype.saveMenu = function saveMenu(menuHierarchy) {
            var newMenuItems = flattenMenu(menuHierarchy.children);
            
            var different = [];
            newMenuItems.forEach(function(item, index, array) {
                // all states are cleaned (remove parents and children, non-circular structure) so that
                // a) If they are pushed to the different[] array and saved into menuItems they can be JSON serialized
                // a) registerStates() works, $stateProvider.state(menuItem) fails if item has parent property set
                cleanMenuItemForSave(item);
                
                var originalItem = this.defaultMenuItemsByName[item.name];
                if (!originalItem) {
                    different.push(item);
                } else if (!angular.equals(item, originalItem)) {
                    var difference = calculateDifference(item, originalItem);
                    if (Object.keys(difference).length === 1) {
                        // only has the name property
                        console.warn('cant detect difference', item, originalItem);
                    } else {
                        different.push(difference);
                    }
                }
            }.bind(this));
    
            this.storeObject.jsonData.menuItems = different;
            return this.storeObject.$save().then(function() {
                registerStates(newMenuItems);
                this.combineMenuItems();
                $rootScope.$broadcast('maUIMenuChanged', this.menuHierarchy);
                return this.menuHierarchy;
            }.bind(this));
        };

        Menu.prototype.saveMenuItem = function saveMenuItem(menuItem, originalName) {
            return this.refresh().then(function() {
                // removes the original item, takes care of renaming
                if (originalName) {
                    this.storeObject.jsonData.menuItems.some(function(item, i, array) {
                        if (item.name === originalName) {
                            array.splice(i, 1);
                            return true;
                        }
                    });
                }
    
                cleanMenuItemForSave(menuItem);
                
                var originalItem = this.defaultMenuItemsByName[menuItem.name];
                if (!originalItem) {
                    this.storeObject.jsonData.menuItems.push(menuItem);
                } else if (!angular.equals(menuItem, originalItem)) {
                    var difference = calculateDifference(menuItem, originalItem);
                    this.storeObject.jsonData.menuItems.push(difference);
                }
    
                return this.storeObject.$save().then(function() {
                    registerStates([menuItem]);
                    this.combineMenuItems();
                    $rootScope.$broadcast('maUIMenuChanged', this.menuHierarchy);
                    return this.menuItems;
                }.bind(this));
            }.bind(this));
        };
        
        Menu.prototype.removeMenuItem = function removeMenuItem(stateName) {
            return this.refresh().then(function() {
                var found = this.storeObject.jsonData.menuItems.some(function(item, i, array) {
                    if (item.name === stateName) {
                        array.splice(i, 1);
                        return true;
                    }
                });
                
                if (found) {
                    return this.storeObject.$save().then(function() {
                        this.combineMenuItems();
                        $rootScope.$broadcast('maUIMenuChanged', this.menuHierarchy);
                        return this.menuItems;
                    }.bind(this));
                } else {
                    return $q.reject('doesnt exist');
                }
            }.bind(this));
        };
        
        Menu.prototype.forEach = function forEach(menuItems, fn) {
            if (!menuItems) return;
            for (var i = 0; i < menuItems.length; i++) {
                var menuItem = menuItems[i];
                var result = fn(menuItem, i, menuItems);
                if (result) return result;
                result = this.forEach(menuItem.children, fn);
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
                item: {
                    menuTr: 'ui.app.root'
                }
            };
            
            // turns the flat menu item array into a hierarchical structure
            // according to the state names
            flatMenuItems.forEach(function(item) {
                if (!item.name) return;
                var path = item.name.split('.');
                buildMenuHierarchy(hierarchyRoot, item, path);
            });
    
            // turns the hierarchical structure into actual menu items
            return createMenuItem(hierarchyRoot);
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
        
        function createMenuItem(item) {
            var childArray = [];
            for (var key in item.children) {
                var transformedChild = createMenuItem(item.children[key]);
                transformedChild.parent = item.item;
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
                }
            }
        }
        
        function setDefaults(item) {
            item.menuHidden = !!item.menuHidden;

            if (item.weight == null) {
                item.weight = 1000;
            }
            if (item.permission == null) {
                item.permission = 'user';
            }
        }
        
        function cleanMenuItemForSave(item) {
            delete item.parent;
            delete item.children;
            return item;
        }
    
        return new Menu();
    }

}

export default MenuProvider;


