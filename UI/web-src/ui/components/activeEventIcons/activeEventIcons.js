/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

import activeEventIconsTemplate from './activeEventIcons.html';

ActiveEventIconsController.$inject = ['maEvents', '$scope'];
function ActiveEventIconsController(Events, $scope) {
    this.events = {totalCount: 0};
    
    Events.getActiveSummary().$promise.then((data) => {
        data.forEach((item, index, array) => {
            this.events[item.level] = item;
            this.events.totalCount += item.unsilencedCount;
        });

        Events.notificationManager.subscribe((event, mangoEvent) => {
            this.counter(mangoEvent, event.name);
        }, $scope, ['RAISED', 'ACKNOWLEDGED']);

    }, (error) => {
        console.log('error', error);
    });
}

ActiveEventIconsController.prototype.renderCount = function renderCount(count) {
    return count < 1000 ? count : '> 999';
};

ActiveEventIconsController.prototype.counter = function counter(payloadEvent, payloadType) {
    if (payloadType === 'RAISED') {
        this.events[payloadEvent.alarmLevel].unsilencedCount++;
        this.events.totalCount++;
    } else if (payloadType === 'ACKNOWLEDGED') {
        this.events[payloadEvent.alarmLevel].unsilencedCount--;
        this.events.totalCount--;
    }
};

export default {
    controller: ActiveEventIconsController,
    template: activeEventIconsTemplate
};


