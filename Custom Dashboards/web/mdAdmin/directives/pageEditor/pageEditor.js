/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

var pageEditor = function(Page, jsonStoreEventManager, CUSTOM_USER_PAGES_XID, User, MenuEditor, $stateParams, $state, localStorageService, $mdDialog, Translate, Menu, $templateRequest) {
    var SUBSCRIPTION_TYPES = ['add', 'update'];

    return {
        scope: true,
        templateUrl: require.toUrl('./pageEditor.html'),
        link: function($scope, $element) {
            $scope.User = User;
            $scope.showEditor = true;
            $scope.showPreview = true;

            var menuPromise = Menu.getMenu().then(function(menuStore) {
                $scope.menuStore = menuStore;
                return menuStore;
            });
            
            var pageSummaryStore;

            $scope.createNewPage = function createNewPage(markup) {
                this.selectedPage = Page.newPageContent();
                this.selectedPage.jsonData.markup = markup || '';
                var pageSummary = this.selectedPageSummary = pageToSummary(this.selectedPage);
                this.menuItem = null;
                this.menuItemParent = null;
                setPageXidStateParam(null);
                return pageSummary;
            };
            
            function setPages(store) {
                pageSummaryStore = store;
                $scope.pageSummaries = store.jsonData.pages;
            }
            
            Page.getPages().then(setPages);
            
            $scope.loadPage = function loadPage(xid) {
                return menuPromise.then(function() {
                    return Page.loadPage(xid || $scope.selectedPageSummary.xid);
                }).then(function(pageStore) {
                    setPageXidStateParam(pageStore.xid);
                    $scope.selectedPage = pageStore;
                    
                    $scope.menuItem = null;
                    $scope.menuItemParent = null;
                    // locate the first menu item which points to this page
                    Menu.eachMenuItem($scope.menuStore.jsonData.menuItems, null, function(menuItem, parent) {
                        if (menuItem.pageXid === pageStore.xid) {
                            $scope.menuItem = menuItem;
                            $scope.menuItemParent = parent;
                            return true;
                        }
                    });
                    
                    return pageStore;
                }, function(error) {
                    return $scope.createNewPage();
                });
            };
            
            $scope.editMenuItem = function($event) {
                return menuPromise.then(function() {
                    return MenuEditor.editMenuItem($event, $scope.menuItem || $scope.selectedPage.xid, $scope.menuItemParent, $scope.menuStore, true, 'pageXid');
                }).then(function(result) {
                    $scope.menuItem = result.item;
                    $scope.menuItemParent = result.parent;
                    $scope.menuStore = result.store;
                });
            };
            
            $scope.$watchGroup(['menuItem', 'selectedPage'], function() {
                
                if ($scope.selectedPage && !$scope.selectedPage.isNew) {
                    localStorageService.set('lastSelectedPage', {
                        pageXid: $scope.selectedPage.xid
                    });
                }
                
                
                if ($scope.menuItem) {
                    $scope.viewPageLink = $state.href($scope.menuItem.name);
                } else {
                    $scope.viewPageLink = $scope.selectedPage ? $state.href('dashboard.viewPage', {pageXid: $scope.selectedPage.xid}) : '';
                }
            });
            
            $scope.viewPage = function($event) {
                if (this.menuItem) {
                    $state.go(this.menuItem.name);
                } else {
                    $state.go('dashboard.viewPage', {pageXid: $scope.selectedPage.xid});
                }
            };
            
            // Attempt load lastSelectedPage from local storage
            var lastSelectedPage = localStorageService.get('lastSelectedPage');
            
            if ($stateParams.pageXid) {
                $scope.loadPage($stateParams.pageXid).then(function(selectedPage) {
                    $scope.selectedPageSummary = pageToSummary(selectedPage);
                });
            }
            else if ($stateParams.templateUrl) {
                $templateRequest($stateParams.templateUrl).then(function(data) {
                    $scope.createNewPage(data);
                });
            }
            else if ($stateParams.markup) {
                $scope.createNewPage($stateParams.markup);
            }
            else if (lastSelectedPage) {
                $scope.loadPage(lastSelectedPage.pageXid).then(function(selectedPage) {
                    $scope.selectedPageSummary = pageToSummary(selectedPage);
                });
            }
            
            
            $scope.confirmDeletePage = function confirmDeletePage() {
                var confirm = $mdDialog.confirm()
                    .title(Translate.trSync('dashboards.v3.app.areYouSure'))
                    .textContent(Translate.trSync('dashboards.v3.app.confirmDeletePage'))
                    .ariaLabel(Translate.trSync('dashboards.v3.app.areYouSure'))
                    .targetEvent(event)
                    .ok(Translate.trSync('common.ok'))
                    .cancel(Translate.trSync('common.cancel'));
        
                return $mdDialog.show(confirm).then(function() {
                    return $scope.deletePage();
                });
            };
            
            $scope.deletePage = function deletePage() {
                var pageXid = $scope.selectedPage.xid;
                return $scope.selectedPage.$delete().then(null, function(error) {
                    // consume error, typically when a pre-defined default page is deleted
                }).then(function() {
                    return menuPromise;
                }).then(function(menuStore) {
                    Menu.eachMenuItem(menuStore.jsonData.menuItems, null, function(menuItem, parent, menuItems, i) {
                        if (menuItem.pageXid === pageXid) {
                            menuItems.splice(i, 1);
                        }
                    });
                    return menuStore.$save();
                }).then(function() {
                    for (var i = 0; i < $scope.pageSummaries.length; i++) {
                        if ($scope.pageSummaries[i].xid === $scope.selectedPage.xid) {
                            $scope.pageSummaries.splice(i, 1);
                            break;
                        }
                    }
                    $scope.createNewPage();
                    return pageSummaryStore.$save().then(setPages);
                });
            };
            
            $scope.savePage = function savePage() {
                if ($scope.pageEditForm.$valid) {
                    var newPage = $scope.selectedPage.isNew;
                    
                    return $scope.selectedPage.$save().then(function() {
                        var summary = pageToSummary($scope.selectedPage);
                        var pageSummaries = pageSummaryStore.jsonData.pages;
                        
                        if (newPage) {
                            pageSummaries.push(summary);
                            setPageXidStateParam($scope.selectedPage.xid);
                        } else {
                            for (var i = 0; i < pageSummaries.length; i++) {
                                if (pageSummaries[i].xid === summary.xid) {
                                    angular.copy(summary, pageSummaries[i]);
                                    break;
                                }
                            }
                        }
                        
                        return pageSummaryStore.$save().then(setPages);
                    });
                }
            };
            
            jsonStoreEventManager.smartSubscribe($scope, CUSTOM_USER_PAGES_XID, SUBSCRIPTION_TYPES, function updateHandler(event, payload) {
                pageSummaryStore.jsonData = payload.object.jsonData;
                $scope.pageSummaries = payload.object.jsonData.pages;
            });
            
            function setPageXidStateParam(xid) {
                $state.go('.', {pageXid: xid}, {location: 'replace', notify: false});
            }
            
            function pageToSummary(input) {
                var result = {};
                result.xid = input.xid;
                result.name = input.name;
                result.editPermission = input.editPermission;
                result.readPermission = input.readPermission;
                return result;
            }

        }
    };
};

pageEditor.$inject = ['Page', 'jsonStoreEventManager', 'CUSTOM_USER_PAGES_XID', 'User', 'MenuEditor', '$stateParams', '$state', 'localStorageService', '$mdDialog', 'Translate', 'Menu', '$templateRequest'];

return pageEditor;

}); // define
