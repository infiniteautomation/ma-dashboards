/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * 
 * Display HTML Content in a component
 * 
 * @author Jared Wiltshire
 */

define(['jquery'], function($) {

HTMLDisplay = function(options) {
    this.valueAttribute = 'value';
    this.suffix = '';
    this.decimalPlaces = 2;
    this.inhibitUpdateOnFocus = $(null);

    for(var i in options) {
        this[i] = options[i];
    }
    
    this.dataProviderIds = [this.dataProviderId];
};

HTMLDisplay.prototype = {
        createDisplay: function() {
            return this;
        },
        
        /**
         * Data Provider listener to clear data
         */
        onClear: function() {
            if (this.useVal) {
                var inputs = this.selection.filter('input');
                var others = this.selection.not(inputs);
                inputs.val('');
                others.html('');
            }
            else {
                this.selection.html('');
            }
            delete this.previous;
        },
        
        /**
         * Data Provider Listener
         * On Data Provider load we add new data
         */
        onLoad: function(data, dataPoint) {
            if ($.isArray(data)) {
                if (data.length) {
                    data = data[0];
                }
                else return;
            }
            
            if (typeof data.minimum == 'object') {
                data.minimum = data.minimum.value;
                data.maximum = data.maximum.value;
                data.difference = data.maximum - data.minimum;
            }
            
            var value = data[this.valueAttribute];
            if (value === null || value === undefined) {
                // we will often want convertedValue or renderedValue but they aren't available
                // on non-numeric points
                value = data.value;
            }
            
            if (typeof this.manipulateValue === 'function')
                value = this.manipulateValue(value, dataPoint);

            var rendered = this.renderText(value);
            
            if (typeof this.onChange === 'function') {
                if (this.previous !== undefined && rendered !== this.previous) {
                    this.onChange();
                }
                this.previous = rendered;
            }
            
            if (this.useVal) {
                var inputs = this.selection.filter('input');
                var others = this.selection.not(inputs);
                
                if (this.inhibitUpdateOnFocus.filter(':focus').length === 0) {
                    inputs.filter(':not(:focus)').val(rendered);
                }
                others.html(rendered);
            }
            else {
                this.selection.html(rendered);
            }
        },
        
        renderText: function(value) {
            // PointValueTime
            if (value && typeof value === 'object' && 'value' in value && 'timestamp' in valuevalue) {
                return this.renderValue(value.value);
            }
            
            return this.renderValue(value);
        },

        renderValue: function(value) {
            if (typeof value === 'number')
                return value.toFixed(this.decimalPlaces) + this.suffix;
            return value;
        }
};

return HTMLDisplay;

}); // define
