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
        if (this.startTime < 0)
            this.startTime = 0;
        if (this.startTime > millisecondsInDay)
            this.startTime = millisecondsInDay;
        if (this.duration < 0)
            this.duration = 0;
        if (this.endTime > millisecondsInDay)
            this.duration = millisecondsInDay - this.startTime;
        
        this.startLabel = moment.tz(this.startTime, 'UTC').format('LT');
        this.endLabel = moment.tz(this.endTime, 'UTC').format('LT');
        this.durationLabel = moment.duration(this.duration).humanize();
        this.style = {
            left: (this.startTime / millisecondsInDay * 100) + '%',
            width: (this.duration / millisecondsInDay * 100) + '%'
        };
    }
    
    setStartTime(startTime) {
        this.startTime = startTime;
        this.recalculate();
    }
    
    setDuration(duration) {
        this.duration = duration;
        this.recalculate();
    }
    
    setEndTime(endTime) {
        this.setDuration(endTime - this.startTime);
    }

    get endTime () {
        return this.startTime + this.duration;
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
        this.roundTo = 300000;
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
        
        // sort by start time
        this.activeSegments.sort((a, b) => {
            return a.startTime - b.startTime;
        });
        
        // remove any 0 duration segments, segment recalculate() handles segments with wrong start/end times
        this.activeSegments = this.activeSegments.filter((segment) => {
            return segment.duration > 0;
        });
        
        for (let i = 0; i < this.activeSegments.length; i++) {
            const segment = this.activeSegments[i];

            // merge overlapping segments
            for (let j = i + 1; j < this.activeSegments.length;) {
                const nextSegment = this.activeSegments[j];
                
                // next segment is distinct, break out
                if (nextSegment.startTime > segment.endTime)
                    break;
                
                // set the new duration if the overlapping segment extends the end time
                if (nextSegment.endTime > segment.endTime) {
                    segment.setEndTime(nextSegment.endTime);
                }
                
                // remove next segment
                this.activeSegments.splice(j, 1);
            }
        }

        // convert segments to active/inactive timestamps
        this.activeSegments.forEach((segment) => {
            timestamps.push(segment.startTime);

            // if it doesn't become inactive in this day we don't need to add a timestamp for it
            if (segment.endTime < millisecondsInDay) {
                timestamps.push(segment.endTime);
            }
        });
        
        this.ngModelCtrl.$setViewValue(timestamps);
    }
    
    createSegment(event) {
        // only interested in clicks on the bar itself
        if (event.target !== event.currentTarget) return;
        
        // not interested in right/middle click, ctrl-click, alt-click or shift-click
        if (event.which !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;

        // already creating a segment
        if (this.newSegment) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const startTime = this.calculateTime(event);
        this.newSegment = new ActiveSegment(startTime, 0);
        this.activeSegments.push(this.newSegment);
    }
    
    mouseMove(event) {
        if (this.newSegment) {
            const endTime = this.calculateTime(event);
            this.newSegment.setEndTime(endTime);
        }
    }
    
    mouseUp(event) {
        if (this.newSegment) {
            const endTime = this.calculateTime(event);
            this.newSegment.setEndTime(endTime);
            
            // only set the view value if new segment is valid
            if (this.newSegment.duration > 0) {
                this.setViewValue();
            } else {
                this.activeSegments.pop();
            }
            
            delete this.newSegment;
        }
    }
    
    calculateTime(event) {
        let target = event.target;
        let offset = event.offsetX;
        
        while (target !== event.currentTarget) {
            //target = target.parentNode;
            offset += target.offsetLeft;
            target = target.offsetParent;
        }
        
        const positionInDay = offset / event.currentTarget.clientWidth;
        return this.roundTime(positionInDay * millisecondsInDay);
    }
    
    roundTime(time) {
        return Math.round(time / this.roundTo) * this.roundTo;
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
        numTicks: '<?',
        roundTo: '<?'
    },
    designerInfo: {
        translation: 'ui.dox.dailySchedule',
        icon: 'sd_storage'
    }
};

}); // define
