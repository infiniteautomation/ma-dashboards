/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
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
    static get $inject() { return ['maEventType']; }
    
    constructor(maEventType) {
        this.maEventType = maEventType;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.maEventType.list().then((eventTypes) => {
            this.eventTypes = eventTypes;
        });
    }
    
    $onChanges(changes) {
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }
    
    selectEventType(eventType) {
        if (this.selected === eventType) {
            // create a shallow copy if this eventType is already selected
            // causes the model to update
            this.selected = Object.assign({}, eventType);
        } else {
            this.selected = eventType;
        }
        
        this.setViewValue();
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
