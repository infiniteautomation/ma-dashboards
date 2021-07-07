/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import moment from 'moment-timezone';


dateInput.$inject = [];
function dateInput() {
    return {
        restrict: 'A',
        require: {
            ngModel: 'ngModel'
        },
        scope: false,
        bindToController: {
            format: '@?',
            timezone: '@?',
            scaleNumber: '<?',
            modelType: '@?'
        },
        controller: ['MA_DATE_FORMATS', function(MA_DATE_FORMATS) {
            this.$onInit = function() {
                if (!this.modelType) {
                    this.modelType = 'date';
                } else {
                    this.modelTypeFixed = true;
                }
                
                this.ngModel.$formatters.push(function fromDate(value) {
                    if (Object.prototype.toString.call(value) === '[object Date]') {
                        if (!this.modelTypeFixed) this.modelType = 'date';
                    } else if (moment.isMoment(value)) {
                        if (!this.modelTypeFixed) this.modelType = 'moment';
                    } else if (typeof value === 'number') {
                        if (!this.modelTypeFixed) this.modelType = 'number';
                        if (this.scaleNumber) {
                            value *= this.scaleNumber;
                        }
                    } else if (typeof value === 'string' && isFinite(parseInt(value, 10))) {
                        value = parseInt(value, 10);
                        if (!this.modelTypeFixed) this.modelType = 'number';
                        if (this.scaleNumber) {
                            value *= this.scaleNumber;
                        }
                    } else {
                        return;
                    }
                    
                    const m = moment(value);
                    if (this.timezone) {
                        m.tz(this.timezone);
                    }
                    return m.format(this.getFormat());
                }.bind(this));

                this.ngModel.$parsers.push(function toDate(value) {
                    if (typeof value === 'string') {
                        const m = moment.tz(value, this.getFormat(), true, this.timezone);
                        if (m.isValid()) {
                            if (this.modelType === 'date') {
                                return m.toDate();
                            } else if (this.modelType === 'moment') {
                                return m;
                            } else if (this.modelType === 'number') {
                                let numberVal = m.valueOf();
                                if (this.scaleNumber) {
                                    numberVal /= this.scaleNumber;
                                }
                                return numberVal;
                            }
                        }
                    }
                }.bind(this));
            };
            
            this.getFormat = function getFormat() {
                return this.format || MA_DATE_FORMATS.dateTimeSeconds;
            };
        }]
    };
}

export default dateInput;


