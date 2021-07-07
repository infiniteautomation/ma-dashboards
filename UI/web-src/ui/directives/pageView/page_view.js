/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import pageViewTemplate from './pageView.html';

class PageViewController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', 'maUiPages', 'maJsonStore']; }
    
    constructor($scope, maUiPages, maJsonStore) {
        this.$scope = $scope;
        this.maUiPages = maUiPages;
        this.maJsonStore = maJsonStore;
    }

    $onChanges(changes) {
        if (changes.xid) {
            delete this.page;
            delete this.markup;
            
            this.maUiPages.loadPage(this.xid).then((page) => {
                this.page = page;
                this.markup = page.jsonData.markup;
            });
    
            const prevUnsubscribe = this.unsubscribe;
            
            this.unsubscribe = this.maJsonStore.notificationManager.subscribe({
                handler: this.updateHandler.bind(this),
                xids: [this.xid],
                scope: this.$scope
            });
            
            if (prevUnsubscribe) {
                prevUnsubscribe();
            }
        }
    }
    
    updateHandler(event, item) {
        this.markup = item.jsonData.markup;
    }
}

export default function pageView() {
    return {
        scope: true, // child scope
        controller: PageViewController,
        controllerAs: '$ctrl', // put controller on scope
        bindToController: {
            xid: '@'
        },
        template: pageViewTemplate
    };
}
