/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import activeEventIconsTemplate from './activeEventIcons.html';

class ActiveEventIconsController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEvents', '$scope', '$timeout']; }

    constructor(maEvents, $scope, $timeout) {
        this.maEvents = maEvents;
        
        this.refreshCount().then(() => {
            maEvents.notificationManager.subscribe((event, mangoEvent) => {
                this.counter(mangoEvent, event.name);
            }, $scope, ['RAISED', 'ACKNOWLEDGED']);
            
            // ensure the count is up to date if we are auto-logged back in after a restart
            // probably should implement a way to get this from the websocket when it connects
            $scope.$maSubscribe('maWatchdog/LOGGED_IN', (event, current) => {
                $timeout(() => {
                    this.refreshCount();
                }, 5000);
            });
        });
    }
    
    refreshCount() {
        return this.maEvents.getUnacknowledgedSummary().$promise.then((data) => {
            this.events = {totalCount: 0};
            
            data.forEach((item, index, array) => {
                this.events[item.level] = item;
                this.events.totalCount += item.count;
            });
            
            return this.events;
        });
    }
    
    renderCount(count) {
        return count < 1000 ? count : '> 999';
    }
    
    counter(payloadEvent, payloadType) {
        if (payloadType === 'RAISED') {
            // temporary fix/work-around for audit events / DO_NOT_LOG events coming through websocket
            if (payloadEvent.id < 0) {
                return;
            }

            this.events[payloadEvent.alarmLevel].count++;
            this.events.totalCount++;
        } else if (payloadType === 'ACKNOWLEDGED') {
            this.events[payloadEvent.alarmLevel].count--;
            this.events.totalCount--;
        }
    }
}

export default {
    controller: ActiveEventIconsController,
    template: activeEventIconsTemplate
};
