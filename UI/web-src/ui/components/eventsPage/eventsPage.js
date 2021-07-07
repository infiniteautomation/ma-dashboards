/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import eventsPageTemplate from './eventsPage.html';

const anyKeyWord = 'any';

const paramNames = {
    eventType: {
        defaultValue: anyKeyWord,
        updateEventType: true,
        resetParams: ['subType', 'referenceId1', 'referenceId2']
    },
    subType: {
        defaultValue: anyKeyWord,
        updateEventType: true,
        resetParams: ['referenceId1', 'referenceId2']
    },
    referenceId1: {
        defaultValue: anyKeyWord,
        updateEventType: true,
        resetParams: ['referenceId2']
    },
    referenceId2: {
        defaultValue: anyKeyWord,
        updateEventType: true
    },
    alarmLevel: {
        defaultValue: anyKeyWord
    },
    activeStatus: {
        defaultValue: anyKeyWord
    },
    acknowledged: {
        defaultValue: anyKeyWord
    },
    dateFilter: {
        defaultValue: false
    }
};

const parseParamValue = function(value, defaultValue) {
    if (typeof value === 'string') {
        const lower = value.trim().toLowerCase();
        if (lower === 'true') {
            return true;
        } else if (lower === 'false') {
            return false;
        } else if (value.match(/^[\d\.]+$/)) {
            try {
                return Number.parseInt(lower, 10);
            } catch (e) {}
        }
    }
    // map old wildcard value
    if (value === '*') {
        return anyKeyWord;
    }
    if (value == null) {
        return defaultValue;
    }
    return value;
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
        this.values = Object.assign({}, $state.params);
    }

    $onInit() {
        const storedValues = this.localStorageService.get(storageKey) || {};
        
        Object.keys(paramNames).forEach(paramName => {
            const defaultValue = paramNames[paramName].defaultValue;
            const paramValue = this.$state.params[paramName];
            const storedValue = storedValues[paramName];
            
            const normalized = parseParamValue(paramValue || storedValue, defaultValue);
            this.values[paramName] = normalized;
        });
        
        if (this.hasAdvancedOptions()) {
            this.advancedOptionsOpen = true;
        }

        this.updateParams();
        this.updateEventType();
    }

    inputChanged(name) {
        const paramOptions = paramNames[name];
        const storedValues = this.localStorageService.get(storageKey) || {};
        
        if (Array.isArray(paramOptions.resetParams)) {
            paramOptions.resetParams.forEach(k => {
                storedValues[k] = this.values[k] = paramNames[k].defaultValue;
            });
        }
        
        this.updateParams();

        storedValues[name] = this.values[name];
        this.localStorageService.set(storageKey, storedValues);
        
        if (paramOptions.updateEventType) {
            this.updateEventType();
        }
    }
    
    updateParams() {
        const params = {};
        Object.keys(paramNames).forEach(paramName => {
            const defaultValue = paramNames[paramName].defaultValue;
            const value = this.values[paramName];
            
            if (value === defaultValue) {
                params[paramName] = null;
            } else {
                params[paramName] = value;
            }
        });
        this.$state.go('.', params, {location: 'replace', notify: false});
    }
    
    updateEventType() {
        this.eventType = new this.EventTypeInfo.EventType({
            eventType: this.values.eventType === anyKeyWord ? null : this.values.eventType,
            subType: this.values.subType === anyKeyWord ? null : this.values.subType,
            referenceId1: this.values.referenceId1 === anyKeyWord ? 0 : this.values.referenceId1,
            referenceId2: this.values.referenceId2 === anyKeyWord ? 0 : this.values.referenceId2
        });
    }
    
    eventTypeChanged() {
        if (!this.eventType) {
            this.values.eventType = anyKeyWord;
            this.values.subType = anyKeyWord;
            this.values.referenceId1 = anyKeyWord;
            this.values.referenceId2 = anyKeyWord;
        } else {
            this.values.eventType = this.eventType.eventType || anyKeyWord;
            this.values.subType = this.eventType.subType || anyKeyWord;
            this.values.referenceId1 = this.eventType.referenceId1 || anyKeyWord;
            this.values.referenceId2 = this.eventType.referenceId2 || anyKeyWord;
        }
        
        this.updateParams();
        const storedValues = this.localStorageService.get(storageKey) || {};
        storedValues.eventType = this.values.eventType;
        storedValues.subType = this.values.subType;
        storedValues.referenceId1 = this.values.referenceId1;
        storedValues.referenceId2 = this.values.referenceId2;
        this.localStorageService.set(storageKey, storedValues);
    }
    
    toggleAdvancedOptions() {
        this.advancedOptionsOpen = !this.advancedOptionsOpen;
        if (!this.advancedOptionsOpen && this.hasAdvancedOptions()) {
            this.resetToBasic();
        }
    }
    
    hasAdvancedOptions() {
        const advancedEventType = ![anyKeyWord, 'DATA_POINT', 'DATA_SOURCE', 'SYSTEM'].includes(this.values.eventType);
        return advancedEventType || this.values.subType !== anyKeyWord ||
            this.values.referenceId1 !== anyKeyWord || this.values.referenceId2 !== anyKeyWord;
    }
    
    resetToBasic() {
        const advancedEventType = ![anyKeyWord, 'DATA_POINT', 'DATA_SOURCE', 'SYSTEM'].includes(this.values.eventType);
        if (advancedEventType) {
            this.values.eventType = anyKeyWord;
        }
        this.inputChanged('eventType');
    }
}

export default {
    controller: EventsPageController,
    template: eventsPageTemplate
};

