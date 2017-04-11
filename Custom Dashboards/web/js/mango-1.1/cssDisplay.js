/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

define(['jquery'], function($) {
"use strict";

var CssDisplay = function(options) {
    this.min = 0;
    this.max = 100;
    this.property = 'width';
    this.valueAttribute = 'value';
    this.limitPercentage = true;

    for(var i in options) {
        this[i] = options[i];
    }
    
    this.dataProviderIds = [this.dataProviderId];
};

CssDisplay.prototype = {
        createDisplay: function() {
            return this;
        },
        
        /**
         * Data Provider listener to clear data
         */
        onClear: function() {
            this.selection.css('width', '0%');
        },
        
        /**
         * Data Provider Listener
         * On Data Provider load we add new data
         */
        onLoad: function(data, dataPoint) {
            if ($.isArray(data)) {
                data = data[0];
            }
            if (typeof data.minimum == 'object') {
                data.minimum = data.minimum.value;
                data.maximum = data.maximum.value;
                data.difference = data.maximum - data.minimum;
            }
            
            var value = data[this.valueAttribute];
            if (typeof this.manipulateValue === 'function')
                value = this.manipulateValue(value, dataPoint);
            
            var prop = {};
            var range = this.max - this.min;
            value = 1 - (this.max - value) / range;
            if (this.limitPercentage) {
                if (value < 0)
                    value = 0;
                else if (value > 1)
                    value = 1;
            }
            prop[this.property] = (value * 100).toFixed(2) + '%';
            
            this.selection.animate(prop, {
                duration: 500,
                easing: 'swing'
            });
        }
};

return CssDisplay;

}); // define
