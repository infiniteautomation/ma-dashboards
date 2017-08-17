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
        this.startLabel = moment.tz(this.startTime, 'UTC').format('LTS');
        this.endLabel = moment.tz(this.startTime + this.duration, 'UTC').format('LTS');
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
        this.weekDays = moment.weekdays();
        this.showLabel = true;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
    }
    
    render() {
        this.activeSegments = [];
        var timestamps = this.ngModelCtrl.$viewValue || [];
        
        for (let i = 0; i < timestamps.length; i++) {
            const nextIndex = i + 1;
            const activeTime = timestamps[i];
            let inactiveTime = millisecondsInDay;
            if (nextIndex < timestamps.length) {
                inactiveTime = timestamps[nextIndex];
                i++;
            }
            this.activeSegments.push(new ActiveSegment(activeTime, inactiveTime - activeTime));
        }
    }
    
    setViewValue() {
        const timestamps = [];
        
        this.activeSegments.forEach((segment) => {
            timestamps.push(segment.startTime);
            
            const inactiveTime = segment.startTime + segment.duration;
            if (inactiveTime < millisecondsInDay) {
                timestamps.push(inactiveTime);
            }
        });
        
        this.ngModelCtrl.$setViewValue(timestamps);
    }
    
    createActive(event) {
        const target = event.currentTarget;
        const x = event.offsetX;
        
        event.preventDefault();
        event.stopImmediatePropagation();

        // only interested in clicks on the bar itself
        if (event.target !== event.currentTarget) return;
        
        // click on border etc
        if (x < 0) return;

        const positionInDay = x / target.clientWidth;
        const startTime = Math.floor(positionInDay * millisecondsInDay);
        const duration = 120 * 60 * 1000;
        
        this.activeSegments.push(new ActiveSegment(startTime, duration));

        this.setViewValue();
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
        showLabel: '<?'
    },
    designerInfo: {
        translation: 'ui.dox.dailySchedule',
        icon: 'sd_storage'
    }
};

}); // define
