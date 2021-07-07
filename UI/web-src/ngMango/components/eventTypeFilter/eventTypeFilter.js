/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import eventTypeFilterTemplate from './eventTypeFilter.html';
import './eventTypeFilter.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventTypeFilter
 * @restrict E
 * @description Provides an interface for selecting an event type in order to filter a list of events or event handlers
 */

class EventTypeFilterController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventTypeInfo']; }
    
    constructor(EventTypeInfo) {
        this.EventTypeInfo = EventTypeInfo;
        
        this.eventType = null;
        this.subType = null;
        this.referenceId1 = 0;
        this.referenceId2 = 0;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    render() {
        const value = this.ngModelCtrl.$viewValue;

        if (value) {
            this.eventType = value.eventType;
            this.subType = value.subType;
            this.referenceId1 = value.referenceId1;
            this.referenceId2 = value.referenceId2;
        } else {
            this.eventType = null;
            this.subType = null;
            this.referenceId1 = 0;
            this.referenceId2 = 0;
        }

        delete this.eventTypeInfo;
        delete this.subTypeInfo;
        delete this.referenceId1Info;
        delete this.referenceId2Info;
        
        Promise.resolve().then(() => {
            if (this.eventType) {
                return this.getEventTypes().then(() => {
                    this.eventTypeInfo = this.eventTypes.find(info => info.type.eventType === this.eventType);
                    this.subTypeInfo = this.eventTypeInfo;
                });
            }
        }).then(() => {
            if (this.subType && this.eventTypeInfo && this.eventTypeInfo.supportsSubtype) {
                return this.getSubTypes().then(() => {
                    this.subTypeInfo = this.subTypes.find(info => info.type.subType === this.subType);
                });
            }
        }).then(() => {
            if (this.referenceId1 && this.subTypeInfo && this.subTypeInfo.supportsReferenceId1) {
                return this.getReferenceId1s().then(() => {
                    this.referenceId1Info = this.referenceId1s.find(info => info.type.referenceId1 === this.referenceId1);
                });
            }
        }).then(() => {
            if (this.referenceId2 && this.referenceId1Info && this.referenceId1Info.supportsReferenceId2) {
                return this.getReferenceId2s().then(() => {
                    this.referenceId2Info = this.referenceId2s.find(info => info.type.referenceId2 === this.referenceId2);
                });
            }
        });
    }
    
    setViewValue() {
        if (!this.eventType) {
            this.ngModelCtrl.$setViewValue(null);
        } else {
            this.ngModelCtrl.$setViewValue(new this.EventTypeInfo.EventType({
                eventType: this.eventType,
                subType: this.subType,
                referenceId1: this.referenceId1,
                referenceId2: this.referenceId2
            }));
        }
    }
    
    eventTypeChanged() {
        this.eventTypeInfo = this.eventTypes.find(info => info.type.eventType === this.eventType);
        this.subTypeInfo = this.eventTypeInfo;
        delete this.referenceId1Info;
        delete this.referenceId2Info;

        this.subType = null;
        this.referenceId1 = 0;
        this.referenceId2 = 0;

        this.setViewValue();
    }
    
    subTypeChanged() {
        this.subTypeInfo = this.subTypes.find(info => info.type.subType === this.subType);
        delete this.referenceId1Info;
        delete this.referenceId2Info;
        
        this.referenceId1 = 0;
        this.referenceId2 = 0;

        this.setViewValue();
    }
    
    referenceId1Changed() {
        this.referenceId1Info = this.referenceId1s.find(info => info.type.referenceId1 === this.referenceId1);
        delete this.referenceId2Info;
        
        this.referenceId2 = 0;

        this.setViewValue();
    }
    
    referenceId2Changed() {
        this.referenceId2Info = this.referenceId2s.find(info => info.type.referenceId2 === this.referenceId2);
        
        this.setViewValue();
    }
    
    getEventTypes() {
        this.eventTypesPromise = this.EventTypeInfo.list().then(eventTypes => {
            // cannot query audit events from the events endpoint, remove this option from the list
            return (this.eventTypes = eventTypes.filter(info => info.type.eventType !== 'AUDIT'));
        });
        return this.eventTypesPromise;
    }
    
    getSubTypes() {
        this.subTypesPromise = this.eventTypeInfo.loadChildren().then(subTypes => {
            return (this.subTypes = subTypes);
        });
        return this.subTypesPromise;
    }
    
    getReferenceId1s() {
        this.referenceId1sPromise = this.subTypeInfo.loadChildren().then(referenceId1s => {
            return (this.referenceId1s = referenceId1s);
        });
        return this.referenceId1sPromise;
    }
    
    getReferenceId2s() {
        this.referenceId2sPromise = this.referenceId1Info.loadChildren().then(referenceId2s => {
            return (this.referenceId2s = referenceId2s);
        });
        return this.referenceId2sPromise;
    }
}

export default {
    template: eventTypeFilterTemplate,
    controller: EventTypeFilterController,
    bindings: {
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.eventTypeFilter',
        icon: 'filter_list'
    }
};