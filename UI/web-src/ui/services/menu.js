/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import loadLoginTranslations from '../util/loadLoginTranslations';

MenuProvider.$inject = ['$stateProvider', 'MA_UI_MENU_ITEMS'];
function MenuProvider($stateProvider, MA_UI_MENU_ITEMS) {
    // register the built in MA_UI_MENU_ITEMS
    registerStates(MA_UI_MENU_ITEMS);

    // Used by AngularJS modules to register a menu item
    this.registerMenuItems = function registerMenuItems(menuItems) {
        Array.prototype.push.apply(MA_UI_MENU_ITEMS, menuItems);
        registerStates(menuItems);
    };
    
    this.registerCustomMenuItems = function registerCustomMenuItems(customMenuItems) {
        const menuItemsByName = MA_UI_MENU_ITEMS.reduce((map, item) => {
            map[item.name] = item;
            return map;
        }, {});

        const onlyCustomMenuItems = customMenuItems.filter(item => {
            return !menuItemsByName[item.name];
        });

        // register the custom menu items retrieved at bootstrap
        registerStates(onlyCustomMenuItems);
    };
    
    let customMenuStore;
    this.setCustomMenuStore = function setCustomMenuStore(store) {
        customMenuStore = store;
        this.registerCustomMenuItems(store.jsonData.menuItems);
    };

    function registerStates(menuItems) {
        menuItems.forEach(menuItem => {
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
                        
                        menuItem.templateUrl = templateUrl;
                        delete menuItem.templateProvider;
                        delete menuItem.resolve.viewTemplate;
                        
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
                const endsWith = 'is already defined';
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

    MenuFactory.$inject = ['maJsonStore', 'MA_UI_MENU_XID', '$q', '$rootScope', 'maJsonStoreEventManager', 'MA_UI_EDIT_MENUS_PERMISSION'];
    function MenuFactory(JsonStore, MA_UI_MENU_XID, $q, $rootScope, jsonStoreEventManager, MA_UI_EDIT_MENUS_PERMISSION) {

        const SUBSCRIPTION_TYPES = ['add', 'update', 'delete'];

        class Menu {
            constructor() {
                this.defaultMenuItems = MA_UI_MENU_ITEMS;
                this.defaultMenuItemsByName = {};
        
                this.defaultMenuItems.forEach(item => {
                    setDefaults(item);
                    item.builtIn = true;
                    this.defaultMenuItemsByName[item.name] = item;
                });
    
                this.firstRefresh = true;
                
                if (customMenuStore) {
                    this.storeObject = new JsonStore(customMenuStore);
                    delete this.storeObject.$promise;
                    delete this.storeObject.$resolved;
                } else {
                    this.storeObject = this.defaultMenuStore();
                }
                jsonStoreEventManager.subscribe(MA_UI_MENU_XID, SUBSCRIPTION_TYPES, this.updateHandler.bind(this));
            }
    
            defaultMenuStore() {
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
            }
    
            updateHandler(event, payload) {
                let changed = false;
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
            }
    
            refresh(forceRefresh) {
                // if the websocket is connected then we can assume we always have the latest menu items
                // just return our current store item
                if (!forceRefresh && this.storePromise && jsonStoreEventManager.isConnected()) {
                    return this.storePromise;
                }
                
                // custom menu items are retrieved on bootstrap, don't get them twice on app startup
                // after first run use the standard JsonStore http request
                if (customMenuStore && this.firstRefresh) {
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
            }
    
            combineMenuItems() {
                const jsonMenuItems = angular.copy(this.storeObject.jsonData.menuItems);
                this.menuItems = angular.copy(this.defaultMenuItems);
                this.menuItemsByName = {};
                
                // contains only menu items that arent built in
                this.customMenuItems = [];
        
                this.menuItems.forEach(item => {
                    this.menuItemsByName[item.name] = item;
                });
                
                jsonMenuItems.forEach(item => {
                    if (this.menuItemsByName[item.name]) {
                        angular.merge(this.menuItemsByName[item.name], item);
                    } else {
                        setDefaults(item);
                        this.menuItems.push(item);
                        // need to copy it as unflattenMenu() will add a parent/children to it below
                        this.customMenuItems.push(angular.copy(item));
                    }
                });
                
                // set defaults
                this.menuItems.forEach(menuItem => {
                    if (menuItem.weight == null) {
                        menuItem.weight = 1000;
                    }
                    if (menuItem.permission == null) {
                        menuItem.permission = 'user';
                    }
                });
                
                this.menuHierarchy = unflattenMenu(this.menuItems);
                return this.menuItems;
            }
    
            getMenu() {
                return this.refresh().then(store => {
                    return this.combineMenuItems();
                });
            }
            
            getMenuHierarchy() {
                return this.getMenu().then(() => {
                    return this.menuHierarchy;
                });
            }
            
            deleteMenu() {
                this.storeObject.jsonData.menuItems = [];
                return this.storeObject.$save().then(() => {
                    this.combineMenuItems();
                    $rootScope.$broadcast('maUIMenuChanged', this.menuHierarchy);
                    return this.menuHierarchy;
                });
            }
            
            saveMenu(menuHierarchy) {
                const newMenuItems = flattenMenu(menuHierarchy.children);
                
                const different = [];
                newMenuItems.forEach(item => {
                    // all states are cleaned (remove parents and children, non-circular structure) so that
                    // a) If they are pushed to the different[] array and saved into menuItems they can be JSON serialized
                    // a) registerStates() works, $stateProvider.state(menuItem) fails if item has parent property set
                    cleanMenuItemForSave(item);
                    
                    const originalItem = this.defaultMenuItemsByName[item.name];
                    if (!originalItem) {
                        different.push(item);
                    } else if (!angular.equals(item, originalItem)) {
                        const difference = calculateDifference(item, originalItem);
                        if (Object.keys(difference).length === 1) {
                            // only has the name property
                            console.warn('cant detect difference', item, originalItem);
                        } else {
                            different.push(difference);
                        }
                    }
                });
        
                this.storeObject.jsonData.menuItems = different;
                return this.storeObject.$save().then(() => {
                    registerStates(newMenuItems);
                    this.combineMenuItems();
                    $rootScope.$broadcast('maUIMenuChanged', this.menuHierarchy);
                    return this.menuHierarchy;
                });
            }
    
            saveMenuItem(menuItem, originalName) {
                return this.refresh().then(() => {
                    // removes the original item, takes care of renaming
                    if (originalName) {
                        this.storeObject.jsonData.menuItems.some((item, i, array) => {
                            if (item.name === originalName) {
                                array.splice(i, 1);
                                return true;
                            }
                        });
                    }
        
                    cleanMenuItemForSave(menuItem);
                    
                    const originalItem = this.defaultMenuItemsByName[menuItem.name];
                    if (!originalItem) {
                        this.storeObject.jsonData.menuItems.push(menuItem);
                    } else if (!angular.equals(menuItem, originalItem)) {
                        const difference = calculateDifference(menuItem, originalItem);
                        this.storeObject.jsonData.menuItems.push(difference);
                    }
        
                    return this.storeObject.$save().then(() => {
                        registerStates([menuItem]);
                        this.combineMenuItems();
                        $rootScope.$broadcast('maUIMenuChanged', this.menuHierarchy);
                        return this.menuItems;
                    });
                });
            }
            
            removeMenuItem(stateName) {
                return this.refresh().then(() => {
                    const found = this.storeObject.jsonData.menuItems.some((item, i, array) => {
                        if (item.name === stateName) {
                            array.splice(i, 1);
                            return true;
                        }
                    });
                    
                    if (found) {
                        return this.storeObject.$save().then(() => {
                            this.combineMenuItems();
                            $rootScope.$broadcast('maUIMenuChanged', this.menuHierarchy);
                            return this.menuItems;
                        });
                    } else {
                        return $q.reject('doesnt exist');
                    }
                });
            }
            
            forEach(menuItems, fn) {
                if (!menuItems) return;
                for (let i = 0; i < menuItems.length; i++) {
                    const menuItem = menuItems[i];
                    let result = fn(menuItem, i, menuItems);
                    if (result) return result;
                    result = this.forEach(menuItem.children, fn);
                    if (result) return result;
                }
            }
        }
    
        function flattenMenu(menuItems, flatMenuItems) {
            if (!flatMenuItems) flatMenuItems = [];
            
            menuItems.forEach(item => {
                flatMenuItems.push(item);
                if (item.children) {
                    flattenMenu(item.children, flatMenuItems);
                }
            });
            
            return flatMenuItems;
        }
        
        function unflattenMenu(flatMenuItems) {
            const hierarchyRoot = {
                children: {},
                item: {
                    menuTr: 'ui.app.root'
                }
            };
            
            // turns the flat menu item array into a hierarchical structure
            // according to the state names
            flatMenuItems.forEach(item => {
                if (!item.name) return;
                const path = item.name.split('.');
                buildMenuHierarchy(hierarchyRoot, item, path);
            });
    
            // turns the hierarchical structure into actual menu items
            return createMenuItem(hierarchyRoot);
        }
    
        function buildMenuHierarchy(item, toAdd, path) {
            const segmentName = path.shift();
            let child = item.children[segmentName];
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
            const childArray = [];
            for (const key in item.children) {
                const transformedChild = createMenuItem(item.children[key]);
                transformedChild.parent = item.item;
                childArray.push(transformedChild);
            }
            if (childArray.length) {
                item.item.children = childArray;
            }
            return item.item;
        }
        
        function calculateDifference(newItem, originalItem) {
            const difference = {
                name: originalItem.name
            };
            
            ['menuHidden', 'weight', 'menuIcon', 'menuTr', 'menuText', 'permission'].forEach(property => {
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
