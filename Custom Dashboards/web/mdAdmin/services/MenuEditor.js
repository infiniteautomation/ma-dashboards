/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

function MenuEditorFactory(Menu, $mdDialog, Translate, Page, mangoState, $q) {

    function MenuEditor() {
    }
    
    MenuEditor.prototype.editMenuItem = function editMenuItem(event, origItem, parent, store, save, searchBy) {
        var storePromise = store ? $q.when(store) : Menu.getMenu();
        return storePromise.then(function(menuStore) {
            var menuItems = menuStore.jsonData.menuItems;
            
            // build flat menu item array so we can choose any item in dropdown
            var flatMenuItems = [];
            var flatMenuMap = [];
            var highestMenuItemId = 4999; // built in menu items start at 1, custom pages start at 5000
            Menu.eachMenuItem(menuItems, null, function(menuItem) {
                flatMenuItems.push(menuItem);
                flatMenuMap[menuItem.name] = true;
                if (menuItem.id > highestMenuItemId)
                    highestMenuItemId = menuItem.id;
            });
            
            // search for the item
            if (searchBy) {
                var searchResult = findMenuItem(menuItems, searchBy, origItem);
                if (searchResult) {
                    origItem = searchResult.item;
                    parent = searchResult.parent;
                }
            }

            var item;
            if (origItem && typeof origItem === 'object') {
                // editing an item that was provided or searched for and found
                item = angular.copy(origItem);
            } else {
                // editing a new item
                item = {
                    isNew: true,
                    name: parent ? parent.name + '.' : 'dashboard.',
                    url: '/',
                    pageXid: null,
                    linkToPage: true,
                    id: (highestMenuItemId + 1)
                };
                // item we were searching for was not found
                // set the property we were looking for on the new item
                if (searchBy) {
                    item[searchBy] = origItem;
                    origItem = null;
                }
            }
            item.parent = parent;
            
            if (!item.menuHidden) {
                item.showOnMenu = true;
            }
            
            if (item.params && item.params.dateBar) {
                item.dateBarOptions = item.params.dateBar.rollupControls ? 'dateAndRollup' : 'date';
            } else {
                item.dateBarOptions = 'none';
            }
            
            return $mdDialog.show({
                templateUrl: require.toUrl('./MenuEditorDialog.html'),
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                fullscreen: true,
                bindToController: true,
                controllerAs: 'editCtrl',
                locals: {
                    item: item,
                    menuItems: flatMenuItems
                },
                controller: ['$scope', '$mdDialog', function editItemController($scope, $mdDialog) {
                    Page.getPages().then(function(store) {
                        $scope.pages = store.jsonData.pages;
                    });
                    
                    $scope.stateNameChanged = function() {
                        $scope.menuItemEditForm.stateName.$setValidity('stateExists', !flatMenuMap[this.item.name]);
                        this.checkParentState();
                    }.bind(this);
                    
                    $scope.cancel = function cancel() {
                        $mdDialog.cancel();
                    };
                    $scope.save = function save() {
                        if ($scope.menuItemEditForm.$valid) {
                            $mdDialog.hide();
                        }
                    };
                    $scope['delete'] = function() {
                        item.deleted = true;
                        $mdDialog.hide();
                    };
                    $scope.parentChanged = function() {
                        if ($scope.menuItemEditForm.stateName.$pristine && this.item.isNew && this.item.parent) {
                            this.item.name = this.item.parent.name + '.';
                        }
                        this.checkParentState();
                    }.bind(this);
                    
                    this.checkParentState = function checkParent() {
                        if (!this.item.parent || angular.isUndefined(this.item.name))
                            $scope.menuItemEditForm.stateName.$setValidity('stateNameMustBeginWithParent', true);
                        else
                            $scope.menuItemEditForm.stateName.$setValidity('stateNameMustBeginWithParent', this.item.name.indexOf(this.item.parent.name) === 0);
                    };
                }]
            }).then(function() {
                var newParent = item.parent;
                var isNew = item.isNew;
                delete item.parent;
                delete item.isNew;
                
                if (item.showOnMenu) {
                    delete item.menuHidden;
                } else {
                    item.menuHidden = true;
                }
                delete item.showOnMenu;
                
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

                if (!isNew && (item.deleted || parent !== newParent)) {
                    var array = parent ? parent.children : menuItems;
                    for (var i = 0; i < array.length; i++) {
                        if (array[i].id === item.id) {
                            array.splice(i, 1);
                            break;
                        }
                    }
                    if (parent && !parent.children.length) {
                        delete parent.children;
                    }
                    if (item.deleted) {
                        return;
                    }
                }

                // copy item properties back onto original item
                if (!isNew) {
                    angular.copy(item, origItem);
                    item = origItem;
                }

                // add item back into parents children or into the menuItems array
                if (isNew || parent !== newParent) {
                    if (newParent) {
                        if (!newParent.children)
                            newParent.children = [];
                        newParent.children.push(item);
                    } else {
                        menuItems.push(item);
                    }
                }
            }).then(function() {
                if (save) {
                    if (!item.deleted)
                        mangoState.addStates([item]);
                    return menuStore.$save().then(function(store) {
                        var result = findMenuItem(store.jsonData.menuItems, 'id', item.id);
                        if (result) {
                            result.store = store;
                            return result;
                        }
                        return {store: store};
                    });
                } else return {
                    item: item,
                    parent: parent,
                    store: menuStore
                };
            });
        }.bind(this));
    };
    
    function findMenuItem(menuItems, searchKey, searchValue) {
        var result;
        Menu.eachMenuItem(menuItems, null, function(menuItem, parent) {
            if (menuItem[searchKey] === searchValue) {
                result = {
                    item: menuItem,
                    parent: parent
                };
                return true;
            }
        });
        return result;
    }

    return new MenuEditor();
}

MenuEditorFactory.$inject = ['Menu', '$mdDialog', 'Translate', 'Page', 'mangoState', '$q'];
return MenuEditorFactory;

}); // define
