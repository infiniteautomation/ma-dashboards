/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import eventHandlerCheckListTemplate from './eventHandlerCheckList.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventHandlerCheckList
 * @restrict E
 * @description Displays a list of event handlers
 */

class EventHandlerCheckListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventHandler', '$scope']; }
    
    constructor(maEventHandler, $scope) {
        this.maEventHandler = maEventHandler;
        this.$scope = $scope;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.doQuery();
        
        this.maEventHandler.subscribe({
            scope: this.$scope,
            handler: (event, item, attributes) => {
                attributes.updateArray(this.eventHandlers);
            }
        });
        
        this.selected = new Map();
    }

    $onChanges(changes) {
    }
    
    doQuery() {
        const queryBuilder = this.maEventHandler.buildQuery(); // TODO this is a unbounded query
        this.queryPromise = queryBuilder.query().then(eventHandlers => {
            return (this.eventHandlers = eventHandlers);
        }).finally(() => {
            delete this.queryPromise;
        });
        return this.queryPromise;
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(Array.from(this.selected.values()));
    }
    
    render() {
        this.selected.clear();
        const selected = this.ngModelCtrl.$viewValue;
        if (Array.isArray(selected)) {
            selected.forEach(eh => this.selected.set(eh.xid, eh));
        }
    }

    selectedGetterSetter(eventHandler) {
        return value => {
            const xid = eventHandler.xid;
            
            if (value === undefined) {
                return this.selected.has(xid);
            }
            
            if (value) {
                this.selected.set(xid, eventHandler);
            } else {
                this.selected.delete(xid);
            }
            
            this.setViewValue();
        };
    }
}

export default {
    template: eventHandlerCheckListTemplate,
    controller: EventHandlerCheckListController,
    bindings: {
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.eventHandlerCheckList',
        icon: 'assignment_turned_in'
    }
};
