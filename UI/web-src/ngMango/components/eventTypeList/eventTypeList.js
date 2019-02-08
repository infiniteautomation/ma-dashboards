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
    static get $inject() { return ['maEventTypeInfo', 'maEvents', '$filter', 'maPoint']; }
    
    constructor(EventTypeInfo, maEvents, $filter, Point) {
        this.EventTypeInfo = EventTypeInfo;
        this.orderBy = $filter('orderBy');
        this.Point = Point;
        
        this.alarmLevels = maEvents.levels.reduce((map, level) => (map[level.key] = level, map), {});
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();

        this.loadingCategories = this.EventTypeInfo.typeNames().then(categories => {
            this.categories = this.orderBy(categories, 'description');
            this.categoriesMap = categories.reduce((map, c) => (map[c.typeName] = c, map), {});
            delete this.loadingCategories;
            this.render();
        }).finally(() => {
            delete this.loadingCategories;
        });
    }
    
    $onChanges(changes) {
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(Array.from(this.selected.values()));
    }
    
    render() {
        if (this.loadingCategories) {
            return;
        }
        
        this.selected = new Map();
        this.categories.forEach(c => c.selected = new Map());

        const selectedTypes = this.ngModelCtrl.$viewValue;
        if (!Array.isArray(selectedTypes)) return;
        
        selectedTypes.forEach(eventType => {
            const id = eventType.typeId;
            this.selected.set(id, eventType);
            const category = this.categoriesMap[eventType.eventType];
            if (category) {
                category.selected.set(id, eventType);
            }
        });
    }

    expandCategory(category) {
        const wasExpanded = category.expanded;
        
        this.categories.forEach(category => {
            category.expanded = false;
            delete category.types;
            delete category.groups;
        });
        
        if (!wasExpanded) {
            category.expanded = true;
        }
        
        if (category.expanded) {
            this.loadCategory(category);
        } else {
            delete category.types;
            delete category.groups;
        }
    }
    
    loadCategory(category) {
        category.loading = this.EventTypeInfo.list(category.typeName).then(eventTypes => {
            category.types = this.orderBy(eventTypes, category.orderBy);

            if (typeof category.groupBy === 'function') {
                category.groups = category.group(category.types);
                //category.groups.forEach(g => {
                //    g.expanded = g.types.some(t => category.selected.has(t.typeId));
                //});
                delete category.types;
            }
            
        }).finally(() => delete category.loading);
    }
    
    selectedGetterSetter(category, eventType) {
        return value => {
            const id = eventType.typeId;
            
            if (value === undefined) {
                return category.selected.has(id);
            }
            
            if (value) {
                this.selected.set(id, eventType);
                category.selected.set(id, eventType);
            } else {
                this.selected.delete(id);
                category.selected.delete(id);
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
