/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventTypeListTemplate from './eventTypeList.html';
import './eventTypeList.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventTypeList
 * @restrict E
 * @description Displays a list of event types
 */

class EventTypeListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventType', 'maEvents']; }
    
    constructor(maEventType, maEvents) {
        this.maEventType = maEventType;
        
        this.alarmLevels = maEvents.levels.reduce((map, level) => (map[level.key] = level, map), {});
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();

        this.eventTypesMap = {};
        
        this.loading = this.maEventType.typeNames().then(categories => {
            this.categories = categories;
            this.categoriesMap = categories.reduce((map, et) => {
                et.types = [];
                map[et.typeName] = et;
                return map;
            }, {});
        }).then(() => {
            return this.maEventType.list();
        }).then((eventTypes) => {
            eventTypes.forEach(eventType => {
                const name = eventType.type.eventType;
                const category = this.categoriesMap[name];
                if (category) {
                    category.types.push(eventType);
                }
                this.eventTypesMap[eventType.uniqueId] = eventType.type;
            });

            delete this.loading;
            this.render();
        }, () => delete this.loading);
    }
    
    $onChanges(changes) {
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(Array.from(this.selected));
    }
    
    render() {
        if (this.loading) {
            return;
        }
        
        this.selected = new Set();
        this.categories.forEach(c => c.selected = new Set());

        const view = this.ngModelCtrl.$viewValue;
        if (!Array.isArray(view)) return;
        
        view.map(type => this.eventTypesMap[this.maEventType.uniqueId(type)])
        .filter(et => !!et).forEach(eventType => {
            this.selected.add(eventType);
            const category = this.categoriesMap[eventType.eventType];
            if (category) {
                category.selected.add(eventType);
            }
        });
    }

    expandSection(category) {
        const wasExpanded = category.expanded;
        this.categories.forEach(etn => etn.expanded = false);
        if (!wasExpanded) {
            category.expanded = true;
        }
    }
    
    selectedGetterSetter(category, eventType) {
        return value => {
            if (value === undefined) {
                return category.selected.has(eventType);
            }
            
            if (value) {
                this.selected.add(eventType);
                category.selected.add(eventType);
            } else {
                this.selected.delete(eventType);
                category.selected.delete(eventType);
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
