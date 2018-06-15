/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './cronPattern.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maCronPattern
 * @restrict E
 * @description Interface for editing a cron pattern.
 */

const $inject = Object.freeze(['$scope', '$http']);
class CronPatternController {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope, $http) {
        this.$scope = $scope;
        this.$http = $http;
    }
    
    $onInit() {
        this.seconds = 60;
        this.minutes = 60;
        this.hours = 24;
        this.daysOfMonth = 31;

        this.ngModelCtrl.$render = () => this.render();
        this.cronArray = [];
    }

    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.cronPattern);
    }
    
    render() {
        this.cronPattern = this.ngModelCtrl.$viewValue;

        if (!this.cronPattern) {
            this.cronPattern = '* * * * * ?';
        }

        this.setViewValue();
        this.updateSelectBoxes();
    }

    getNumber(num) {
        return new Array(num);   
    }

    selectSecond() {
        this.cronArray = this.cronPattern.split(' ');
        this.cronArray[0] = this.second;
        this.cronPattern = this.cronArray.join(' ');
        this.setViewValue();
    }

    selectMinute() {
        this.cronArray = this.cronPattern.split(' ');
        this.cronArray[1] = this.minute;
        this.cronPattern = this.cronArray.join(' ');
        this.setViewValue();
    }

    selectHour() {
        this.cronArray = this.cronPattern.split(' ');
        this.cronArray[2] = this.hour;
        this.cronPattern = this.cronArray.join(' ');
        this.setViewValue();
    }

    selectDayOfMonth() {
        this.cronArray = this.cronPattern.split(' ');
        this.cronArray[3] = this.dayOfMonth;
        this.cronArray[5] = '?';
        this.cronPattern = this.cronArray.join(' ');
        this.setViewValue();
    }

    selectMonth() {
        this.cronArray = this.cronPattern.split(' ');
        this.cronArray[4] = this.month;
        this.cronPattern = this.cronArray.join(' ');
        this.setViewValue();
    }

    selectDayOfWeek() {
        this.cronArray = this.cronPattern.split(' ');
        this.cronArray[5] = this.dayOfWeek;
        this.cronArray[3] = '?';
        this.cronPattern = this.cronArray.join(' ');
    }

    updateSelectBoxes() {
        this.cronArray = this.cronPattern.split(' ');
        
        this.second = this.cronArray[0];
        this.minute = this.cronArray[1];
        this.hour = this.cronArray[2];
        this.dayOfMonth = this.cronArray[3];
        this.month = this.cronArray[4];
        this.dayOfWeek = this.cronArray[5];
    }

    $onChanges(changes) {
    }
}

export default {
    template: componentTemplate,
    controller: CronPatternController,
    bindings: {},
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.cronPatternEditor',
        icon: 'date_range'
    }
};
