/**
 * Javascript Objects Used for Configuration of Date Time Picker
 * 
 * Inputs:
 * - Rollup Drop Down
 * - Time Period Drop Down
 * - Periods Input
 * 
 * - Start Date Picker
 * - End Date Picker
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

define(['jquery', 'jquery-ui/jquery.datetimepicker'], function($) {
"use strict";

var DateTimePickerConfiguration = function(divId, mixin, options){
    this.divId = divId;
    this.mixin = mixin;
    
    for(var i in options) {
        this[i] = options[i];
    }
    
    this.configuration = $.extend(true, {}, this.getBaseConfiguration(), this.mixin);
    
    //Configure the callback
    var self = this;
    this.configuration.onChangeDateTime = function(dp, $input){
        self.onChange(dp ? dp.toDate() : null, $input);
    };
};

DateTimePickerConfiguration.prototype = {
        
        divId: null, //Id of div to place Picker
        mixin: null, //Configuration overload
        configuration: null, //Full mixed-in config
        defaultValue: null, //Default Date/Time
        
        create: function() {
            var picker = $("#" + this.divId).datetimepicker(this.configuration);
        },

        onChange: function(date, picker){
            console.log('picked: ' + date);
        },
        
        getBaseConfiguration: function (){
                   return {
                        /**
                         * @param dp - Picked Date object
                         * @param $input - the input widget
                         */
                        onChangeDateTime: function(dp,$input){
                            console.log(dp); //Log the date
                        },
                        defaultTime: '00:00',
                        value: this.defaultValue,
                        closeOnDateSelect: false //Close when date is selected
                    };
  
        }
};

return DateTimePickerConfiguration;

}); // close define
