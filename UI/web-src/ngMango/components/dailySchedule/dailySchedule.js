/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import moment from 'moment-timezone';
import dailyScheduleTemplate from './dailySchedule.html';
import './dailySchedule.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDailySchedule
 * @restrict E
 * @description Displays and allows editing of a daily schedule object
 */

const millisecondsInDay = 24 * 3600 * 1000;
const timeFormats = ['HH:mm:ss.SSS', 'HH:mm:ss', 'HH:mm'];

const parseTime = function parseTime(input) {
    if (typeof input !== 'string') return input;
    return moment.utc('1970-01-01 ' + input, 'YYYY-MM-DD ' + timeFormats[0]).valueOf();
};

const formatTime = function formatTime(input) {
    if (typeof input !== 'number') return input;
    const m = moment.utc(input);

    if (m.milliseconds() === 0) {
        if (m.seconds() === 0) {
            return m.format(timeFormats[2]);
        }
        return m.format(timeFormats[1]);
    }
    return m.format(timeFormats[0]);
};

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
        
        const duration = moment.duration(this.duration);
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        
        this.durationLabel = '';
        
        if (hours) {
            this.durationLabel += moment.localeData().relativeTime(hours, false, 'hh', false);
        }
        if (minutes || (hours && seconds)) {
            if (this.durationLabel) this.durationLabel += '\n';
            this.durationLabel += moment.localeData().relativeTime(minutes, false, 'mm', false);
        }
        if (seconds) {
            if (this.durationLabel) this.durationLabel += '\n';
            this.durationLabel += moment.localeData().relativeTime(seconds, false, 'ss', false);
        }
        
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

const $inject = Object.freeze(['$element']);
class DailyScheduleController {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($element) {
        this.barElement = $element[0].querySelector('.ma-daily-schedule-bar');
        
        this.tickSegments = 8;
        this.guideSegments = 24;
        this.roundTo = 300000;
        this.createTicks();
        this.createGuides();
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
        if (changes.tickSegments && this.tickSegments != null) {
            this.createTicks();
        }
        if (changes.guideSegments && this.guideSegments != null) {
            this.createGuides();
        }
    }
    
    render() {
        this.activeSegments = [];
        var timestamps = (this.ngModelCtrl.$viewValue || []).map(parseTime);
        
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
        
        this.ngModelCtrl.$setViewValue(timestamps.map(formatTime));
    }
    
    createSegment(event) {
        // only interested in clicks on the bar itself
        if (event.target !== event.currentTarget) return;
        
        if (!this.checkStartNewAction(event)) return;

        const startTime = this.initialCursorPosition.roundedTime;

        this.editAction = 'create';
        this.editSegment = new ActiveSegment(startTime, startTime);
        this.activeSegments.push(this.editSegment);
    }
    
    resizeSegment(event, segment, resizeLeft) {
        if (!this.checkStartNewAction(event)) return;

        this.editAction = resizeLeft ? 'resize-left' : 'resize-right';
        this.editSegment = segment;
    }
    
    moveSegment(event, segment) {
        if (!this.checkStartNewAction(event)) return;

        this.editAction = 'move';
        this.editSegment = segment;
    }
    
    /**
     * Check if we should continue with a new action
     */
    checkStartNewAction(event) {
        // not interested in right/middle click, ctrl-click, alt-click or shift-click
        if (event.type === 'mousedown' && event.which !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
            return;
        
        // already creating/resizing/moving a segment
        if (this.editSegment)
            return;
        
        event.preventDefault();
        event.stopImmediatePropagation();
        
        this.touchId = event.type === 'touchstart' && event.touches[0].identifier;
        this.initialCursorPosition = this.cursorPosition(event);
        
        return true;
    }
    
    mouseMove(event) {
        if (!this.editSegment) return;
        
        const cursorPosition = this.cursorPosition(event);
        const timeAtCursor = cursorPosition.roundedTime;
        
        if (this.editAction === 'create') {
            const initialTime = this.initialCursorPosition.roundedTime;
            
            if (timeAtCursor < initialTime) {
                this.editSegment.setStartTime(timeAtCursor);
                this.editSegment.setEndTime(initialTime);
            } else {
                this.editSegment.setStartTime(initialTime);
                this.editSegment.setEndTime(timeAtCursor);
            }
        } else if (this.editAction === 'resize-right') {
            this.editSegment.setEndTime(timeAtCursor);
        } else if (this.editAction === 'resize-left') {
            if (timeAtCursor > this.editSegment.endTime) {
                this.editSegment.setStartTime(this.editSegment.endTime);
            } else {
                this.editSegment.setStartTime(timeAtCursor);
            }
        } else if (this.editAction === 'move') {
            // use the adjusted cursor time, we don't want to move the segment to where the cursor is as
            // we may have clicked in the middle of the segment
            const adjustedTime = cursorPosition.adjustedTime;
            
            if (adjustedTime < 0) {
                this.editSegment.moveToStartTime(0);
            } else if (adjustedTime + this.editSegment.duration > millisecondsInDay) {
                this.editSegment.moveToStartTime(millisecondsInDay - this.editSegment.duration);
            } else {
                this.editSegment.moveToStartTime(adjustedTime);
            }
        }
    }
    
    mouseUp(event) {
        if (!this.editSegment) return;
        
        // use the mouse move handler to update the start/end times
        this.mouseMove(event);

        // only set the view value if new segment is valid
        if (this.editAction === 'create' && this.editSegment.duration <= 0) {
            this.activeSegments.pop();
        } else {
            this.setViewValue();
        }
        
        // clear our state
        delete this.editSegment;
        delete this.initialCursorPosition;
        delete this.touchId;
        delete this.editAction;
    }

    getPageX(event) {
        if (event.type.indexOf('touch') === 0) {
            // touch events
            return Array.prototype.filter.call(event.changedTouches, (touch) => {
                return touch.identifier === this.touchId;
            })[0].pageX;
        } else {
            // mouse events
            return event.pageX;
        }
    }
    
    cursorPosition(event) {
        const pageX = this.getPageX(event);
        const rect = this.barElement.getBoundingClientRect();
        const offsetX = pageX - rect.left;
        const position = offsetX / this.barElement.clientWidth;
        const time = position * millisecondsInDay;
        const roundedTime = this.roundTime(time);
        const targetOffsetX = pageX - event.currentTarget.getBoundingClientRect().left;
        
        const result = {
            pageX,
            offsetX,
            targetOffsetX,
            position,
            time,
            roundedTime
        };
        
        // calculate an adjusted time for use when moving a segment
        if (this.initialCursorPosition) {
            const adjustedOffset = offsetX - this.initialCursorPosition.targetOffsetX;
            result.adjustedTime = this.roundTime(adjustedOffset / this.barElement.clientWidth * millisecondsInDay);
        }
        
        return result;
    }

    roundTime(time) {
        if (!this.roundTo) return time;
        return Math.round(time / this.roundTo) * this.roundTo;
    }
    
    createTicks() {
        this.ticks = [];
        if (this.tickSegments < 1) return;

        const increment = millisecondsInDay / this.tickSegments;
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
        if (this.guideSegments < 1) return;
        
        const increment = millisecondsInDay / this.guideSegments;
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

export default {
    template: dailyScheduleTemplate,
    controller: DailyScheduleController,
    require: {
        ngModelCtrl: 'ngModel'
    },
    bindings: {
        tickSegments: '<?',
        guideSegments: '<?',
        roundTo: '<?'
    },
    transclude: {
        labelSlot: '?span'
    },
    designerInfo: {
        translation: 'ui.components.maDailySchedule',
        icon: 'sd_storage'
    }
};
