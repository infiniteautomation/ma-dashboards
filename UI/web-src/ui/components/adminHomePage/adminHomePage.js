/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import pageTemplate from './adminHomePage.html';
import './adminHomePage.css';

class PageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUiPages', '$injector', 'maUiMenu', 'maUser']; }
    
    constructor(maUiPages, $injector, maUiMenu, maUser) {
        this.maUiPages = maUiPages;
        this.$injector = $injector;
        this.maUiMenu = maUiMenu;
        this.maUser = maUser;
    }

    $onInit() {
        this.maUiPages.getPages().then(store => {
            this.pageCount = store.jsonData.pages.length;
        });
        
        this.hasDashboardDesigner = !!this.$injector.modules.maDashboardDesigner;
        
        this.maUiMenu.getMenu().then(menu => {
            this.utilityMenuItems = menu.filter(item => item.showInUtilities);
        });
    }
}

export default {
    controller: PageController,
    template: pageTemplate
};
