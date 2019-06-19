/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 * @author Jared Wiltshire
 */

import eventsPageTemplate from './eventsPage.html';

const paramNames = {
    eventType: {
        defaultValue: 'any'
    },
    alarmLevel: {
        defaultValue: 'any'
    },
    activeStatus: {
        defaultValue: 'any'
    },
    acknowledged: {
        defaultValue: 'any'
    },
    dateFilter: {
        defaultValue: false
    }
};

const storageKey = 'eventsPageSettings';

class EventsPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$mdMedia', '$state', 'localStorageService', 'maUiDateBar', 'maEventTypeInfo']; }
    
    constructor($mdMedia, $state, localStorageService, maUiDateBar, EventTypeInfo) {
        this.$mdMedia = $mdMedia;
        this.$state = $state;
        this.localStorageService = localStorageService;
        this.dateBar = maUiDateBar;
        this.EventTypeInfo = EventTypeInfo;
        
        this.sort = '-activeTimestamp';
        this.params = Object.assign({}, $state.params);
    }

    $onInit() {
        const storedValues = this.localStorageService.get(storageKey) || {};
        
        Object.keys(paramNames).forEach(paramName => {
            const defaultValue = paramNames[paramName].defaultValue;
            const paramValue = this.params[paramName];
            const storedValue = storedValues[paramName];
            
            const normalized = this.normalizeFilter(paramValue || storedValue, defaultValue);
            this.params[paramName] = normalized;
        });

        this.$state.go('.', this.params, {location: 'replace', notify: false});
    }

    normalizeFilter(value, defaultValue) {
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
    }

    storeState(type) {
        this.$state.go('.', this.params, {location: 'replace', notify: false});

        const storedValues = this.localStorageService.get(storageKey) || {};
        storedValues[type] = this.params[type];
        this.localStorageService.set(storageKey, storedValues);
    }
}

export default {
    controller: EventsPageController,
    template: eventsPageTemplate
};

