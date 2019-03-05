/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventTypeListTemplate from './eventTypeList.html';
import './eventTypeList.css';

// TODO show number of more specific items underneath that are checked
// TODO expand tree when rendering

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
        
        this.typesPromise = this.EventTypeInfo.list().then(eventTypes => {
            return eventTypes.filter(et => et.subType == null);
        });
    }
    
    $onChanges(changes) {
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(Array.from(this.selected.values()));
    }
    
    render() {
        this.selected = new Map();

        const selectedTypes = this.ngModelCtrl.$viewValue;
        if (!Array.isArray(selectedTypes)) return;
        
        selectedTypes.forEach(eventType => {
            this.selected.set(eventType.typeId, eventType);
        });
    }

    loadSpecificEventTypes(info) {
        return this.EventTypeInfo.list(info.type);
    }
    
    hasChildren(info) {
        const eventType = info.type;
        if (eventType.referenceId1 && eventType.referenceId2) {
            return false;
        } else if (eventType.referenceId1) {
            return info.supportsReferenceId2;
        } else {
            return info.supportsReferenceId1;
        }
    }
    
    selectedGetterSetter(eventType) {
        return value => {
            const id = eventType.typeId;
            
            if (value === undefined) {
                return this.selected.has(id);
            }
            
            if (value) {
                this.selected.set(id, eventType);
                // TODO uncheck any more specific event types
            } else {
                this.selected.delete(id);
            }
            
            this.setViewValue();
        };
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
