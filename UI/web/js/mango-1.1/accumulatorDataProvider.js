/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

define(['jquery', './dataProvider'], function($, DataProvider) {
"use strict";

var AccumulatorDataProvider = DataProvider.extend({
    /**
     * Data Provider constructor
     * @param id
     * @param options
     * @returns
     */
    constructor: function(id, options) {
        DataProvider.apply(this, arguments);
    },

    type: 'AccumulatorDataProvider',
    
    needsToLoad: function(changedOptions) {
        if (changedOptions.from || changedOptions.to)
            return true;
        return false;
    },

    loadPoint: function(point, options) {
        var promise = this.mangoApi.getFirstLastValues(point.xid, options.from, options.to, this.apiOptions)
        .then(function(data) {
            var result = {};
            if (data.length < 2 || !data[0] || !data[1]) {
                result.value = null;
                return result;
            }
            result.value = data[1].value - data[0].value;
            result.first = data[0];
            result.last = data[1];
            return result;
        });
        return promise;
    }
});

DataProvider.registerProvider(AccumulatorDataProvider);
return AccumulatorDataProvider;

}); // close define