/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import pageEditorControlsTemplate from './pageEditorControls.html';
import angular from 'angular';


const pageToSummary = (input) => {
    const result = {};
    result.xid = input.xid;
    result.name = input.name;
    result.editPermission = input.editPermission;
    result.readPermission = input.readPermission;
    return result;
};

class PageEditorControlsController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', 'maUiPages', 'MA_UI_PAGES_XID', 'maUiMenuEditor', '$state',
        'localStorageService', '$mdDialog', '$mdToast', 'maTranslate', 'maUiMenu', '$window', 'maUser', '$q',
        '$templateRequest', 'maDialogHelper', 'maRevisionHistoryDialog', 'maJsonStore', 'maUtil']; }
    
    constructor($scope, maUiPages, MA_UI_PAGES_XID, maUiMenuEditor, $state,
            localStorageService, $mdDialog, $mdToast, Translate, Menu, $window, User, $q,
            $templateRequest, maDialogHelper, maRevisionHistoryDialog, maJsonStore, maUtil) {
        this.$scope = $scope;
        this.maUiPages = maUiPages;
        this.MA_UI_PAGES_XID = MA_UI_PAGES_XID;
        this.MenuEditor = maUiMenuEditor;
        this.$state = $state;
        this.localStorageService = localStorageService;
        this.$mdDialog = $mdDialog;
        this.$mdToast = $mdToast;
        this.Translate = Translate;
        this.Menu = Menu;
        this.$window = $window;
        this.User = User; // used in template
        this.$q = $q;
        this.$templateRequest = $templateRequest;
        this.$window = $window;
        this.maDialogHelper = maDialogHelper;
        this.maRevisionHistoryDialog = maRevisionHistoryDialog;
        this.maJsonStore = maJsonStore;
        this.maUtil = maUtil;
    }

    $onInit() {
        const Translate = this.Translate;
        const $window = this.$window;
        
        this.maJsonStore.notificationManager.subscribe({
            scope: this.$scope,
            xids: [this.MA_UI_PAGES_XID],
            handler: (event, item) => {
                this.pageSummaryStore.jsonData = item.jsonData;
                this.filterPages();
            }
        });
        
        this.$scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
            if (event.defaultPrevented) return;
            
            if (this.pageEditorForm.$dirty || this.selectedPage.$dirty) {
                if (!$window.confirm(Translate.trSync('ui.app.discardUnsavedChanges'))) {
                    event.preventDefault();
                }
            }
        });
    
        const oldUnload = $window.onbeforeunload;
        $window.onbeforeunload = (event) => {
            if (this.inputsDirty() || this.selectedPage.$dirty) {
                const text = Translate.trSync('ui.app.discardUnsavedChanges');
                event.returnValue = text;
                return text;
            }
        };
    
        const keyDownHandler = this.keyDownHandler.bind(this);
        angular.element($window).on('keydown', keyDownHandler);

        this.$scope.$on('$destroy', function() {
            $window.onbeforeunload = oldUnload;
            angular.element($window).off('keydown', keyDownHandler);
        });

        this.maUiPages.getPages().then(pageSummaryStore => {
            this.pageSummaryStore = pageSummaryStore;
            this.filterPages();
        }, error => {
            this.pageSummaryStore = null;
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.errorGettingPages', 'error.mangoStatusText'],
                hideDelay: 10000,
                classes: 'md-warn'
            });
        });
    
        // Attempt load lastSelectedPage from local storage
        const lastSelectedPage = this.localStorageService.get('lastSelectedPage');
        
        if (this.$state.params.pageXid) {
            this.loadPage(this.$state.params.pageXid);
        } else if (this.$state.params.templateUrl) {
            this.$templateRequest(this.$state.params.templateUrl).then(markup => {
                this.createNewPage(markup);
            });
        } else if (this.$state.params.markup) {
            this.createNewPage(this.$state.params.markup);
        } else if (lastSelectedPage && lastSelectedPage.pageXid) {
            this.loadPage(lastSelectedPage.pageXid);
        } else {
            this.createNewPage();
        }
    }
    
    filterPages() {
        const user = this.User.current;
        this.pageList = this.pageSummaryStore.jsonData.pages.filter(p => {
            return user.hasPermission(p.editPermission);
        }).sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            if (aName < bName) return -1;
            if (aName > bName) return 1;
            return 0;
        });
    }

    searchPages(filter) {
        const pages = this.pageList || [];
        if (!filter) {
            return pages;
        }
        const escaped = this.maUtil.escapeRegExp(filter);
        return pages.filter(p => (new RegExp(escaped, 'gi')).test(p.name));
    }
    
    createNewPage(markup) {
        const page = this.maUiPages.newPageContent();
        if (!markup && this.newPageContents) {
            markup = this.newPageContents();
        }
        page.jsonData.markup = markup || '';
        this.menuItem = null;
        return this.setSelectedPage(page);
    }
    
    inputsDirty() {
        return this.pageEditorForm && this.pageEditorForm.$dirty;
    }

    pageChanged() {
        this.confirmLoadPage(this.selectedPageSummary ? this.selectedPageSummary.xid : null);
    }

    newPageClicked(event) {
        if (this.confirmLoadPage()) {
            this.showDialog();
        }
    }
    
    confirmLoadPage(xid) {
        if (this.inputsDirty() || this.selectedPage.$dirty) {
            if (!this.$window.confirm(this.Translate.trSync('ui.app.discardUnsavedChanges'))) {
                this.selectedPageSummary = this.prevSelectedPageSummary;
                return;
            }
        }

        if (xid) {
            this.loadPage(xid);
        } else {
            this.createNewPage();
        }
        return true;
    }
    
    loadPage(xid) {
        const menuItemPromise = this.MenuEditor.getMenuItemForPageXid(xid).then(menuItem => {
            return (this.menuItem = menuItem);
        }, angular.noop);
        
        const pagePromise = this.maUiPages.loadPage(xid).then(page => {
            this.localStorageService.set('lastSelectedPage', {
                pageXid: page.xid
            });
            return page;
        });
        
        return this.$q.all([menuItemPromise, pagePromise]).then(([menuItem, page]) => {
            return this.setSelectedPage(page);
        }, () => {
            return this.createNewPage();
        });
    }
    
    setSelectedPage(page, triggerChange) {
        if (triggerChange == null) triggerChange = true;
        
        this.selectedPage = page;
        this.prevSelectedPageSummary = this.selectedPageSummary = page.isNew() ? null : pageToSummary(page);
        this.updateViewLink();

        // form might not have initialized
        if (this.pageEditorForm) {
            this.pageEditorForm.$setPristine();
            this.pageEditorForm.$setUntouched();
        }

        if (triggerChange && this.onPageChanged) {
            this.onPageChanged({$page: page});
        }
        return page;
    }
    
    updateViewLink() {
        const xid = this.selectedPage.isNew() ? null : this.selectedPage.xid;
        
        if (this.menuItem) {
            this.viewPageLink = this.$state.href(this.menuItem.name);
        } else {
            this.viewPageLink = this.$state.href('ui.viewPage', {pageXid: xid});
        }
        
        this.$state.params.pageXid = xid;
        this.$state.go('.', this.$state.params, { location: 'replace', notify: false });
    }
    
    editMenuItem(event) {
        const defaults = {
            menuText: this.selectedPage.name,
            permission: this.selectedPage.readPermission
        };
        return this.MenuEditor.editMenuItemForPageXid(event, this.selectedPage.xid, defaults).then(menuItem => {
            this.menuItem = menuItem;
            this.updateViewLink();
        });
    }
    
    confirmDeletePage(event) {
        const Translate = this.Translate;
        
        const confirm = this.$mdDialog.confirm()
            .title(Translate.trSync('ui.app.areYouSure'))
            .textContent(Translate.trSync('ui.app.confirmDeletePage'))
            .ariaLabel(Translate.trSync('ui.app.areYouSure'))
            .targetEvent(event)
            .ok(Translate.trSync('common.ok'))
            .cancel(Translate.trSync('common.cancel'));
    
        return this.$mdDialog.show(confirm).then(() => {
            this.deletePage(this);
        });
    }
    
    deletePage() {
        const pageXid = this.selectedPage.xid;
        
        // consume errors, page might not exist in store for build in demo pages etc
        const pageDeletedPromise = this.selectedPage.$delete().then(null, angular.noop);
        let menuItemDeletedPromise;
        if (this.menuItem) {
            menuItemDeletedPromise = this.Menu.removeMenuItem(this.menuItem.name).then(null, angular.noop);
        } else {
            menuItemDeletedPromise = this.$q.when();
        }
        
        this.$q.all([pageDeletedPromise, menuItemDeletedPromise]).then(() => {
            const pageSummaries = this.pageSummaryStore.jsonData.pages;
            
            const pageIndex = pageSummaries.findIndex(ps => ps.xid === pageXid);
            if (pageIndex >= 0) {
                pageSummaries.splice(pageIndex, 1);
            }
            
            this.createNewPage();
            
            return this.pageSummaryStore.$save().then(result => {
                this.filterPages();
            });
        });
    }
    
    savePage(dialog) {
        this.pageEditorForm.$setSubmitted();
        if (this.pageEditorForm.$valid) {
            return this.selectedPage.$save().then(page => {
                this.localStorageService.set('lastSelectedPage', {
                    pageXid: page.xid
                });
    
                this.prevSelectedPageSummary = this.selectedPageSummary = pageToSummary(page);
                this.updateViewLink();
                this.pageEditorForm.$setPristine();
                this.pageEditorForm.$setUntouched();
    
                const pageSummaries = this.pageSummaryStore.jsonData.pages;
                const existing = pageSummaries.find(ps => ps.xid === page.xid);
                if (existing) {
                    angular.copy(this.selectedPageSummary, existing);
                } else {
                    pageSummaries.push(this.selectedPageSummary);
                }

                return this.pageSummaryStore.$save();
            }).then(result => {
                this.filterPages();
                
                const toast = this.$mdToast.simple()
                    .textContent(this.Translate.trSync('ui.app.pageSaved', [this.selectedPage.name]))
                    .action(this.Translate.trSync('common.ok'))
                    .actionKey('o')
                    .highlightAction(true)
                    .position('bottom center')
                    .hideDelay(5000);

                this.$mdToast.show(toast);
                if (dialog) {
                    dialog.hide();
                }
            }, error => {
                const errorToast = this.$mdToast.simple()
                    .textContent(this.Translate.trSync('ui.app.errorSavingPage', [this.selectedPage.name, error.mangoStatusText]))
                    .action(this.Translate.trSync('common.ok'))
                    .actionKey('o')
                    .highlightAction(true)
                    .position('bottom center')
                    .toastClass('md-warn')
                    .hideDelay(10000);

                this.$mdToast.show(errorToast);
            });
        } else {
            this.showDialog();
        }
    }

    showDialog() {
        if (!this.showInputs) {
            this.showInputs = {};
        }
    }

    keyDownHandler(event) {
        // ctrl-s
        if ((event.ctrlKey || event.metaKey) && event.which === 83) {
            event.preventDefault();
            this.$scope.$applyAsync(() => {
                this.savePage();
            });
        }
    }
    
    showRevisionDialog(event) {
        this.maRevisionHistoryDialog.show(event, {
            typeName: 'JSON_DATA',
            objectId: this.selectedPage.id,
            filterValues: val => val.context && !!val.context.jsonData
        }).then(revision => {
            this.selectedPage.jsonData = angular.fromJson(revision.context.jsonData);
            this.selectedPage.$dirty = true;

            if (this.onPageChanged) {
                this.onPageChanged({$page: this.selectedPage});
            }
            
        }, angular.noop);
    }
}

pageEditorControlsFactory.$inject = [];
function pageEditorControlsFactory() {
    return {
        restrict: 'E',
        scope: {},
        template: pageEditorControlsTemplate,
        controller: PageEditorControlsController,
        controllerAs: '$ctrl',
        bindToController: {
            onPageChanged: '&?',
            newPageContents: '&?'
        },
        transclude: {
            extraControls: '?extraControls'
        }
    };
}

export default pageEditorControlsFactory;


