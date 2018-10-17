/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventHandlerEmailEditorTemplate from './eventHandlerEmailEditor.html';

class EventHandlerEmailEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }
    
    constructor() {
    }
    
    $onInit() {
    }
    
    $onChanges(changes) {
        if (changes.eventHandler) {
            this.customizeTemplate = this.eventHandler && !!this.eventHandler.customTemplate;
        }
    }
}

export default {
    template: eventHandlerEmailEditorTemplate,
    controller: EventHandlerEmailEditorController,
    bindings: {
        eventHandler: '<'
    }
};
