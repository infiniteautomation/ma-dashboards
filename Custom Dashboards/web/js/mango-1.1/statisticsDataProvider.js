/**
 * Javascript Objects for the Providing Data on HTML pages.  
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

define(['jquery', './dataProvider'], function($, DataProvider) {

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
        if((changedOptions.rollup) && (changedOptions.rollupValue === 'NONE'))
        	return true;
        return false;
    },
    
    loadPoint: function(point, options) {
        return this.mangoApi.getStatistics(point.xid, options.from, options.to, this.apiOptions);
    }
});

DataProvider.registerProvider(StatisticsDataProvider);
return StatisticsDataProvider;

}); // close define
