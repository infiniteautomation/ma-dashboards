/**
 * Javascript Objects for the Providing Data on HTML pages.  
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

define(['jquery', './dataProvider'], function($, DataProvider) {
"use strict";

var PointValueDataProvider = DataProvider.extend({
    /**
     * Data Provider constructor
     * @param id
     * @param options
     * @returns
     */
    constructor: function(id, options) {
        DataProvider.apply(this, arguments);
    },
    
    type: 'PointValueDataProvider',
    //For Counts to limit options
    maxPointValueCount: 5000,
    
    needsToLoad: function(changedOptions) {
        if (changedOptions.from || changedOptions.to || changedOptions.rollup ||
                changedOptions.timePeriodType || changedOptions.timePeriods)
            return true;
        return false;
    },

    loadPoint: function(point, options) {
        var apiOptions = $.extend({}, this.apiOptions, {
            rollup: options.rollup,
            timePeriodType: options.timePeriodType,
            timePeriods: options.timePeriods
        });
        
        return this.tryLoadPoint(point, options);
        //return this.mangoApi.getValues(point.xid, options.from, options.to, apiOptions);
    },
    
    tryLoadPoint: function(point, options){
        var self = this;
    	return this.mangoApi.countValues(point.xid, options.from, options.to, options).then(function(count){
    		if(count <= self.maxPointValueCount){
    			return self.mangoApi.getValues(point.xid, options.from, options.to, options);
    		}else{
    			var deferred = $.Deferred();
    			//deferred.reject(null,'Too Much Data', 'Too Many PointValues Data', 'Max Allowed: ' + self.maxPointValueCount);
    			deferred.done({data: [], point: point});
    			self.tooMuchData(count, self.maxPointValueCount);
    			return deferred.promise();
    		}
    	});
    },
    
    tooMuchData: function(amount, limit){
    	alert('Cannot Display ' + amount + ' point values.  Maximum is: ' + limit);
    }
});

DataProvider.registerProvider(PointValueDataProvider);
return PointValueDataProvider;

}); // close define
