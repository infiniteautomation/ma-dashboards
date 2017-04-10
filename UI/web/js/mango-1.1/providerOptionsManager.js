/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

define(['jquery', 'mango/api', 'extend', 'moment-timezone'],
function($, MangoAPI, extend, moment) {
"use strict";

/**
 * Note that the NONE rollup is now a value instead of ''
 */
var ProviderOptionsManager = extend({
    providerOptions: null,
    providers: [],
    refreshOnChange: true,
    /**
     * Used to set the default rollup period when a time preset is picked
     */
    graphType: 'bar',
    
    //Used to signal to disable the NONE rollup type
    allowNoneRollup: false,
    
    timePicker: null,
    rollupPicker: null,
    timePeriodTypePicker: null,
    timePeriodsPicker: null,
    
    constructor: function(options) {
        this.pickerChanged = this.pickerChanged.bind(this);
        
        this.providerOptions = {
            from: 0,
            to: 0,
            rollup: 'AVERAGE',
            timePeriodType: 'HOURS',
            timePeriods: 1
        };
        this.providers = [];
        
        $.extend(this, options);
        
        this.setTimePicker(this.timePicker);
        this.setRollupPicker(this.rollupPicker);
        this.setTimePeriodTypePicker(this.timePeriodTypePicker);
        this.setTimePeriodsPicker(this.timePeriodsPicker);
    },
    
    errorFunction: function() {},
    
    refreshProviders: function(forceRefresh) {
        var self = this;
        $.each(this.providers, function(key, provider) {
            self.refreshProvider(provider, forceRefresh);
        });
    },
    
    refreshProvider: function(provider, forceRefresh) {
        if (provider && provider.enabled) {
            // clone the options so providers can't modify them
            var options = $.extend({}, this.providerOptions);
            options.forceRefresh = forceRefresh || false;
            
            provider.load(options).fail(this.errorFunction);
        }
    },

    clearDisplays: function() {
        $.each(this.providers, function(key, provider) {
            provider.clear();
        });
    },
    
    addProvider: function(provider) {
        if (!provider)
            return;
        if ($.inArray(provider, this.providers) < 0)
            this.providers.push(provider);
    },
    
    /**
     * Finds an existing provider which matches an array of DataPointConfigurations
     * 
     * @param dataPointConfigurations - array of DataPointConfiguration
     * @returns a provider
     */
    findProvider: function(providerType, pointConfigs) {
        if (!$.isArray(pointConfigs))
            pointConfigs = [pointConfigs];
        
        for (var i = 0; i < this.providers.length; i++) {
            var provider = this.providers[i];
            if (provider.type !== providerType)
                continue;
            if (this.comparePointConfigs(pointConfigs, provider.pointConfigurations)) {
                return provider;
            }
        }
    },
    
    /**
     * Compares two DataPointConfiguration arrays based solely on point xid
     * 
     * @param array1
     * @param array2
     * @returns true if equivalent
     */
    comparePointConfigs: function(array1, array2) {
        if (array1.length !== array2.length)
            return false;
        
        for (var i = 0; i < array1.length; i++) {
            var config1 = array1[i];
            var foundConfig1 = false;
            for (var j = 0; j < array2.length; j++) {
                var config2 = array2[j];
                if (config1.point.xid == config2.point.xid) {
                    foundConfig1 = true;
                    break;
                }
            }
            if (!foundConfig1)
                return false;
        }
        return true;
    },
    
    pickerChanged: function(event, data) {
        var triggerRefresh = true;
        
        if (event.target === this.timePicker) {
            if (!data.triggerRefresh)
                triggerRefresh = false;
            this.timePickerChanged(data.preset);
            //Could suggest rollup values here
        }
        
        this.loadFromPickers();
        
        if (triggerRefresh && this.refreshOnChange) {
            this.refreshProviders();
        }

        $(this).trigger("change", this.providerOptions);

    },

    timePickerChanged: function(preset) {
        switch(preset) {
        case 'PREVIOUS_DAY':
        case 'YESTERDAY':
        case 'DAY_TO_DATE':
            if (this.graphType === 'line') {
                this.providerOptions.timePeriodType = 'MINUTES';
                this.providerOptions.timePeriods = 5;
            }
            else { // assume bar
                this.providerOptions.timePeriodType = 'HOURS';
                this.providerOptions.timePeriods = 1;
            }
            break;
        case 'PREVIOUS_WEEK':
        case 'LAST_WEEK':
        case 'WEEK_TO_DATE':
            if (this.graphType === 'line') {
                this.providerOptions.timePeriodType = 'HOURS';
                this.providerOptions.timePeriods = 1;
            }
            else { // assume bar
                this.providerOptions.timePeriodType = 'DAYS';
                this.providerOptions.timePeriods = 1;
            }
            break;
        case 'PREVIOUS_4WEEKS':
        case 'PREVIOUS_MONTH':
        case 'LAST_MONTH':
        case 'MONTH_TO_DATE':
            if (this.graphType === 'line') {
                this.providerOptions.timePeriodType = 'HOURS';
                this.providerOptions.timePeriods = 6;
            }
            else { // assume bar
                this.providerOptions.timePeriodType = 'DAYS';
                this.providerOptions.timePeriods = 1;
            }
            break;
        case 'PREVIOUS_YEAR':
        case 'LAST_YEAR':
        case 'YEAR_TO_DATE':
            if (this.graphType === 'line') {
                this.providerOptions.timePeriodType = 'DAYS';
                this.providerOptions.timePeriods = 1;
            }
            else { // assume bar
                this.providerOptions.timePeriodType = 'MONTHS';
                this.providerOptions.timePeriods = 1;
            }
            break;
        default:
            // dont change anything for custom time periods
            return;
        }
        
        if (this.timePeriodsPicker)
            this.timePeriodsPicker.val(this.providerOptions.timePeriods).trigger('change.select2');
        if (this.timePeriodTypePicker)
            this.timePeriodTypePicker.val(this.providerOptions.timePeriodType).trigger('change.select2');
    },
    
    quantizationPeriod: function() {
        return moment.duration(this.providerOptions.timePeriods,
                this.providerOptions.timePeriodType.toLowerCase());
    },
    
    loadFromPickers: function(event) {
        if (this.timePicker) {
            var from = this.timePicker.from;
            var to = this.timePicker.to;
            
            if (to.isBefore(from))
                return;
            
            this.providerOptions.from = from.toDate();
            this.providerOptions.to = to.toDate();
            this.providerOptions.fromMoment = from;
            this.providerOptions.toMoment = to;
        }
        
        if (this.rollupPicker.length > 0) {
            this.providerOptions.rollup = this.rollupPicker.val();
        }
        if (this.timePeriodTypePicker.length > 0) {
            this.providerOptions.timePeriodType = this.timePeriodTypePicker.val();
        }
        if (this.timePeriodsPicker.length > 0) {
            this.providerOptions.timePeriods = parseInt(this.timePeriodsPicker.val(), 10);
        }
        
        // disable the time period pickers when there is no rollup
        this.timePeriodTypePicker.prop('disabled', this.providerOptions.rollup === 'NONE');
        this.timePeriodsPicker.prop('disabled', this.providerOptions.rollup === 'NONE');
    },
    
    /**
     * This is no longer used, we are now checking the count.
     * 
     * Dont allow tiny rollup periods for comparatively large date ranges
     * Also limit the use of no rollup to small periods
     */
    limitRollupPeriod: function() {
    	
        
    	var timePeriod = this.providerOptions.to - this.providerOptions.from;

        
        if (((this.providerOptions.rollup === 'NONE')||(this.providerOptions.rollup === ''))  && timePeriod > moment.duration(1, 'hours').asMilliseconds()) {
        	//We need to either choose a rollup that is available for all data types or track a data type here
        	this.allowNoneRollup = false;
        	this.providerOptions.rollup = 'FIRST'; 
            this.rollupPicker.val(this.providerOptions.rollup).trigger('change.select2');
            this.providerOptions.timePeriods = 1;
            this.providerOptions.timePeriodType = 'MINUTES';
        }
        
        if (this.providerOptions.rollup !== 'NONE') {
            var timePeriods = this.providerOptions.timePeriods;
            var timePeriodType = this.providerOptions.timePeriodType.toLowerCase();
            var rollupPeriod = moment.duration(timePeriods, timePeriodType).asMilliseconds();
            
            if (timePeriod >  moment.duration(5, 'year').asMilliseconds()) {
                // more than 5 years
                if (rollupPeriod < moment.duration(1, 'months').asMilliseconds()) {
                    this.providerOptions.timePeriods = 1;
                    this.providerOptions.timePeriodType = 'MONTHS';
                }
            }
            else if (timePeriod >  moment.duration(1, 'years').asMilliseconds()) {
                // 1 years to 5 years: 5 years * 52 weeks = 260 periods
                if (rollupPeriod < moment.duration(1, 'weeks').asMilliseconds()) {
                    this.providerOptions.timePeriods = 1;
                    this.providerOptions.timePeriodType = 'WEEKS';
                }
            }
            else if (timePeriod >  moment.duration(31, 'days').asMilliseconds()) {
                // 31 days to 1 year: 12 months * 30 days = 360 periods
                if (rollupPeriod < moment.duration(1, 'days').asMilliseconds()) {
                    this.providerOptions.timePeriods = 1;
                    this.providerOptions.timePeriodType = 'DAYS';
                }
            }
            else if (timePeriod >  moment.duration(1, 'weeks').asMilliseconds()) {
                // 1 week to 1 month: 31 days * 24 hours = 744 periods
                if (rollupPeriod < moment.duration(1, 'hours').asMilliseconds()) {
                    this.providerOptions.timePeriods = 1;
                    this.providerOptions.timePeriodType = 'HOURS';
                }
            }
            else if (timePeriod >  moment.duration(2, 'days').asMilliseconds()) {
                // 2 days to 1 week: 7days * 24 hours * 60 minutes / 15 = 672 periods
                if (rollupPeriod < moment.duration(15, 'minutes').asMilliseconds()) {
                    this.providerOptions.timePeriods = 15;
                    this.providerOptions.timePeriodType = 'MINUTES';
                }
            }
            else if (timePeriod >  moment.duration(12, 'hours').asMilliseconds()) {
                // 12 hours to 2 day: 2 days * 24 hours * 60 minutes / 5 = 576 periods
                if (rollupPeriod < moment.duration(5, 'minutes').asMilliseconds()) {
                    this.providerOptions.timePeriods = 5;
                    this.providerOptions.timePeriodType = 'MINUTES';
                }
            }
            else if (timePeriod >  moment.duration(1, 'hours').asMilliseconds()) {
                // 1 hours to 12 hrs:  12 hours * 60 minutes / 1 =  720 periods
                if (rollupPeriod < moment.duration(1, 'minutes').asMilliseconds()) {
                    this.providerOptions.timePeriods = 1;
                    this.providerOptions.timePeriodType = 'MINUTES';
                }
            }else if (timePeriod > 0){
            	//For all time less than 1 hrs we can allow second level rollup
            	// 0 to 1 hours: 3600 periods yikes!
            	this.allowNoneRollup = true;
            	if (rollupPeriod < moment.duration(1, 'second').asMilliseconds()) {
                    this.providerOptions.timePeriods = 1;
                    this.providerOptions.timePeriodType = 'SECONDS';
                }
            }
        }
        
        this.timePeriodsPicker.val(this.providerOptions.timePeriods).trigger('change.select2');
        this.timePeriodTypePicker.val(this.providerOptions.timePeriodType).trigger('change.select2');
    },
    
    setTimePicker: function(picker) {
        var existingPicker = this.timePicker;
        $(existingPicker).off('change', this.pickerChanged);
        $(picker).on('change', this.pickerChanged);
        this.timePicker = picker;
    },
    
    setRollupPicker: function(picker) {
        this.setPicker('rollupPicker', picker);
    },
    
    setTimePeriodTypePicker: function(picker) {
        this.setPicker('timePeriodTypePicker', picker);
    },
    
    setTimePeriodsPicker: function(picker) {
        this.setPicker('timePeriodsPicker', picker);
    },
    
    setPicker: function(pickerName, picker) {
        var existingPicker = this[pickerName];
        if (existingPicker)
            existingPicker.off('change', this.pickerChanged);
        picker = $(picker);
        picker.on('change', this.pickerChanged);
        this[pickerName] = picker;
    },

    getAllowNoneRollup: function(){
    	return this.allowNoneRollup;
    }
});

return ProviderOptionsManager;

}); // require
