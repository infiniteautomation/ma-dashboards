/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import menuEditorDialogTemplate from './menuEditorDialog.html';

MenuEditorFactory.$inject = ['maUiMenu', '$mdDialog', 'maTranslate', 'maUiPages', '$q', 'maUtil'];
function MenuEditorFactory(Menu, $mdDialog, Translate, maUiPages, $q, Util) {

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
                    pageXid: pageXid,
                    linkToPage: true,
                    permission: 'user',
                    name: '',
                    url: '',
                    params: {
                        dateBar: {
                            rollupControls: true
                        }
                    }
                };
                if (defaults) {
                    angular.merge(menuItem, defaults);
                }
            }
            
            if (!menuItem.parent) {
                Menu.menuHierarchy.children.some(function(item) {
                    if (item.name === 'ui') {
                        return (menuItem.parent = item);
                    }
                });
                // just in case
                if (!menuItem.parent) {
                    menuItem.parent = Menu.menuHierarchy;
                }
            }

            menuItem.disableTemplateControls = true;
            
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
            
            if (!item.name) {
                item.shortStateName = '';
            } else {
                var splitName = item.name.trim().split('.');
                item.shortStateName = splitName[splitName.length-1];
            }
            
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
            
            if (item.linkToPage) {
                item.templateType = 'linkToPage';
            } else if (item.templateUrl) {
                item.templateType = 'templateUrl';
            } else if (item.href) {
                item.templateType = 'href';
            } else if (item.abstract) {
                item.templateType = 'folder';
            }
            if (!item.target) item.target = '_blank';

            return $mdDialog.show({
                template: menuEditorDialogTemplate,
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                fullscreen: true,
                bindToController: true,
                controllerAs: '$ctrl',
                locals: {
                    item: item,
                    allMenuItems: menuItems,
                    root: menuHierarchy
                },
                controller: ['$mdDialog', function editItemController($mdDialog) {
                    var urlPathMap = {};
                    this.item.parent.children.forEach(function(item) {
                        urlPathMap[item.url] = true;
                    });

                    this.menuItems = this.allMenuItems.filter(function(item) {
                        return item.abstract && item.name !== this.item.name;
                    }.bind(this));

                    maUiPages.getPages().then(function(store) {
                        this.pages = store.jsonData.pages;
                    }.bind(this));
                    
                    this.stateNameChanged = function() {
                        this.calculateStateName();
                        this.menuItemEditForm.stateName.$setValidity('stateExists', this.item.name === origItem.name || !menuItemNameMap[this.item.name]);
                    };

                    this.urlChanged = function() {
                        this.menuItemEditForm.url.$setValidity('urlExists', this.item.url === origItem.url || !urlPathMap[this.item.url]);
                    };
                    
                    this.cancel = function cancel() {
                        $mdDialog.cancel();
                    };
                    
                    this.save = function save() {
                        this.calculateStateName();
                        this.menuItemEditForm.stateName.$setValidity('stateExists', this.item.name === origItem.name || !menuItemNameMap[this.item.name]);
                        if (this.menuItemEditForm.url) {
                            this.menuItemEditForm.url.$setValidity('urlExists', this.item.url === origItem.url || !urlPathMap[this.item.url]);
                        }
                        
                        this.menuItemEditForm.$setSubmitted();
                        if (this.menuItemEditForm.$valid) {
                            $mdDialog.hide();
                        }
                    };
                    
                    this.deleteItem = function() {
                        this.item.deleted = true;
                        $mdDialog.hide();
                    };
                    
                    this.parentChanged = function() {
                        this.calculateStateName();
                    };
                    
                    this.calculateStateName = function() {
                        if (this.item.parent.name) {
                            this.item.name = this.item.parent.name + '.' + this.item.shortStateName;
                        } else {
                            this.item.name = this.item.shortStateName;
                        }
                    };
                    this.calculateStateName();
                    
                    this.menuTextChanged = function() {
                        if (this.item.menuText && this.item.isNew) {
                            if (!this.menuItemEditForm || !this.menuItemEditForm.url || this.menuItemEditForm.url.$pristine) {
                                this.item.url = '/' + Util.snakeCase(Util.titleCase(this.item.menuText).replace(/\s/g, ''));
                            }
                            if (!this.menuItemEditForm || !this.menuItemEditForm.stateName || this.menuItemEditForm.stateName.$pristine) {
                                var titleCase = Util.titleCase(this.item.menuText).replace(/\s/g, '');
                                if (titleCase) {
                                    titleCase = titleCase.charAt(0).toLowerCase() + titleCase.substr(1);
                                    this.item.shortStateName = Util.camelCase(titleCase);
                                    this.calculateStateName();
                                }
                            }
                        }
                    };
                    this.menuTextChanged();
                }]
            }).then(function() {
                delete item.isNew;
                delete item.shortStateName;
                delete item.disableTemplateControls;

                item.menuHidden = !item.showOnMenu;
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
                delete item.dateBarOptions;

                switch (item.templateType) {
                case 'folder':
                    delete item.linkToPage;
                    delete item.pageXid;
                    delete item.href;
                    delete item.target;
                    item.abstract = true;
                    break;
                case 'linkToPage':
                    delete item.templateUrl;
                    delete item.template;
                    delete item.abstract;
                    delete item.href;
                    delete item.target;
                    item.linkToPage = true;
                    break;
                case 'templateUrl':
                    delete item.template;
                    delete item.linkToPage;
                    delete item.pageXid;
                    delete item.abstract;
                    delete item.href;
                    delete item.target;
                    break;
                case 'href':
                    delete item.templateUrl;
                    delete item.template;
                    delete item.linkToPage;
                    delete item.pageXid;
                    delete item.abstract;
                    delete item.url;
                    break;
                }
                delete item.templateType;

                if (item.weight == null) {
                    item.weight = 1000;
                }
                
                if (item.permission == null) {
                    item.permission = '';
                }

                return item;
            });
    };

    return new MenuEditor();
}

export default MenuEditorFactory;


