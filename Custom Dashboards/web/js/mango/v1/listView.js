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
        this.ListViewConfiguration = factory(jQuery);
    }
}(function($) { // factory function
"use strict";

var ListViewConfiguration = function(listId, mixin, options){
    
    this.listId = listId;
    
    this.mixin = mixin;
    
    for(var i in options) {
        this[i] = options[i];
    }
    
    //Setup The Configuration
    this.configuration = $.extend(true, {}, this.getBaseConfiguration(), this.mixin);
    var self = this;
//    this.configuration.onChange = function(){
//        self.onChange($(this).val());
//    };
};

ListViewConfiguration.prototype = {
        
        
        listId: null, //Id of List
        mixin: null, //Configuration overload
        configuration: null, //Full mixed-in config
        styleClass: null,
        
        addItem: function(label, id){
            var self = this;
//            $('#'+ this.listId).append(
//                    $('<li>').append(label));
            var li = $('<li>');
            $('#'+ this.listId).append(
                li.append(label));   
            li.click(function(){self.onChange(id);});
            if(this.styleClass !== null)
                li.attr('class', this.styleClass);
        },
        
        onChange: function(value){
            console.log(value);
        },
        
        create: function(){
            var self = this;
            var list = $('#' + this.divId);
            //Add the options
            for(var k in this.configuration.options){
                this.addItem(this.configuration.items[k].label, this.configuration.items[k].value);
            }
        },
        

        
        getBaseConfiguration: function(){
            return { 
                    items: [] //Array of {label, value}
                   };
            
        }
        
};

return ListViewConfiguration;

})); // close factory function and execute anonymous function
