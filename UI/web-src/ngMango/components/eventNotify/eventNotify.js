/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
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
    static get $inject() { return ['maEvents', '$scope', '$mdToast', '$injector', 'maEvents', 'maUiServiceWorkerHelper']; }
    
    constructor(maEvents, $scope, $mdToast, $injector, Events, serviceWorkerHelper) {
        this.maEvents = maEvents;
        this.$scope = $scope;
        this.$mdToast = $mdToast;
        this.serviceWorkerHelper = serviceWorkerHelper;
        
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

        this.serviceWorkerHelper.showNotification(mangoEvent.alarmLevel, {
            badge: '/ui/img/icon192.png',
            body: mangoEvent.message,
            icon: '/images/flag_yellow.png',
            tag: `event_${mangoEvent.id}`,
            actions: [
                { action: 'view', title: 'View event', icon: '/images/item.png' },
                { action: 'acknowledge', title: 'Acknowledge', icon: '/images/tick.png' }
            ],
            data: {
                type: 'event',
                eventId: mangoEvent.id
            }
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