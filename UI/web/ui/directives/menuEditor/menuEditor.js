/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

var menuEditor = function(Menu, $mdDialog, Translate, $mdMedia, Page, mangoState, MenuEditor, mdAdminSettings) {
    return {
        scope: {},
        templateUrl: require.toUrl('./menuEditor.html'),
        link: function($scope, $element) {
            $scope.menuEditor = {};
            $scope.$mdMedia = $mdMedia;
            
            Menu.getMenu().then(function(storeObject) {
                $scope.storeObject = storeObject;
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
                this.storeObject.$get().then(function() {
                    resetToRoot();
                });
            };
            
            function resetToRoot() {
                $scope.editItems = $scope.storeObject.jsonData.menuItems;
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
                $scope.editItems = currentItem.children || $scope.storeObject.jsonData.menuItems;
                scrollToTopOfMdContent();
            };
            
            $scope.goToIndex = function goUp(event, index) {
                $scope.path.splice(index+1, $scope.path.length - 1 - index);
                var currentItem = $scope.path[$scope.path.length-1];
                $scope.editItems = currentItem.children || $scope.storeObject.jsonData.menuItems;
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
                    $scope.storeObject.$delete().then(function() {
                        $scope.storeObject = Menu.getDefaultMenu();
                        resetToRoot();
                    });
                });
            };
            
            $scope.resetDefaultItems = function resetDefaultItems(event) {
                var confirm = $mdDialog.confirm()
                    .title(Translate.trSync('ui.app.areYouSure'))
                    .textContent(Translate.trSync('ui.app.confirmResetDefaultItems'))
                    .ariaLabel(Translate.trSync('ui.app.areYouSure'))
                    .targetEvent(event)
                    .ok(Translate.trSync('common.ok'))
                    .cancel(Translate.trSync('common.cancel'));
                
                $mdDialog.show(confirm).then(function() {
                    $scope.storeObject.$get().then(function(storeObject) {
                        $scope.storeObject = Menu.getDefaultMenu();
                        var menuItems = $scope.storeObject.jsonData.menuItems;
                        
                        // create a flat map of all default menu items
                        var allMenuItemsMap = {};
                        Menu.eachMenuItem(menuItems, null, function(menuItem) {
                            allMenuItemsMap[menuItem.name] = menuItem;
                        });
                        
                        // loop over users custom menu items and re-add custom items to the menuItems array
                        Menu.eachMenuItem(storeObject.jsonData.menuItems, null, function(menuItem) {
                            if (!allMenuItemsMap[menuItem.name]) {
                                menuItems.push(menuItem);
                                return 'continue';
                            }
                        });
                        
                        return $scope.storeObject.$save().then(resetToRoot);
                    });
                });
            };
            
            $scope.editItem = MenuEditor.editMenuItem;
            
            $scope.saveMenu = function saveMenu() {
                $scope.storeObject.$save().then(function(store) {
                    mangoState.addStates(store.jsonData.menuItems);
                    mdAdminSettings.customMenuItems = store.jsonData.menuItems;
                    resetToRoot();
                });
            };
        }
    };
};

menuEditor.$inject = ['Menu', '$mdDialog', 'Translate', '$mdMedia', 'Page', 'mangoState', 'MenuEditor', 'mdAdminSettings'];

return menuEditor;

}); // define
