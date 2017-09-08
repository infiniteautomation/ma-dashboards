/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

EventsPageController.$inject = ['$mdMedia', '$stateParams', '$state', 'localStorageService', 'maUiDateBar'];
function EventsPageController($mdMedia, $stateParams, $state, localStorageService, maUiDateBar) {
    
    var $ctrl = this;
    $ctrl.$mdMedia = $mdMedia;
    $ctrl.dateBar = maUiDateBar;
    
    this.sort = '-activeTimestamp';
    
    $ctrl.$onInit = function() {
        for (let prop in $stateParams) {
            let stateFilterValue = $stateParams[prop];
            if (prop !== 'dateBar' && prop !== 'helpPage') {
                if (stateFilterValue === undefined) {
                    let storedFilterValue = localStorageService.get('lastEvent-' + prop);

                    if (prop === 'dateFilter') {
                        $ctrl[prop] = storedFilterValue || false;
                    }
                    else {
                        $ctrl[prop] = storedFilterValue || '*';
                    }
                }
                else {
                    $ctrl[prop] = stateFilterValue === 'true' ? true : false;
                }
            }
        }
    };

    $ctrl.storeState = (type) => {
        let newFilterValue = $ctrl[type];
        let storageKey = 'lastEvent-' + type;
        let stateObj = {};
        stateObj[type] = newFilterValue;

        $state.go('.', stateObj, {location: 'replace', notify: false});
        localStorageService.set(storageKey, newFilterValue);
    };
}

return {
    controller: EventsPageController,
    templateUrl: require.toUrl('./eventsPage.html')
};

}); // define