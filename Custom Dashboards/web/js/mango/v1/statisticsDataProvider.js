/**
 * Javascript Objects for the Providing Data on HTML pages.  
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

(function(factory) { // anonymous function
    // Support multiple module loading scenarios
    if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(['jquery', './dataProvider', './mangoApi'], factory);
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        this.StatisticsDataProvider = factory(jQuery, DataProvider, mangoRest);
    }
}(function($, DataProvider, mangoRest) { // factory function

var StatisticsDataProvider = DataProvider.extend({
    /**
     * Data Provider constructor
     * @param id
     * @param options
     * @returns
     */
    constructor: function(id, options) {
        DataProvider.apply(this, arguments);
    },

    type: 'StatisticsDataProvider',

    needsToLoad: function(changedOptions) {
        if (changedOptions.from || changedOptions.to)
            return true;
        return false;
    },
    
    loadPoint: function(point, options) {
        var from = mangoRest.formatLocalDate(options.from);
        var to = mangoRest.formatLocalDate(options.to);
        return mangoRest.pointValues.getStatistics(point.xid, from, to);
    }
});

DataProvider.registerProvider(StatisticsDataProvider);
return StatisticsDataProvider;

})); // close factory function and execute anonymous function