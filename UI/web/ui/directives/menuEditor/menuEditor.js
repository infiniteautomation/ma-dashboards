/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

menuEditor.$inject = ['maUiMenu', '$mdDialog', 'Translate', '$mdMedia', 'Page', 'maUiMenuEditor', 'maUiSettings'];
function menuEditor(Menu, $mdDialog, Translate, $mdMedia, Page, maUiMenuEditor, uiSettings) {
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
                scrollToTopOfMdContent();
            };
            
            $scope.goToIndex = function goUp(event, index) {
                $scope.path.splice(index+1, $scope.path.length - 1 - index);
                $scope.currentItem = $scope.path[$scope.path.length-1];
                $scope.getChildren();
                scrollToTopOfMdContent();
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
            };

            // updates the weights, attempting to keep them as close as possible to the original array
            $scope.updateWeights = function(event, ui) {
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
                stop: $scope.updateWeights
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
                        parent: $scope.currentItem,
                        linkToPage: true,
                        permission: 'user'
                    };
                }

                var parent = origItem.parent;
                var isNew = origItem.isNew;
                
                maUiMenuEditor.editMenuItem($event, $scope.menuHierarchy, origItem).then(function(item) {
                    var newParent = item.parent;
                    
                    // remove item from the original parent's children if it was deleted or moved
                    if (!isNew && (item.deleted || parent !== newParent)) {
                        parent.children.some(function(item, i, array) {
                            if (item.name === origItem.name) {
                                return array.splice(i, 1);
                            }
                        });
                        if (!parent.children.length) {
                            delete parent.children;
                        }
                        if (item.deleted) {
                            return;
                        }
                    }

                    // copy item properties back onto original item
                    if (!isNew) {
                        // update child state names
                        if (item.name !== origItem.name) {
                            Menu.forEach(origItem.children, function(child) {
                                var search = origItem.name + '.';
                                if (child.name.indexOf(search) === 0) {
                                    child.name = item.name + '.' + child.name.substring(search.length);
                                } else {
                                    console.warn('child has invalid name', child);
                                }
                            });
                        }
                        
                        // prevent stack overflow from cyclic copy of parent/children
                        delete item.parent;
                        delete item.children;
                        angular.copy(item, origItem);
                        item = origItem;
                    }

                    // add item back into new parent's children
                    if (isNew || parent !== newParent) {
                        if (!newParent.children)
                            newParent.children = [];
                        newParent.children.push(item);
                    }
                    
                    // sorts array in case of new item added
                    $scope.getChildren();
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
