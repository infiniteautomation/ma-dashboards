/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import eventHandlerPageTemplate from './eventHandlerPage.html';

class EventHandlerPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventHandler', '$state', '$mdMedia', 'maEventTypeInfo']; }

    constructor(maEventHandler, $state, $mdMedia, EventTypeInfo) {
        this.maEventHandler = maEventHandler;
        this.$state = $state;
        this.$mdMedia = $mdMedia;
        this.EventTypeInfo = EventTypeInfo;
    }

    $onInit() {
        this.eventTypeFromParams();

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

    eventTypeFromParams() {
        const params = this.$state.params;
        if (params.eventType) {
            this.eventType = new this.EventTypeInfo.EventType({
                eventType: params.eventType,
                subType: params.subType || null,
                referenceId1: params.referenceId1 && Number.parseInt(params.referenceId1, 10) || 0,
                referenceId2: params.referenceId2 && Number.parseInt(params.referenceId2, 10) || 0
            });
        } else {
            this.eventType = null;
        }
    }

    eventTypeChanged() {
        const params = {
            eventType: null,
            subType: null,
            referenceId1: null,
            referenceId2: null
        };

        if (this.eventType) {
            params.eventType = this.eventType.eventType || null;
            params.subType = this.eventType.subType || null;
            params.subType = this.eventType.referenceId1 || null;
            params.subType = this.eventType.referenceId2 || null;
        }

        this.$state.go('.', params, {location: 'replace', notify: false});
    }

    newEventHandler() {
        this.eventHandler = this.maEventHandler.create('EMAIL');
        if (this.eventType) {
            this.eventHandler.addEventType(this.eventType);
        }
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
