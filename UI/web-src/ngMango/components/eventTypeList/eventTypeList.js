/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import eventTypeListTemplate from './eventTypeList.html';
import './eventTypeList.css';
import MultiMap from '../../classes/MultiMap';

// TODO collapse all by default when rendering?
// TODO cache results for type and subtype

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventTypeList
 * @restrict E
 * @description Displays a list of event types
 */

class EventTypeListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventTypeInfo', 'maEvents', '$filter', 'maPoint']; }
    
    constructor(EventTypeInfo, maEvents, $filter, Point) {
        this.EventTypeInfo = EventTypeInfo;
        this.orderBy = $filter('orderBy');
        this.Point = Point;
        
        this.alarmLevels = maEvents.levels.reduce((map, level) => (map[level.key] = level, map), {});
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        this.typesPromise = this.EventTypeInfo.list().then(items => {
            return this.orderBy(items, 'description');
        });
    }
    
    $onChanges(changes) {
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(Array.from(this.selected.values()));
    }
    
    render() {
        this.selected = new this.EventTypeInfo.EventTypeMap();
        this.childrenByTypeId = new MultiMap();

        const selectedTypes = this.ngModelCtrl.$viewValue;
        if (!Array.isArray(selectedTypes)) return;
        
        selectedTypes.forEach(eventType => {
            this.selectEventType(eventType);
        });
    }

    selectedGetterSetter(eventType) {
        return value => {
            if (value === undefined) {
                return this.selected.has(eventType);
            }
            
            if (value) {
                // remove the more specific forms of the event type from the map
                const children = this.childrenByTypeId.get(eventType.typeId);
                for (let c of children) {
                    this.deselectEventType(c);
                }

                this.selectEventType(eventType);
            } else {
                this.deselectEventType(eventType);
            }
            
            this.setViewValue();
        };
    }
    
    selectEventType(eventType) {
        this.selected.set(eventType, eventType);
        
        for (let id of eventType.matchingIds) {
            this.childrenByTypeId.set(id, eventType);
        }
    }

    deselectEventType(eventType) {
        const deleted = this.selected.delete(eventType, true);
        for (let d of deleted) {
            for (let id of d.matchingIds) {
                this.childrenByTypeId.delete(id, d);
            }
        }
    }
    
    getSelectedCount(eventType) {
        return this.childrenByTypeId.get(eventType.typeId).size;
    }
    
    hasSelectedCount(eventType) {
        return this.childrenByTypeId.has(eventType.typeId);
    }
}

export default {
    template: eventTypeListTemplate,
    controller: EventTypeListController,
    bindings: {
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.eventTypeList',
        icon: 'priority_high'
    }
};
