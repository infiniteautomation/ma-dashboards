/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

define(['jquery', './dataProvider', './pointValueDataProvider', 'moment-timezone'],
        function($, DataProvider, PointValueDataProvider, moment) {
"use strict";

var AccumulatorRollupDataProvider = PointValueDataProvider.extend({
    type: 'AccumulatorRollupDataProvider',
    
    needsToLoad: function(changedOptions) {
        if (changedOptions.from || changedOptions.to ||
                changedOptions.timePeriodType || changedOptions.timePeriods)
            return true;
        return false;
    },

    /**
     * Method that is called before publishing the data to the Displays
     * it is here that we can modify the data
     */
    manipulateData: function(pointValues, dataPoint) {
        var newData = [];
        if (pointValues.length === 0)
            return newData;
        
        var previous = pointValues[0];
        
        //Subtract previous value from current.
        for (var i = 1; i < pointValues.length; i++) {
            var current = pointValues[i];
            var entry = {
                    value: current.value - previous.value,
                    timestamp: current.timestamp
            };
            newData.push(entry);
            
            //Move along
            previous = current;
        }
        
        return newData;
    },
    
    loadPoint: function(point, options) {
        // clone so we can change rollup without affecting options elsewhere
        options = $.extend({}, options);
        // always use accumulator rollup
        options.rollup = 'ACCUMULATOR';
        
        var modifiedFrom = moment(options.fromMoment);
        // need to get 1 extra time period so we have accumulator previous value
        switch(options.timePeriodType) {
        case "MINUTES":
            modifiedFrom.subtract(1, 'minutes');
            break;
        case "HOURS":
            modifiedFrom.subtract(1, 'hours');
            break;
        case "DAYS":
            modifiedFrom.subtract(1, 'days');
            break;
        case "MONTHS":
            modifiedFrom.subtract(1, 'months');
            break;
        }
        options.from = modifiedFrom.toDate();
        
        return PointValueDataProvider.prototype.loadPoint.call(this, point, options);
    }
});

DataProvider.registerProvider(AccumulatorRollupDataProvider);
return AccumulatorRollupDataProvider;

}); // close define