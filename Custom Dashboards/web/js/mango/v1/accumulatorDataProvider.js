/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

(function(factory) { // anonymous function
    // Support multiple module loading scenarios
    if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(['jquery', './dataProvider', './mangoApi'], factory);
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        this.AccumulatorDataProvider = factory(jQuery, DataProvider, mangoRest);
    }
}(function($, DataProvider, mangoRest) { // factory function

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
        var from = mangoRest.formatLocalDate(options.from);
        var to = mangoRest.formatLocalDate(options.to);
        var promise = mangoRest.pointValues.getFirstLast(point.xid, from, to).then(function(data) {
            var result = {};
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

})); // close factory function and execute anonymous function