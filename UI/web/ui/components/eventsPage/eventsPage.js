/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

const paramNames = ['eventType', 'alarmLevel', 'activeStatus', 'acknowledged', 'dateFilter'];

EventsPageController.$inject = ['$mdMedia', '$state', 'localStorageService', 'maUiDateBar'];
function EventsPageController($mdMedia, $state, localStorageService, maUiDateBar) {

    this.$mdMedia = $mdMedia;
    this.dateBar = maUiDateBar;
    
    this.sort = '-activeTimestamp';
    this.params = $state.params;

    this.$onInit = function() {
        const params = this.params;
        
        paramNames.forEach(prop => {
            const storageKey = 'lastEvent-' + prop;
            
            const paramValue = params[prop];
            const filterValue = paramValue != null ? paramValue : localStorageService.get(storageKey);
            const normalized = this.normalizeFilter(filterValue, prop === 'dateFilter' ? false : 'any');

            params[prop] = normalized;
            localStorageService.set(storageKey, normalized);
        });
        
        $state.go('.', params, {location: 'replace', notify: false});
    };
    
    this.normalizeFilter = function(value, defaultValue) {
        if (typeof value === 'string') {
            const lower = value.trim().toLowerCase();
            if (lower === 'true') {
                return true;
            } else if (lower === 'false') {
                return false;
            }
        }
        // map old wildcard value
        if (value === '*') {
            return 'any';
        }
        if (value == null) {
            return defaultValue;
        }
        return value;
    };

    this.storeState = function(type) {
        const filterValue = this.params[type];
        const storageKey = 'lastEvent-' + type;

        $state.go('.', this.params, {location: 'replace', notify: false});
        localStorageService.set(storageKey, filterValue);
    };
}

return {
    controller: EventsPageController,
    templateUrl: require.toUrl('./eventsPage.html')
};

}); // define