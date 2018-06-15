/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire / Will Geller
 */

import pageViewTemplate from './pageView.html';

PageViewController.$inject = ['$scope', 'maUiPages', 'maUser', 'maJsonStoreEventManager'];
function PageViewController($scope, maUiPages, User, jsonStoreEventManager) {
    const SUBSCRIPTION_TYPES = ['add', 'update'];
    
    const $ctrl = this;
    $ctrl.user = User;
    let unsubscribe;

    this.$onChanges = function(changes) {
        if (changes.xid) {
            if (unsubscribe) {
                unsubscribe();
            }
            
            delete $ctrl.page;
            delete $ctrl.markup;
            
            maUiPages.loadPage($ctrl.xid).then(function(page) {
                $ctrl.page = page;
                $ctrl.markup = page.jsonData.markup;
            });
    
            unsubscribe = jsonStoreEventManager.smartSubscribe($scope, $ctrl.xid, SUBSCRIPTION_TYPES, this.updateHandler);
        }
    };
    
    this.updateHandler = function updateHandler(event, payload) {
        $ctrl.markup = payload.object.jsonData.markup;
    };
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
