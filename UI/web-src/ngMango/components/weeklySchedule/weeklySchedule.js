/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import moment from 'moment-timezone';
import weeklyScheduleTemplate from './weeklySchedule.html';
import './weeklySchedule.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maWeeklySchedule
 * @restrict E
 * @description Displays and allows editing of a weekly schedule object
 */

const emptySchedule = Object.freeze(Array(7).fill());

const $inject = Object.freeze([]);
class WeeklyScheduleController {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor() {
        this.firstDayOfWeek = moment.localeData().firstDayOfWeek();
        this.weekDays = moment.weekdaysShort();
        
        this.roundTo = 300000;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
    }
    
    render() {
        this.weeklySchedule = (this.ngModelCtrl.$viewValue || emptySchedule).map((value, i) => {
            return {
                dayOfWeek: i,
                localeDayOfWeek: (i - this.firstDayOfWeek + 7) % 7,
                dailySchedule: value || [],
                weekend: i === 0 || i === 6
            };
        });
    }
    
    setViewValue() {
        const newViewValue = this.weeklySchedule.map((value) => value.dailySchedule);
        this.ngModelCtrl.$setViewValue(newViewValue);
    }
    
    dailyScheduleChanged(changedDay) {
        let updateWeekends = false;
        let updateWeekdays = false;
        
        if (this.lockAll) {
            updateWeekends = true;
            updateWeekdays = true;
        } else if (this.lockWeekends && changedDay.weekend) {
            updateWeekends = true;
        } else if (this.lockWeekdays && !changedDay.weekend) {
            updateWeekdays = true;
        }
        
        if (updateWeekends || updateWeekdays) {
            this.weeklySchedule.forEach((item) => {
                if (item !== changedDay && (item.weekend && updateWeekends || !item.weekend && updateWeekdays)) {
                    item.dailySchedule = [...changedDay.dailySchedule];
                }
            });
        }

        this.setViewValue();
    }
}

export default {
    template: weeklyScheduleTemplate,
    controller: WeeklyScheduleController,
    require: {
        ngModelCtrl: 'ngModel'
    },
    bindings: {
        lockAll: '<?',
        lockWeekends: '<?',
        lockWeekdays: '<?',
        roundTo: '<?',
        tickSegments: '<?',
        guideSegments: '<?'
    },
    designerInfo: {
        translation: 'ui.components.maWeeklySchedule',
        icon: 'sd_storage'
    }
};
