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
    constructor(startTime, endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.recalculate();
    }
    
    recalculate() {
        if (this.startTime < 0)
            this.startTime = 0;
        if (this.startTime > millisecondsInDay)
            this.startTime = millisecondsInDay;
        if (this.endTime < 0)
            this.endTime = 0;
        if (this.endTime > millisecondsInDay)
            this.endTime = millisecondsInDay;
        if (this.endTime < this.startTime)
            this.endTime = this.startTime;

        this.startLabel = moment.tz(this.startTime, 'UTC').format('LT');
        this.endLabel = moment.tz(this.endTime, 'UTC').format('LT');
        this.durationLabel = moment.duration(this.duration).humanize();
        this.style = {
            left: (this.startTime / millisecondsInDay * 100) + '%',
            width: (this.duration / millisecondsInDay * 100) + '%'
        };
    }

    /**
     * Sets the start time, changes the duration
     */
    setStartTime(startTime) {
        this.startTime = startTime;
        this.recalculate();
    }

    /**
     * Sets the end time, changes the duration
     */
    setEndTime(endTime) {
        this.endTime = endTime;
        this.recalculate();
    }

    /**
     * Moves the segment so it begins at the specified start time, does not change the duration
     */
    moveToStartTime(startTime) {
        const duration = this.duration;
        this.startTime = startTime;
        this.setEndTime(startTime + duration);
    }

    get duration () {
        return this.endTime - this.startTime;
    }
}

const $inject = Object.freeze([]);
class DailyScheduleController {
    static get $inject() { return $inject; }
    
    constructor() {
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
            this.activeSegments.push(new ActiveSegment(activeTime, inactiveTime));
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

        // already creating/resizing/moving a segment
        if (this.editSegment) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        this.editAction = 'create';
        const startTime = this.calculateTime(event);
        this.editSegment = new ActiveSegment(startTime, startTime);
        this.activeSegments.push(this.editSegment);
        
        this.initialTime = startTime;
    }
    
    resizeSegment(event, segment, resizeLeft) {
        // not interested in right/middle click, ctrl-click, alt-click or shift-click
        if (event.which !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
        
        // already creating/resizing/moving a segment
        if (this.editSegment) return;
        
        event.preventDefault();
        event.stopImmediatePropagation();

        this.editAction = resizeLeft ? 'resizeLeft' : 'resizeRight';
        this.editSegment = segment;
    }
    
    moveSegment(event, segment) {
        // not interested in right/middle click, ctrl-click, alt-click or shift-click
        if (event.which !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
        
        // already creating/resizing/moving a segment
        if (this.editSegment) return;
        
        event.preventDefault();
        event.stopImmediatePropagation();

        this.editAction = 'move';
        this.editSegment = segment;
        
        this.initialOffset = event.offsetX;
    }
    
    mouseMove(event) {
        if (!this.editSegment) return;
        const timeAtCursor = this.calculateTime(event);
        
        if (this.editAction === 'create') {
            if (timeAtCursor < this.initialTime) {
                this.editSegment.setStartTime(timeAtCursor);
            } else {
                this.editSegment.setEndTime(timeAtCursor);
            }
        } else if (this.editAction === 'resizeRight') {
            this.editSegment.setEndTime(timeAtCursor);
        } else if (this.editAction === 'resizeLeft') {
            this.editSegment.setStartTime(timeAtCursor);
        } else if (this.editAction === 'move') {
            if (timeAtCursor < 0) {
                this.editSegment.moveToStartTime(0);
            } else if (timeAtCursor + this.editSegment.duration > millisecondsInDay) {
                this.editSegment.moveToStartTime(millisecondsInDay - this.editSegment.duration);
            } else {
                this.editSegment.moveToStartTime(timeAtCursor);
            }
        }
    }
    
    mouseUp(event) {
        if (!this.editSegment) return;
        const timeAtCursor = this.calculateTime(event);
        
        if (this.editAction === 'create') {
            if (timeAtCursor < this.initialTime) {
                this.editSegment.setStartTime(timeAtCursor);
            } else {
                this.editSegment.setEndTime(timeAtCursor);
            }
            
            // only set the view value if new segment is valid
            if (this.editSegment.duration > 0) {
                this.setViewValue();
            } else {
                this.activeSegments.pop();
            }
        } else if (this.editAction === 'resizeRight') {
            this.editSegment.setEndTime(timeAtCursor);
            this.setViewValue();
        } else if (this.editAction === 'resizeLeft') {
            this.editSegment.setStartTime(timeAtCursor);
            this.setViewValue();
        } else if (this.editAction === 'move') {
            if (timeAtCursor < 0) {
                this.editSegment.moveToStartTime(0);
            } else if (timeAtCursor + this.editSegment.duration > millisecondsInDay) {
                this.editSegment.moveToStartTime(millisecondsInDay - this.editSegment.duration);
            } else {
                this.editSegment.moveToStartTime(timeAtCursor);
            }
            this.setViewValue();
        }
        
        delete this.editSegment;
        delete this.initialOffset;
        delete this.initialTime;
    }
    
    calculateTime(event) {
        let target = event.target;
        let offset = event.offsetX;
        
        while (target !== event.currentTarget) {
            offset += target.offsetLeft;
            target = target.offsetParent;
        }
        
        // used for move operations
        if (this.initialOffset != null) {
            offset -= this.initialOffset;
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
        numTicks: '<?',
        roundTo: '<?'
    },
    transclude: {
        labelSlot: '?span'
    },
    designerInfo: {
        translation: 'ui.dox.dailySchedule',
        icon: 'sd_storage'
    }
};

}); // define
