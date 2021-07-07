/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventNotify
 *
 * @description Shows a notification at the bottom of the screen (a toast) when events are raised.
 *
 * @param {object} event-level Enables or disables the notification for each event level.
 *   Keys are the event level in capitals (e.g. URGENT, LIFE_SAFETY) or DEFAULT, values are true or false
 *
 * @usage
 * <ma-event-notify event-levels="{DEFAULT: false, CRITICAL: true}"></ma-event-notify>
 *
 **/

import eventNotifyTemplate from './eventNotify.html';

class EventNotifyController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEvents', '$scope', '$mdToast', '$injector', 'maEvents']; }
    
    constructor(maEvents, $scope, $mdToast, $injector, Events) {
        this.maEvents = maEvents;
        this.$scope = $scope;
        this.$mdToast = $mdToast;
        
        this.levelInfo = Events.levels.reduce((map, item) => (map[item.key] = item, map), {});
        
        if ($injector.has('$state')) {
            this.$state = $injector.get('$state');
        }
        
        this.eventLevels = {DEFAULT: false};
    }
    
    $onInit() {
        this.maEvents.notificationManager.subscribe((event, mangoEvent) => {
            this.eventRaised(mangoEvent);
        }, this.$scope, ['RAISED']);
    }

    eventRaised(mangoEvent) {
        const eventLevels = this.eventLevels || {};
        const notifyForLevel = eventLevels[mangoEvent.alarmLevel];
        const notify = notifyForLevel != null ? notifyForLevel : eventLevels.DEFAULT;

        if (notify) {
            this.showToast(mangoEvent);
        }
    }
    
    showToast(mangoEvent) {
        // scope is destroyed when toast is hidden
        const scope = this.$scope.$new();
        scope.mangoEvent = mangoEvent;
        
        this.maEvents.notificationManager.subscribe((event, updated) => {
            if (updated.id === mangoEvent.id) {
                scope.mangoEvent = updated;
                if (event.name === 'ACKNOWLEDGED') {
                    this.$mdToast.hide('acknowledgeEvent');
                }
            }
        }, scope, ['RETURN_TO_NORMAL', 'DEACTIVATED', 'ACKNOWLEDGED']);

        this.$mdToast.show({
            template: eventNotifyTemplate,
            position: 'bottom center',
            hideDelay: 0,
            scope
        });
    }
    
    showEvent(event, mangoEvent) {
        this.$mdToast.hide('showEvent');
        if (this.onShowEvent) {
            this.onShowEvent({$event: event, $mangoEvent: mangoEvent});
        } else if (this.$state) {
            this.$state.go('ui.events');
        }
    }
    
    acknowledgeEvent(event, mangoEvent) {
        if (!event.acknowledged) {
            mangoEvent.$acknowledge();
        }
    }
    
    hide(event, mangoEvent) {
        this.$mdToast.hide('hide');
    }
}

export default {
    controller: EventNotifyController,
    bindings: {
        eventLevels: '<?',
        onShowEvent: '&?'
    }
};