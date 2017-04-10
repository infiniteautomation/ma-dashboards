/**
 * Javascript Objects Used for Configuration of Input Widgets
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
        this.InputConfiguration = factory(jQuery);
    }
}(function($) { // factory function
"use strict";

var InputConfiguration = function(divId, mixin, options){
    
    this.divId = divId;
    
    this.mixin = mixin;
    
    for(var i in options) {
        this[i] = options[i];
    }
    
    this.configuration = $.extend(true, {}, this.getBaseConfiguration(), this.mixin);
    var self = this;
    this.configuration.onChange = function(){
        self.onChange($(this).val());
    };

};

InputConfiguration.prototype = {
        
        
        divId: null, //Id of div to place Picker
        mixin: null, //Configuration overload
        configuration: null, //Full mixed-in config
        defaultValue: null, //Default Value
        
        create: function(){

            var input = $('#' + this.divId);
            input.val(this.defaultValue);
            //Add the onChange method
            input.change(this.configuration.onChange);
        },
        
        onChange: function(value){
            console.log(value);
        },
        
        
        getBaseConfiguration: function(){
            return {
                onChange: function(){
                    console.log('changed in base configuration');
                }
            };
        }
        
};

return InputConfiguration;

})); // close factory function and execute anonymous function
