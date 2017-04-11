/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

define(['jquery', 'moment-timezone', 'jquery-ui/jquery.datetimepicker'], function($, moment) {

/*
 * The time period options and values are taken from the Java class
 * com.serotonin.m2m2.TimePeriodDescriptor. Ensure that they match. 
 */

TimePresetPicker = function(options) {
    this.presetPickerChanged = this.presetPickerChanged.bind(this);
    this.fromToPickerChanged = this.fromToPickerChanged.bind(this);
    
    this.presetPicker = null;
    this.fromPicker = null;
    this.toPicker = null;
    
    $.extend(this, options);
    
    this.setPresetPicker(this.presetPicker);
    this.setFromPicker(this.fromPicker);
    this.setToPicker(this.toPicker);
    this.setDefaultPreset(false);
};

TimePresetPicker.prototype = {
    format: 'lll',
    formatTime: 'LT',
    formatDate: 'l',
    defaultPeriod: 'PREVIOUS_DAY',
    
    setPresetPicker: function(picker) {
        if (this.presetPicker) {
            this.presetPicker.off('change', this.presetPickerChanged);
        }
        if (picker) {
            picker.on('change', this.presetPickerChanged);
            this.presetPicker = picker;
            this.populatePresetPicker();
        }
    },
    
    setToFromPicker: function(pickerName, picker) {
        if (this[pickerName]) {
            this[pickerName].off('change', this.fromToPickerChanged);
        }
        if (picker) {
            picker.datetimepicker({
                format: this.format,
                formatTime: this.formatTime,
                formatDate: this.formatDate
            });
            picker.on('change', this.fromToPickerChanged);
            this[pickerName] = picker;
        }
    },
    
    setFromPicker: function(picker) {
        this.setToFromPicker('fromPicker', picker);
    },
    
    setToPicker: function(picker) {
        this.setToFromPicker('toPicker', picker);
    },
    
    fromDate: function() {
        return this.from.toDate();
    },
    
    toDate: function() {
        return this.to.toDate();
    },
    
    currentPreset: function() {
        return this.preset;
    },
    
    hours: function() {
        return this.to.diff(this.from, 'hours', true);
    },
    
    populatePresetPicker: function() {
        for (var preset in this.presets) {
            var option = $('<option>');
            option.attr('value', preset);
            option.text(this.presets[preset].description);
            this.presetPicker.append(option);
        }
    },
    
    fromToPickerChanged: function(event) {
        var zone = moment.defaultZone && moment.defaultZone.name;
        var from = zone ? moment.tz(this.fromPicker.val(), this.format, zone) :
            moment(this.fromPicker.val(), this.format);
        var to = zone ? moment.tz(this.toPicker.val(), this.format, zone) :
            moment(this.toPicker.val(), this.format);
        
        if (from.isValid())
            this.from = from;
        if (to.isValid())
            this.to = to;
        
        this.setPreset('FIXED_TO_FIXED');
    },
    
    presetPickerChanged: function(event) {
        var preset = this.presetPicker.val();
        this.setPreset(preset);
    },
    
    setDefaultPreset: function(triggerEvent) {
        if (typeof triggerEvent === 'undefined')
            triggerEvent = true;
        this.setPreset(this.defaultPeriod, triggerEvent);
    },
    
    setPreset: function(preset, triggerRefresh) {
        if (typeof triggerRefresh === 'undefined')
            triggerRefresh = true;
        
        this.preset = preset;
        if (this.presetPicker) {
            this.presetPicker.val(preset).trigger('change.select2');
        }
        
        var period = TimePresetPicker.calculatePeriod(preset);
        if (period.from) {
            this.from = period.from;
            if (this.fromPicker) {
                this.fromPicker.val(period.from.format(this.format));
            }
        }
        if (period.to) {
            this.to = period.to;
            if (this.toPicker) {
                this.toPicker.val(period.to.format(this.format));
            }
        }
        
        $(this).trigger("change", {preset: this.preset, from: this.from, to: this.to, triggerRefresh: triggerRefresh});
    },
    
    presets: {
        "PREVIOUS_DAY": {
            id: 1,
            description: "Previous day"
        },
        "PREVIOUS_WEEK": {
            id: 7,
            description: "Previous week"
        },
        "PREVIOUS_4WEEKS": {
            id: 28,
            description: "Previous 4 weeks"
        },
        "PREVIOUS_MONTH": {
            id: 5,
            description: "Previous month"
        },
        "PREVIOUS_YEAR": {
            id: 6,
            description: "Previous year"
        },
        "YESTERDAY": {
            id: 4,
            description: "Yesterday"
        },
        "LAST_WEEK": {
            id: 3,
            description: "Last week"
        },
        "LAST_MONTH": {
            id: 2,
            description: "Last month"
        },
        "LAST_YEAR": {
            id: 8,
            description: "Last year"
        },
        "DAY_TO_DATE": {
            id: 9,
            description: "Day to date"
        },
        "WEEK_TO_DATE": {
            id: 10,
            description: "Week to date"
        },
        "MONTH_TO_DATE": {
            id: 11,
            description: "Month to date"
        },
        "YEAR_TO_DATE": {
            id: 12,
            description: "Year to date"
        },
        "FIXED_TO_FIXED": {
            id: 0,
            description: "Custom time period"
        },
        "FIXED_TO_NOW": {
            id: -1,
            description: "Custom time up to now"
        },
        "INCEPTION_TO_FIXED": {
            id: -2,
            description: "First value up to custom time"
        },
        "INCEPTION_TO_NOW": {
            id: -3,
            description: "First value up to now"
        }
    }
};

TimePresetPicker.calculatePeriod = function(preset) {
    var to = moment();
    var from = moment(to);
    
    switch(preset) {
    case "PREVIOUS_DAY":
        from.subtract(1, 'days');
        break;
    case "PREVIOUS_WEEK":
        from.subtract(1, 'weeks');
        break;
    case "PREVIOUS_4WEEKS":
        from.subtract(4, 'weeks');
        break;
    case "PREVIOUS_MONTH":
        from.subtract(1, 'months');
        break;
    case "PREVIOUS_YEAR":
        from.subtract(1, 'years');
        break;
    case "YESTERDAY":
        to.hours(0).minutes(0).seconds(0).milliseconds(0);
        from = moment(to).subtract(1, 'days');
        break;
    case "LAST_WEEK":
        to.weekday(0).hours(0).minutes(0).seconds(0).milliseconds(0);
        from = moment(to).subtract(1, 'weeks');
        break;
    case "LAST_MONTH":
        to.date(1).hours(0).minutes(0).seconds(0).milliseconds(0);
        from = moment(to).subtract(1, 'months');
        break;
    case "LAST_YEAR":
        to.dayOfYear(1).hours(0).minutes(0).seconds(0).milliseconds(0);
        from = moment(to).subtract(1, 'years');
        break;
    case "DAY_TO_DATE":
        from.hours(0).minutes(0).seconds(0).milliseconds(0);
        break;
    case "WEEK_TO_DATE":
        from.weekday(0).hours(0).minutes(0).seconds(0).milliseconds(0);
        break;
    case "MONTH_TO_DATE":
        from.date(1).hours(0).minutes(0).seconds(0).milliseconds(0);
        break;
    case "YEAR_TO_DATE":
        from.dayOfYear(1).hours(0).minutes(0).seconds(0).milliseconds(0);
        break;
    case "FIXED_TO_FIXED":
        from = null;
        to = null;
        break;
    case "FIXED_TO_NOW":
        from = null;
        break;
    case "INCEPTION_TO_FIXED":
        from = moment(0);
        to = null;
        break;
    case "INCEPTION_TO_NOW":
        from = moment(0);
        break;
    default:
        from = null;
        to = null;
        break;
    }
    
    return {from: from, to: to};
};

return TimePresetPicker;

}); // define
