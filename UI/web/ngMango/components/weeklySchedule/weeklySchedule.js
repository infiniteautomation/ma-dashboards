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

const $inject = Object.freeze([]);
class WeeklyScheduleController {
    static get $inject() { return $inject; }
    
    constructor() {
        this.firstDayOfWeek = moment.localeData().firstDayOfWeek();
        this.weekDays = moment.weekdaysShort(true);
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
    }
    
    render() {
        this.weeklySchedule = this.ngModelCtrl.$viewValue && this.ngModelCtrl.$viewValue.slice() || [];
        while (this.weeklySchedule.length < 7) {
            this.weeklySchedule.push([]);
        }

        for (let i = 0; i < this.firstDayOfWeek; i++) {
            this.weeklySchedule.push(this.weeklySchedule.shift());
        }
    }
    
    setViewValue() {
        const newViewValue = this.weeklySchedule.slice();
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
