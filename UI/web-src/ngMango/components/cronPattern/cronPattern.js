/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import componentTemplate from './cronPattern.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maCronPattern
 * @restrict E
 * @description Interface for editing a cron pattern.
 */

class CronPatternController {
    static get $inject() { return []; }
    static get $$ngIsClass() { return true; }
    
    constructor() {
    }
    
    $onInit() {
        this.seconds = Array(60).fill().map((v,i) => i);
        this.minutes = Array(60).fill().map((v,i) => i);
        this.hours = Array(24).fill().map((v,i) => i);
        this.daysOfMonth = Array(31).fill().map((v,i) => i + 1);

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

        this.updateSelectBoxes();
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
        this.setViewValue();
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
