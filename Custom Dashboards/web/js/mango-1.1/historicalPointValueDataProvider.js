/**
 * Javascript Objects for the Providing Data on HTML pages.  
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

define(['jquery', './dataProvider'], function($, DataProvider) {

var HistoricalPointValueDataProvider = DataProvider.extend({
    /**
     * Data Provider constructor
     * @param id
     * @param options
     * @returns
     */
    constructor: function(id, options) {
        DataProvider.apply(this, arguments);
    },

    type: 'HistoricalPointValueDataProvider',

    loadPoint: function(point, options) {
        return this.mangoApi.getLatestValues(point.xid, options.historicalSamples, this.apiOptions);
    }
});

DataProvider.registerProvider(HistoricalPointValueDataProvider);
return HistoricalPointValueDataProvider;

}); // close define