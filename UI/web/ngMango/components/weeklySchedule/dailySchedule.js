/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'moment-timezone'], function(angular, require, moment) {
'use strict';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDailySchedule
 * @restrict E
 * @description Displays and allows editing of a daily schedule object
 */

const millisecondsInDay = 24 * 3600 * 1000;

class ActiveSegment {
    constructor(startTime, duration) {
        this.startTime = startTime;
        this.duration = duration;
        this.recalculate();
    }
    
    recalculate() {
        this.startLabel = moment.tz(this.startTime, 'UTC').format('LT');
        this.endLabel = moment.tz(this.startTime + this.duration, 'UTC').format('LT');
        this.durationLabel = moment.duration(this.duration).humanize();
        this.style = {
            left: (this.startTime / millisecondsInDay * 100) + '%',
            width: (this.duration / millisecondsInDay * 100) + '%'
        };
    }
}

const $inject = Object.freeze([]);
class DailyScheduleController {
    static get $inject() { return $inject; }
    
    constructor() {
        this.weekDays = moment.weekdaysShort();
        this.showLabel = true;
        this.numTicks = 9;
        this.numGuides = 25;
        this.createTicks();
        this.createGuides();
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
        if (changes.numTicks && this.numTicks != null) {
            this.createTicks();
        }
        if (changes.numGuides && this.numGuides != null) {
            this.createGuides();
        }
    }
    
    render() {
        this.activeSegments = [];
        var timestamps = this.ngModelCtrl.$viewValue || [];
        
        // convert active/inactive timestamps to segments
        for (let i = 0; i < timestamps.length; i++) {
            const nextIndex = i + 1;
            const activeTime = timestamps[i];
            // if there is no next timestamp the inactive time is the end of the day
            let inactiveTime = millisecondsInDay;
            if (nextIndex < timestamps.length) {
                inactiveTime = timestamps[nextIndex];
                // skip the next timestamp, its an end time not a start time
                i++;
            }
            this.activeSegments.push(new ActiveSegment(activeTime, inactiveTime - activeTime));
        }
    }
    
    setViewValue() {
        const timestamps = [];
        
        // convert segments to active/inactive timestamps
        this.activeSegments.forEach((segment) => {
            timestamps.push(segment.startTime);
            
            const inactiveTime = segment.startTime + segment.duration;
            // if it doesn't become inactive in this day we don't need to add a timestamp for it
            if (inactiveTime < millisecondsInDay) {
                timestamps.push(inactiveTime);
            }
        });
        
        this.ngModelCtrl.$setViewValue(timestamps);
    }
    
    createActive(event) {
        // only interested in clicks on the bar itself
        if (event.target !== event.currentTarget) return;
        
        // not interested in right/middle click, ctrl-click, alt-click or shift-click
        if (event.which !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;

        // not interested in click on border
        if (event.offsetX < 0 || event.offsetX > event.currentTarget.clientWidth) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const positionInDay = event.offsetX / event.currentTarget.clientWidth;
        const startTime = Math.floor(positionInDay * millisecondsInDay);
        const duration = 120 * 60 * 1000;
        
        this.activeSegments.push(new ActiveSegment(startTime, duration));

        this.setViewValue();
    }
    
    createTicks() {
        this.ticks = [];
        if (this.numTicks < 1) return;
        
        const increment = millisecondsInDay / (this.numTicks - 1);
        for (let time = 0; time <= millisecondsInDay; time += increment) {
            this.ticks.push({
                label: moment.tz(time, 'UTC').format('LT'),
                value: time,
                style: {
                    left: (time / millisecondsInDay * 100) + '%'
                }
            });
        }
    }
    
    createGuides() {
        this.guides = [];
        if (this.numGuides < 1) return;
        
        const increment = millisecondsInDay / (this.numGuides - 1);
        for (let time = 0; time <= millisecondsInDay; time += increment) {
            this.guides.push({
                value: time,
                style: {
                    left: (time / millisecondsInDay * 100) + '%'
                }
            });
        }
    }
}



return {
    templateUrl: require.toUrl('./dailySchedule.html'),
    controller: DailyScheduleController,
    require: {
        ngModelCtrl: 'ngModel'
    },
    bindings: {
        dayOfWeek: '<',
        showLabel: '<?',
        numTicks: '<?'
    },
    designerInfo: {
        translation: 'ui.dox.dailySchedule',
        icon: 'sd_storage'
    }
};

}); // define
