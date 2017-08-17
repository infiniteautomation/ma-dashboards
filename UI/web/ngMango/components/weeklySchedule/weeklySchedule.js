/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'moment-timezone'], function(angular, require, moment) {
'use strict';

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
    
    constructor() {
        this.firstDayOfWeek = moment.localeData().firstDayOfWeek();
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
                dailySchedule: value || []
            };
        });

        for (let i = 0; i < this.firstDayOfWeek; i++) {
            this.weeklySchedule.push(this.weeklySchedule.shift());
        }
    }
    
    setViewValue() {
        const newViewValue = this.weeklySchedule.map((value) => value.dailySchedule);
        for (let i = 0; i < this.firstDayOfWeek; i++) {
            newViewValue.unshift(newViewValue.pop());
        }
        this.ngModelCtrl.$setViewValue(newViewValue);
    }
}

return {
    templateUrl: require.toUrl('./weeklySchedule.html'),
    controller: WeeklyScheduleController,
    require: {
        ngModelCtrl: 'ngModel'
    },
    bindings: {},
    designerInfo: {
        translation: 'ui.dox.weeklySchedule',
        icon: 'sd_storage'
    }
};

}); // define
