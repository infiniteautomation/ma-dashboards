/**
 * Javascript Objects Used for Configuration of Rollups Picker
 * 
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

(function(factory) { // anonymous function
    // Support multiple module loading scenarios
    if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(['jquery'], factory);
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        this.RollupConfiguration = factory(jQuery);
    }
}(function($) { // factory function
"use strict";

var RollupConfiguration = function(divId, mixin, options){
    
    this.divId = divId;
    
    this.mixin = mixin;
    
    for(var i in options) {
        this[i] = options[i];
    }
    
    //Setup The Configuration
    this.configuration = $.extend(true, {}, this.getBaseConfiguration(), this.mixin);
    var self = this;
    this.configuration.onChange = function(){
        self.onChange($(this).val());
    };
};

RollupConfiguration.prototype = {
        divId: null, //Id of div to place Picker
        mixin: null, //Configuration overload
        configuration: null, //Full mixed-in config
        selected: 0,
        placeholder: null, //Placeholder for text
        
        addItem: function(label, id, selected){
            var html = "<option></option>";
            $('#' + this.divId).append( $(html).text(label).val(id));
        },
        
        create: function(){
            var self = this;
            var select = $('#' + this.divId);
            //Add the options
            for(var k in this.configuration.options){
                if(k == this.selected)
                    this.addItem(this.configuration.options[k].label, this.configuration.options[k].value, true);
                else
                    this.addItem(this.configuration.options[k].label, this.configuration.options[k].value, false);
                    
            }
            
            if(this.placeholder !== null)
                $('#' + this.divId).attr("placeholder", this.placeholder);
 
            //Add the onChange method
            select.change(self.configuration.onChange);
            if(this.configuration.options.length > 0){
                $('#' + this.divId).val(this.configuration.options[this.selected].value);
                if($('#' + this.divId).selectmenu !== undefined)
                    $('#' + this.divId).selectmenu('refresh', true);
            }
        },
        
        onChange: function(value){
            console.log(value);
        },
        
        getBaseConfiguration: function(){
            return {
                options: [
                          {label: 'AVERAGE', value: 'AVERAGE'}, 
                          {label: 'MAXIMUM', value: 'MAXIMUM'},
                          {label: 'MINIMUM', value: 'MINIMUM'},
                          {label: 'SUM', value: 'SUM'},
                          {label: 'FIRST', value: 'FIRST'},
                          {label: 'LAST', value: 'LAST'},
                          {label: 'COUNT', value: 'COUNT'}
                         ],
                onChange: function(rollup){
                    console.log(rollup);
                }
            };
        }
        
};

return RollupConfiguration;

})); // close factory function and execute anonymous function