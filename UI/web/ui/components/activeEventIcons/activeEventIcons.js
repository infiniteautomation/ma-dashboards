/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

ActiveEventIconsController.$inject = ['maEvents', '$scope'];
function ActiveEventIconsController(Events, $scope) {
    this.events = {totalCount: 0};
    
    Events.getActiveSummary().$promise.then((data) => {
        data.forEach((item, index, array) => {
            this.events[item.level] = item;
            this.events.totalCount += item.unsilencedCount;
        });

        Events.notificationManager.subscribe((event, message) => {
            this.counter(message.event, message.type);
        }, $scope, ['webSocketMessage']);

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

return {
    controller: ActiveEventIconsController,
    templateUrl: require.toUrl('./activeEventIcons.html')
};

}); // define
