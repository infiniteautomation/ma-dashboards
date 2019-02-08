/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventHandlerSelectTemplate from './eventHandlerSelect.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventHandlerSelect
 * @restrict E
 * @description Displays a drop down select of event handlers
 */

class EventHandlerSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventHandler', '$scope']; }
    
    constructor(maEventHandler, $scope) {
        this.maEventHandler = maEventHandler;
        this.$scope = $scope;
        
        this.newValue = {};
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.doQuery();
        
        this.maEventHandler.subscribe((event, item, originalXid) => {
            if (!this.eventHandlers) return;

            const filterMatches = !this.event || item.hasEventType(this.event.typeId);
            const index = this.eventHandlers.findIndex(eventHandler => eventHandler.id === item.id);
            if (index >= 0) {
                if (!filterMatches || event.name === 'delete') {
                    this.eventHandlers.splice(index, 1);
                } else if (event.name === 'update' || event.name === 'create') {
                    Object.assign(this.eventHandlers[index], item);
                }
            } else if (filterMatches && (event.name === 'update' || event.name === 'create')) {
                this.eventHandlers.push(item);
            }
        }, this.$scope, ['create', 'update', 'delete']);
    }
    
    $onChanges(changes) {
        if (changes.event && !changes.event.isFirstChange()) {
            this.doQuery();
        }
    }
    
    doQuery() {
        const queryBuilder = this.maEventHandler.buildQuery();
        queryBuilder.limit(10000);
        return queryBuilder.query().then(eventHandlers => {
            if (this.event) {
                const eventTypeId = this.event.typeId;
                this.eventHandlers = eventHandlers.filter(eh => eh.hasEventType(eventTypeId));
            } else {
                this.eventHandlers = eventHandlers;
            }
            return this.eventHandlers;
        });
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }
    
    selectEventHandler() {
        if (this.selected === this.newValue) {
            this.selected = new this.maEventHandler();
            if (this.event) {
                this.selected.addEventType(this.event.getEventType());
            }
        }
        this.setViewValue();
    }
}

export default {
    template: eventHandlerSelectTemplate,
    controller: EventHandlerSelectController,
    transclude: {
        labelSlot: '?maLabel'
    },
    bindings: {
        event: '<?',
        showNewOption: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.eventHandlerSelect',
        icon: 'link'
    }
};
