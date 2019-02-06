/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventDetectorPageTemplate from './eventDetectorPage.html';

const $inject = Object.freeze(['maEventDetector', '$state', '$mdMedia']);
class EventDetectorPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return $inject; }
    
    constructor(EventDetector, $state, $mdMedia) {
        this.EventDetector = EventDetector;
        this.$state = $state;
        this.$mdMedia = $mdMedia;
    }
    
    $onInit() {
        if (this.$state.params.xid) {
            this.EventDetector.get(this.$state.params.xid).then(item => {
                this.eventDetector = item;
            }, error => {
                this.newEventDetector();
            });
        } else {
            this.newEventDetector();
        }
    }
    
    $onChanges(changes) {
    }
    
    newEventDetector() {
        this.eventDetector = new this.EventDetector();
        this.eventDetectorChanged();
    }
    
    eventDetectorSaved() {
        if (this.eventDetector == null) {
            // user deleted the event handler
            this.eventDetector = new this.EventDetector();
        }
        
        // always update the state params, xids can change
        this.eventDetectorChanged();
    }
    
    eventDetectorChanged() {
        this.$state.params.xid = this.eventDetector && this.eventDetector.getOriginalId() || null;
        this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
    }
}

export default {
    template: eventDetectorPageTemplate,
    controller: EventDetectorPageController,
    bindings: {
    },
    require: {
    }
};
