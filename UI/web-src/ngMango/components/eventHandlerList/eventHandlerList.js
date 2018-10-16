/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventHandlerListTemplate from './eventHandlerList.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventHandlerList
 * @restrict E
 * @description Displays a list of eventHandlers and allows enabling/disabling them
 */

const $inject = Object.freeze(['maEventHandler', '$scope']);
class EventHandlerListController {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor(maEventHandler, $scope) {
        this.maEventHandler = maEventHandler;
        this.$scope = $scope;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.maEventHandler.list().then((eventHandlers) => {
            this.eventHandlers = eventHandlers;
        });
        
        this.maEventHandler.subscribe((event, item, originalXid) => {
            if (!this.eventHandlers) return;

            const index = this.eventHandlers.findIndex(eventHandler => eventHandler.id === item.id);
            if (index >= 0) {
                if (event.name === 'update' || event.name === 'create' || event.name === 'rtDataSaved') {
                    this.eventHandlers[index] = item;
                } else if (event.name === 'delete') {
                    this.eventHandlers.splice(index, 1);
                }
            } else if (event.name === 'update' || event.name === 'create' || event.name === 'rtDataSaved') {
                this.eventHandlers.push(item);
            }

        }, this.$scope, ['create', 'update', 'delete', 'rtDataSaved']);
    }
    
    $onChanges(changes) {
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }
    
    selectEventHandler(eventHandler) {
        if (this.selected === eventHandler) {
            // create a shallow copy if this eventHandler is already selected
            // causes the model to update
            this.selected = Object.assign(Object.create(this.maEventHandler.prototype), eventHandler);
        } else {
            this.selected = eventHandler;
        }
        
        this.setViewValue();
    }
    
    newEventHandler(event) {
        this.selected = new this.maEventHandler();
        this.setViewValue();
    }
}

export default {
    template: eventHandlerListTemplate,
    controller: EventHandlerListController,
    bindings: {},
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'eventHandler.components.eventHandlerList',
        icon: 'date_range'
    }
};

 // define
