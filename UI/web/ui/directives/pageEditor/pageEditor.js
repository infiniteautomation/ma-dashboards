/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

pageEditor.$inject = ['Page', 'jsonStoreEventManager', 'CUSTOM_USER_PAGES_XID', 'User', 'MenuEditor', '$stateParams', '$state', 'localStorageService', '$mdDialog', 'Translate', 'Menu', '$templateRequest', '$q'];
function pageEditor(Page, jsonStoreEventManager, CUSTOM_USER_PAGES_XID, User, MenuEditor, $stateParams, $state, localStorageService, $mdDialog, Translate, Menu, $templateRequest, $q) {
    var SUBSCRIPTION_TYPES = ['add', 'update'];

    return {
        scope: true,
        templateUrl: require.toUrl('./pageEditor.html'),
        link: function($scope, $element) {
            $scope.User = User;
            $scope.showEditor = true;
            $scope.showPreview = true;

            var pageSummaryStore;

            $scope.createNewPage = function createNewPage(markup) {
                this.selectedPage = Page.newPageContent();
                this.selectedPage.jsonData.markup = markup || '';
                this.selectedPageSummary = pageToSummary(this.selectedPage);
                this.menuItem = null;
                this.updateViewLink();
                setPageXidStateParam(null);
                return this.selectedPage;
            };
            
            function setPages(store) {
                pageSummaryStore = store;
                $scope.pageSummaries = store.jsonData.pages;
            }
            
            Page.getPages().then(setPages);
            
            $scope.loadPage = function loadPage(xid) {
                var menuItemPromise = MenuEditor.getMenuItemForPageXid(xid).then(function(menuItem) {
                    $scope.menuItem = menuItem;
                }, angular.noop);
                
                var pagePromise = Page.loadPage(xid).then(function(pageStore) {
                    localStorageService.set('lastSelectedPage', {
                        pageXid: pageStore.xid
                    });
                    setPageXidStateParam(pageStore.xid);
                    $scope.selectedPage = pageStore;
                    return pageStore;
                }, function(error) {
                    return $scope.createNewPage();
                });
                
                return $q.all([menuItemPromise, pagePromise]).then(function(result) {
                    var pageStore = result[1];
                    $scope.updateViewLink();
                    return pageStore;
                });
            };
            
            $scope.editMenuItem = function($event) {
                var defaults = {
                    menuText: $scope.selectedPage.name,
                    permission: $scope.selectedPage.readPermission
                };
                return MenuEditor.editMenuItemForPageXid($event, $scope.selectedPage.xid, defaults).then(function(menuItem) {
                    $scope.menuItem = menuItem;
                    $scope.updateViewLink();
                });
            };
            
            $scope.updateViewLink = function() {
                if ($scope.menuItem) {
                    $scope.viewPageLink = $state.href($scope.menuItem.name);
                } else {
                    $scope.viewPageLink = $scope.selectedPage ? $state.href('ui.viewPage', {pageXid: $scope.selectedPage.xid}) : '';
                }
            };

            $scope.viewPage = function($event) {
                if (this.menuItem) {
                    $state.go(this.menuItem.name);
                } else {
                    $state.go('ui.viewPage', {pageXid: $scope.selectedPage.xid});
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
            else if (lastSelectedPage && lastSelectedPage.pageXid) {
                $scope.loadPage(lastSelectedPage.pageXid).then(function(selectedPage) {
                    $scope.selectedPageSummary = pageToSummary(selectedPage);
                });
            }
            
            $scope.confirmDeletePage = function confirmDeletePage() {
                var confirm = $mdDialog.confirm()
                    .title(Translate.trSync('ui.app.areYouSure'))
                    .textContent(Translate.trSync('ui.app.confirmDeletePage'))
                    .ariaLabel(Translate.trSync('ui.app.areYouSure'))
                    .targetEvent(event)
                    .ok(Translate.trSync('common.ok'))
                    .cancel(Translate.trSync('common.cancel'));
        
                return $mdDialog.show(confirm).then(function() {
                    return $scope.deletePage();
                });
            };
            
            $scope.deletePage = function deletePage() {
                var pageXid = $scope.selectedPage.xid;
                
                // consume errors, page might not exist in store for build in demo pages etc
                var pageDeletedPromise = $scope.selectedPage.$delete().then(null, angular.noop);
                var menuItemDeletedPromise = $q.when();
                if ($scope.menuItem) {
                    var menuItemName = $scope.menuItem.name;
                    menuItemDeletedPromise = Menu.removeMenuItem(menuItemName).then(null, angular.noop);
                }
                
                $q.all([pageDeletedPromise, menuItemDeletedPromise]).then(function() {
                    for (var i = 0; i < $scope.pageSummaries.length; i++) {
                        if ($scope.pageSummaries[i].xid === pageXid) {
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
}

return pageEditor;

}); // define
