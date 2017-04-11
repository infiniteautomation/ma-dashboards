/**
 *Configuration of Rollups Picker into a <select>
 * 
 * One can use this class to tie point values into a drop down menu,via the html select property
 * This is done most the time byt tying in a Grouper to the SelectConfiguration. 
 
 * Example goes here.
 * 
 * {@property} divId {String} The div Id that one wants to use for the selctor
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

define(['jquery'], function($) {
"use strict";

SelectPickerConfiguration = function(divId, mixin, options){
    
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

SelectPickerConfiguration.prototype = {
        divId: null, //Id of div to place Picker
        mixin: null, //Configuration overload
        configuration: null, //Full mixed-in config
        selected: 0, //Index selected
        placeholder: null, //Optional placeholder text
        
        addItem: function(label, id, selected){
            var html = "<option></option>";
            $('#' + this.divId).append( $(html).text(label).val(id));
            if($('#' + this.divId).selectpicker !== undefined)
                $('#' + this.divId).selectpicker('refresh');
        },
        
        onChange: function(value){
            console.log(value);
        },
        
        create: function(){
            var self = this;
            var select = $('#' + this.divId);
            if($('#' + this.divId).selectpicker !== undefined)
                $('#' + this.divId).selectpicker();
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
                if($('#' + this.divId).selectpicker !== undefined)
                    $('#' + this.divId).selectpicker('refresh');
            }
            
           
            
        },
        

        
        getBaseConfiguration: function(){
            return {
                options: [] //Array of {label, value}
            };
        }
        
};

return SelectPickerConfiguration;

}); // close define