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
    static get $inject() { return ['maEventType', 'maEvents', '$filter']; }
    
    constructor(maEventType, maEvents, $filter) {
        this.maEventType = maEventType;
        this.$filter = $filter;
        
        this.alarmLevels = maEvents.levels.reduce((map, level) => (map[level.key] = level, map), {});
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();

        this.loadingCategories = this.maEventType.typeNames().then(categories => {
            this.categories = this.$filter('orderBy')(categories, 'description');
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
            const id = this.maEventType.uniqueId(eventType);
            this.selected.set(id, eventType);
            const category = this.categoriesMap[eventType.eventType];
            if (category) {
                category.selected.set(id, eventType);
            }
        });
    }

    expandCategory(category) {
        const wasExpanded = category.expanded;
        this.categories.forEach(etn => etn.expanded = false);
        if (!wasExpanded) {
            category.expanded = true;
        }
        
        if (category.expanded) {
            this.loadCategory(category);
        } else {
            delete category.types;
        }
    }
    
    loadCategory(category) {
        category.loading = this.maEventType.list(category.typeName).then(eventTypes => {
            category.types = eventTypes;
        }).finally(() => delete category.loading);
    }
    
    selectedGetterSetter(category, eventType) {
        return value => {
            const id = this.maEventType.uniqueId(eventType);
            
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
