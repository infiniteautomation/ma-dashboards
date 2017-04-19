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
                controllerAs: 'editCtrl',
                locals: {
                    item: item,
                    allMenuItems: menuItems,
                    root: menuHierarchy
                },
                controller: ['$scope', '$mdDialog', function editItemController($scope, $mdDialog) {
                    var urlPathMap = {};
                    item.parent.children.forEach(function(item) {
                        urlPathMap[item.url] = true;
                    });

                    this.menuItems = this.allMenuItems.filter(function(item) {
                        return item.abstract && item.name !== this.item.name;
                    }.bind(this));

                    Page.getPages().then(function(store) {
                        $scope.pages = store.jsonData.pages;
                    });
                    
                    $scope.stateNameChanged = function() {
                        $scope.menuItemEditForm.stateName.$setValidity('stateExists', this.item.name === origItem.name || !menuItemNameMap[this.item.name]);
                        this.checkParentState();
                    }.bind(this);

                    $scope.urlChanged = function() {
                        $scope.menuItemEditForm.url.$setValidity('urlExists', this.item.url === origItem.url || !urlPathMap[this.item.url]);
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
                        if ($scope.menuItemEditForm.stateName.$pristine && this.item.isNew && this.item.parent.name) {
                            this.item.name = this.item.parent.name + '.';
                        }
                        this.checkParentState();
                    }.bind(this);
                    
                    this.checkParentState = function checkParent() {
                        if (!this.item.parent.name || angular.isUndefined(this.item.name)) {
                            $scope.menuItemEditForm.stateName.$setValidity('stateNameMustBeginWithParent', true);
                        } else {
                            var startsWith = this.item.parent.name + '.';
                            var valid = this.item.name.indexOf(startsWith) === 0 && this.item.name.length > startsWith.length;
                            $scope.menuItemEditForm.stateName.$setValidity('stateNameMustBeginWithParent', valid);
                        }
                    };
                }]
            }).then(function() {
                delete item.isNew;

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
