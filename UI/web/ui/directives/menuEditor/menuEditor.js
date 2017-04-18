/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

menuEditor.$inject = ['Menu', '$mdDialog', 'Translate', '$mdMedia', 'Page', 'MenuEditor', 'uiSettings'];
function menuEditor(Menu, $mdDialog, Translate, $mdMedia, Page, MenuEditor, uiSettings) {
    return {
        scope: {},
        templateUrl: require.toUrl('./menuEditor.html'),
        link: function($scope, $element) {
            $scope.menuEditor = {};
            $scope.$mdMedia = $mdMedia;
            
            Menu.getMenuHierarchy().then(function(menuItems) {
                $scope.menuItems = menuItems;
                resetToRoot();
            });
            
            function scrollToTopOfMdContent() {
                var elem = $element[0];
                while ((elem = elem.parentElement)) {
                    if (elem.tagName === 'MD-CONTENT') {
                        elem.scrollTop = 0;
                        break;
                    }
                }
            }
            
            $scope.undo = function undo() {
                Menu.getMenuHierarchy().then(function(menuItems) {
                    $scope.menuItems = menuItems;
                    resetToRoot();
                });
            };
            
            function resetToRoot() {
                $scope.editItems = $scope.menuItems;
                $scope.path = [{menuText: 'Root'}];
            }
            
            $scope.enterSubmenu = function enterSubmenu(event, menuItem) {
                $scope.editItems = menuItem.children;
                $scope.path.push(menuItem);
                scrollToTopOfMdContent();
            };
            
            $scope.goUp = function goUp(event) {
                $scope.path.pop();
                var currentItem = $scope.path[$scope.path.length-1];
                $scope.editItems = currentItem.children || $scope.menuItems;
                scrollToTopOfMdContent();
            };
            
            $scope.goToIndex = function goUp(event, index) {
                $scope.path.splice(index+1, $scope.path.length - 1 - index);
                var currentItem = $scope.path[$scope.path.length-1];
                $scope.editItems = currentItem.children || $scope.menuItems;
                scrollToTopOfMdContent();
            };
            
            $scope.deleteCustomMenu = function deleteCustomMenu(event) {
                var confirm = $mdDialog.confirm()
                    .title(Translate.trSync('ui.app.areYouSure'))
                    .textContent(Translate.trSync('ui.app.confirmRestoreDefaultMenu'))
                    .ariaLabel(Translate.trSync('ui.app.areYouSure'))
                    .targetEvent(event)
                    .ok(Translate.trSync('common.ok'))
                    .cancel(Translate.trSync('common.cancel'));
                
                $mdDialog.show(confirm).then(function() {
                    Menu.deleteMenu().then(function(menuItems) {
                        $scope.menuItems = menuItems;
                        resetToRoot();
                    });
                });
            };

            $scope.editItem = function($event, origItem) {
                var menuItems = $scope.menuItems;
                if (!origItem) {
                    debugger;
                    // TODO get name and parent from path
                    origItem = {
                        isNew: true,
                        name: 'ui.',
                        url: '/',
                        parent: null
                    };
                }
                var parent = origItem.parent;
                var isNew = origItem.isNew;
                
                MenuEditor.editMenuItem($event, origItem, menuItems).then(function(item) {
                    var newParent = item.parent;
                    
                    if (!isNew && (item.deleted || parent !== newParent)) {
                        var array = parent ? parent.children : menuItems;
                        for (var i = 0; i < array.length; i++) {
                            if (array[i].name === origItem.name) {
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
                        angular.merge(origItem, item);
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
                });
            };
            
            $scope.saveMenu = function saveMenu() {
                Menu.saveMenu($scope.menuItems).then(function(menuItems) {
                    $scope.menuItems = menuItems;
                    resetToRoot();
                });
            };
        }
    };
}

return menuEditor;

}); // define
