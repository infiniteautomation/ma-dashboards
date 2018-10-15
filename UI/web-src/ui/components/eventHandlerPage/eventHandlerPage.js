/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventHandlerPageTemplate from './eventHandlerPage.html';

const $inject = Object.freeze(['maEventHandler', '$state']);
class EventHandlerPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return $inject; }
    
    constructor(maEventHandler, $state) {
        this.maEventHandler = maEventHandler;
        this.$state = $state;
    }
    
    $onInit() {
        if (this.$state.params.xid) {
            this.maEventHandler.get(this.$state.params.xid).then(item => {
                this.eventHandler = item;
            }, error => {
                this.newEventHandler();
            });
        } else {
            this.newEventHandler();
        }
    }
    
    $onChanges(changes) {
    }
    
    newEventHandler() {
        this.eventHandler = new this.maEventHandler();
        this.eventHandlerChanged();
    }
    
    eventHandlerSaved() {
        if (this.eventHandler == null) {
            // user deleted the event handler
            this.eventHandler = new this.maEventHandler();
        }
        
        // always update the state params, xids can change
        this.eventHandlerChanged();
    }
    
    eventHandlerChanged() {
        this.$state.params.xid = this.eventHandler && this.eventHandler.getOriginalId() || null;
        this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
    }
}

export default {
    template: eventHandlerPageTemplate,
    controller: EventHandlerPageController,
    bindings: {
    },
    require: {
    }
};
