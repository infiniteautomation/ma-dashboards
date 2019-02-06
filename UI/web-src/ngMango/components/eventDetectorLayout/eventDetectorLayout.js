/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
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
    }
    
    $onChanges(changes) {
    }
    
    newEventDetector() {
        this.eventDetector = new this.EventDetector();
        if (this.hasPointAttr) {
            this.eventDetector.dataPoint = this.dataPoint;
        }
    }
    
    onQuery(items) {
        if (items.length) {
            this.eventDetector = items[0];
        } else {
            this.newEventDetector();
        }
        
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
    }
};
