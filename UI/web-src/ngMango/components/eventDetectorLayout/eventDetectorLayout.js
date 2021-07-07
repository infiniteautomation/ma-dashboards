/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import eventDetectorLayoutTemplate from './eventDetectorLayout.html';
import './eventDetectorLayout.css';

class EventDetectorLayoutController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventDetector', '$attrs', '$mdMedia']; }
    
    constructor(EventDetector, $attrs, $mdMedia) {
        this.EventDetector = EventDetector;
        this.$mdMedia = $mdMedia;
        
        this.hasPointAttr = $attrs.hasOwnProperty('point');
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
    }
    
    render() {
        this.eventDetector = this.ngModelCtrl.$viewValue;
    }
    
    eventDetectorChanged() {
        this.ngModelCtrl.$setViewValue(this.eventDetector);
    }

    onQuery(items) {
        if (typeof this.onQueryCallback === 'function') {
            this.onQueryCallback({$items: items});
        }
    }
}

export default {
    template: eventDetectorLayoutTemplate,
    controller: EventDetectorLayoutController,
    bindings: {
        dataPoint: '<?point',
        onQueryCallback: '&?onQuery'
    },
    require: {
        ngModelCtrl: 'ngModel'
    }
};
