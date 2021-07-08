/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import menuEditorDialogTemplate from './menuEditorDialog.html';

MenuEditorFactory.$inject = ['maUiMenu', '$mdDialog', 'maTranslate', 'maUiPages', '$q', 'maUtil', 'maSystemPermission'];
function MenuEditorFactory(Menu, $mdDialog, Translate, maUiPages, $q, Util, maSystemPermission) {

    class MenuEditor {
    
        getMenuItemForPageXid(pageXid) {
            return Menu.getMenu().then((menuItems) => {
                let menuItem = null;
                menuItems.some((item) => {
                    if (item.linkToPage && item.pageXid === pageXid) {
                        menuItem = item;
                        return true;
                    }
                });
                return menuItem;
            });
        }
        
        editMenuItemForPageXid(event, pageXid, defaults) {
            return this.getMenuItemForPageXid(pageXid).then((menuItem) => {
                if (!menuItem) {
                    menuItem = {
                        isNew: true,
                        pageXid: pageXid,
                        linkToPage: true,
                        permission: [],
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
                    Menu.menuHierarchy.children.some((item) => {
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
                
                return this.editMenuItem(event, Menu.menuHierarchy, menuItem).then((newItem) => {
                    if (newItem.deleted) {
                        return Menu.removeMenuItem(menuItem.name).then(() => {
                            return null;
                        });
                    } else {
                        return Menu.saveMenuItem(newItem, !menuItem.isNew && menuItem.name).then(() => {
                            return newItem;
                        });
                    }
                });
            });
        }
        
        editMenuItem(event, menuHierarchy, origItem) {
            // build flat menu item array so we can choose any item in dropdown
            const menuItems = [];
            const menuItemNameMap = {};
            
            Menu.forEach(menuHierarchy.children, (menuItem) => {
                menuItems.push(menuItem);
                menuItemNameMap[menuItem.name] = true;
            });

            // copy the item so we can discard changes
            const item = angular.copy(origItem);
            item.parent = origItem.parent;
            
            if (!item.name) {
                item.shortStateName = '';
            } else {
                const splitName = item.name.trim().split('.');
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
            } else if (item.template) {
                item.templateType = 'template';
            } else {
                item.templateType = 'none';
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
                    const urlPathMap = {};

                    this.stateNameChanged = () => {
                        this.calculateStateName();
                        this.menuItemEditForm.stateName.$setValidity('stateExists', this.item.name === origItem.name || !menuItemNameMap[this.item.name]);
                    };

                    this.urlChanged = () => {
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
                    
                    this.deleteItem = () => {
                        this.item.deleted = true;
                        $mdDialog.hide();
                    };
                    
                    this.parentChanged = () => {
                        this.calculateStateName();
                    };
                    
                    this.calculateStateName = () => {
                        if (this.item.parent.name) {
                            this.item.name = this.item.parent.name + '.' + this.item.shortStateName;
                        } else {
                            this.item.name = this.item.shortStateName;
                        }
                    };
                    
                    this.menuTextChanged = () => {
                        if (this.item.menuText && this.item.isNew) {
                            if (!this.menuItemEditForm || !this.menuItemEditForm.url || this.menuItemEditForm.url.$pristine) {
                                this.item.url = '/' + Util.snakeCase(Util.titleCase(this.item.menuText).replace(/\s/g, ''));
                            }
                            if (!this.menuItemEditForm || !this.menuItemEditForm.stateName || this.menuItemEditForm.stateName.$pristine) {
                                let titleCase = Util.titleCase(this.item.menuText).replace(/\s/g, '');
                                if (titleCase) {
                                    titleCase = titleCase.charAt(0).toLowerCase() + titleCase.substr(1);
                                    this.item.shortStateName = Util.camelCase(titleCase);
                                    this.calculateStateName();
                                }
                            }
                        }
                    };

                    this.getSystemPermissions = (filter) => {
                        const builder = maSystemPermission.buildQuery();

                        if (filter) {
                            const filterWildcard = `*${filter}*`;
                            builder.or()
                                .match('moduleName', filterWildcard)
                                .match('description', filterWildcard)
                                .up()
                        }

                        return builder.sort('moduleName', 'description')
                            .query();
                    };
                    
                    this.item.parent.children.forEach((item) => {
                        urlPathMap[item.url] = true;
                    });

                    // list of "folder" menu items, for chosing a parent
                    this.menuItems = this.allMenuItems.filter((item) => {
                        return item.abstract && item.name !== this.item.name;
                    });

                    maUiPages.getPages().then((store) => {
                        this.pages = store.jsonData.pages;
                    });

                    this.calculateStateName();
                    this.menuTextChanged();
                }]
            }).then(() => {
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
                case 'none':
                    delete item.templateUrl;
                    delete item.template;
                    delete item.linkToPage;
                    delete item.pageXid;
                    delete item.href;
                    delete item.target;
                    break;
                case 'linkToPage':
                    delete item.templateUrl;
                    delete item.template;
                    delete item.href;
                    delete item.target;
                    item.linkToPage = true;
                    break;
                case 'templateUrl':
                    delete item.template;
                    delete item.linkToPage;
                    delete item.pageXid;
                    delete item.href;
                    delete item.target;
                    break;
                case 'href':
                    delete item.templateUrl;
                    delete item.template;
                    delete item.linkToPage;
                    delete item.pageXid;
                    delete item.url;
                    break;
                }
                delete item.templateType;

                if (item.weight == null) {
                    item.weight = 1000;
                }
                
                if (item.permission == null) {
                    item.permission = [];
                }

                return item;
            });
        }
    }

    return new MenuEditor();
}

export default MenuEditorFactory;


