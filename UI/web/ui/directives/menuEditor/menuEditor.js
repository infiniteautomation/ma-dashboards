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

            function scrollToTopOfMdContent() {
                var elem = $element[0];
                while ((elem = elem.parentElement)) {
                    if (elem.tagName === 'MD-CONTENT') {
                        elem.scrollTop = 0;
                        break;
                    }
                }
            }

            $scope.getHierarchy = function getHierarchy() {
                Menu.getMenuHierarchy().then(setHierarchy);
            };
            $scope.getHierarchy();
            
            function setHierarchy(menuHierarchy) {
                $scope.menuHierarchy = menuHierarchy;
                $scope.path = [];
                $scope.enterSubmenu(null, $scope.menuHierarchy);
                
                var uiItem;
                $scope.menuHierarchy.children.some(function(item) {
                    return (uiItem = item.name === 'ui' && item);
                });
                
                if (uiItem) {
                    $scope.enterSubmenu(null, uiItem);
                }
            }

            $scope.enterSubmenu = function enterSubmenu(event, menuItem) {
                $scope.path.push(menuItem);
                $scope.currentItem = menuItem;
                $scope.getChildren();
            };
            
            $scope.goToIndex = function goUp(event, index) {
                $scope.path.splice(index+1, $scope.path.length - 1 - index);
                $scope.currentItem = $scope.path[$scope.path.length-1];
                $scope.getChildren();
            };
            
            $scope.getChildren = function getChildren() {
                // sort items by weight then name
                $scope.editItems = $scope.currentItem.children.sort(function(a, b) {
                    if (a.weight < b.weight) return -1;
                    if (a.weight > b.weight) return 1;
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                scrollToTopOfMdContent();
            };

            // updates the weights, attempting to keep them as close as possible to the original array
            $scope.updateWeight = function(event, ui) {
                var weight = -Infinity;
                $scope.currentItem.children.forEach(function(item, index, array) {
                    if (item.weight > weight) {
                        weight = item.weight;
                    } else {
                        if (index !== 0 && array[index - 1].name > item.name) {
                            weight++;
                        }
                        item.weight = weight;
                    }
                });
            };
            
            // ui sortable moves the items within the array, need to specify a call back that updates the
            // weight property
            $scope.uiSortableOptions = {
                handle: '> td > .move-handle',
                stop: $scope.updateWeight
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
                    Menu.deleteMenu().then(setHierarchy);
                });
            };

            $scope.removeItem = function(toBeRemoved) {
                $scope.editItems.some(function(item, index, array) {
                    if (toBeRemoved.name === item.name) {
                        array.splice(index, 1);
                        return true;
                    }
                });
            };

            $scope.editItem = function($event, origItem) {
                if (!origItem) {
                    origItem = {
                        isNew: true,
                        name: $scope.currentItem.name ? $scope.currentItem.name + '.' : '',
                        url: '/',
                        parent: $scope.currentItem
                    };
                }

                var parent = origItem.parent;
                var isNew = origItem.isNew;
                
                MenuEditor.editMenuItem($event, $scope.menuHierarchy, origItem).then(function(item) {
                    var newParent = item.parent;
                    
                    if (!isNew && (item.deleted || parent !== newParent)) {
                        var array = parent.children;
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
                        // prevent stack overflow from cyclic copy of parent
                        delete item.parent;
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
                Menu.saveMenu($scope.menuHierarchy).then(setHierarchy);
            };
        }
    };
}

return menuEditor;

}); // define
