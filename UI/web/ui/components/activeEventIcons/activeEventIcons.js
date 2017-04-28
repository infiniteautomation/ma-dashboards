/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

var activeEventIconsController = function activeEventIconsController(Events, eventsEventManager) {
    var $ctrl = this;
    
    Events.getActiveSummary().$promise.then(
        function(data) {
            // console.log('success', data);
            $ctrl.events = {totalCount: 0};
            
            $ctrl.renderCount = function(count) {
                if (count < 1000) {
                    return count;
                }
                else {
                    return '> 999';
                }
            };
            
            data.forEach(function(item, index, array) {
                $ctrl.events[item.level] = item;
                $ctrl.events.totalCount += item.unsilencedCount;
            });
            
            // console.log($ctrl.events.totalCount);
            
            eventsEventManager.subscribe(function(msg) {
                // console.log(msg);
                
                if (msg.status === 'OK') {
                    counter(msg.payload.event, msg.payload.type);
                }
                
            });
            
            var counter = function(payloadEvent, payloadType) {
                // console.log(payloadEvent, payloadType);
                
                if (payloadType === 'RAISED') {
                    $ctrl.events[payloadEvent.alarmLevel].unsilencedCount++;
                    $ctrl.events.totalCount++;
                }
                else if (payloadType === 'ACKNOWLEDGED') {
                    $ctrl.events[payloadEvent.alarmLevel].unsilencedCount--;
                    $ctrl.events.totalCount--;
                }
                
            };
            
        },
        function(data) {
            console.log('error', data);
        }
    );
};

activeEventIconsController.$inject = ['maEvents', 'maEventsEventManager'];

return {
    controller: activeEventIconsController,
    templateUrl: require.toUrl('./activeEventIcons.html')
};

}); // define