/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

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
    
    eventHandlerChanged() {
        this.$state.params.xid = this.eventHandler.getOriginalId() || null;
        this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
    }
}

return {
    templateUrl: require.toUrl('./eventHandlerPage.html'),
    controller: EventHandlerPageController,
    bindings: {
    },
    require: {
    }
};

}); // define
