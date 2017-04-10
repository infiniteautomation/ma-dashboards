/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

define(['jquery', 'extend', './api'], function($, extend, MangoAPI) {

var DataProvider = extend({
    /**
     * Data Provider constructor
     * @param id
     * @param options
     * @returns
     */
    constructor: function(id, options) {
        this.id = id;
        this.listeners = [];
        this.pointConfigurations = [];
        this.apiOptions = {};
        
        $.extend(this, options);
        
        if (!this.mangoApi) {
            this.mangoApi = MangoAPI.defaultApi;
        }
        
        if (this.enabled) {
            this.enable();
        }
    },
    
    type: 'DataProvider',
    id: null, //Unique ID for reference (use Alphanumerics as auto generated ones are numbers)
    pointConfigurations: null, //List of Points + configurations to use
    listeners: null, //Listeners to send new data when load() completes
    enabled: true,
    cancelLastLoad: true,
    clearOnLoad: true,
    
    /**
     * Optionally manipulate data.
     * 
     *  Send in this method in the options during object creation.
     * 
     * @param data - data returned from load()
     * @param point - corresponding point
     * @return manipulated data
     */
    manipulateData: function(data, point) {
        return data;
    },
    
    /**
     * Clear out our pointConfigurations if required
     * 
     * Signal to all Listeners to clear ALL their data
     * 
     * @param clearConfigurations - boolean to clear pointConfigurations too
     */
    clear: function(clearConfigurations) {
        if (clearConfigurations) {
            while (this.pointConfigurations.length > 0) {
                this.pointConfigurations.pop();
            }
            // ensures that next load() call actually loads
            if (this.previousOptions)
                delete this.previousOptions;
        }
        for (var i = 0; i < this.listeners.length; i++) {
            this.listeners[i].onClear();
        }
    },
    
    needsToLoad: function(changedOptions) {
        return true;
    },
    
    /**
     * Load our data and publish to listeners
     * @param options - {from: date, to: date}
     * @param error - method to call on error
     * @return promise when done
     */
    load: function(options, error) {
        if (!this.enabled) {
            return rejectedPromise("disabled", "Data provider is not enabled");
        }
        
        // check if we should reload
        var changedOptions = this.changedOptions(this.previousOptions, options);
        if (!options.forceRefresh && !this.needsToLoad(changedOptions)) {
            return rejectedPromise("notNeeded", "Load is not needed");
        }
        
        this.previousOptions = options;
        
        if (this.clearOnLoad) {
            this.clear();
        }
        
        if (this.pointConfigurations.length > 0)
            this.notifyLoading();
        
        if (this.cancelLastLoad)
            this.cancelLoad();
        
        var promises = [];

        var self = this;
        $.each(this.pointConfigurations, function(i, configuration) {
            var point = self.toPoint(configuration);
            var promise = self.loadPoint(point, options).then(function(data) {
                // filter promise so we supply point to promise.done
                return {data: data, point: point};
            });
            promises.push(promise);
        });

        var combinedPromise = this.lastLoadPromise = MangoAPI.when(promises);
        
        // notify all listeners at once in order
        combinedPromise.done(function() {
            for (var i in arguments) {
                var resolved = arguments[i];
                self.notifyListeners(resolved.data, resolved.point);
            }
            self.redrawListeners();
        });
        
        if (typeof error == 'function') combinedPromise.fail(error);
        
        return combinedPromise;
    },
    
    loadPoint: function(point, options) {
        // fail. need to override
        var deferred = $.Deferred();
        deferred.reject(null, "invalid", "loadPoint() should be overridden");
        return deferred.promise();
    },
    
    cancelLoad: function() {
        if (this.lastLoadPromise &&
                this.lastLoadPromise.state() === 'pending' &&
                typeof this.lastLoadPromise.cancel === 'function') {
            this.lastLoadPromise.cancel();
        }
    },
    
    /**
     * Notifies the listeners of new data
     * @param the new data
     * @param the point that the data came from
     */
    notifyListeners: function(data, point) {
        // Optionally manipulate the data
        if (this.manipulateData !== null)
            data = this.manipulateData(data, point);

        // Inform our listeners of this new data
        for (var i=0; i<this.listeners.length; i++) {
            this.listeners[i].onLoad(data, point);
        }
    },
    
    /**
     * Tells listeners to redraw, if they support it
     */
    redrawListeners: function() {
        for (var i=0; i<this.listeners.length; i++) {
            if (typeof this.listeners[i].redraw === 'function')
                this.listeners[i].redraw();
        }
    },
    
    /**
     * Notifies the listeners that data is loading
     * @param
     */
    notifyLoading: function() {
        for (var i=0; i<this.listeners.length; i++) {
            if (typeof this.listeners[i].loading === 'function')
                this.listeners[i].loading();
        }
    },
    
    /**
     * Put Point Value 
     * @param options {
     *                  refresh: boolean to refresh displays,
     *                  putAll: boolean, true if value is written to all points
     *                  value: PointValueTime Model if putAll is true, otherwise
     *                         an object with PVT model for each XID
     *                }
     * 
     * @return promise
     */
    put: function(options) {
        if (!this.enabled) {
            return rejectedPromise("disabled", "Data provider is not enabled");
        }
                
        var promises = [];

        var self = this;
        $.each(this.pointConfigurations, function(i, configuration) {
            var point = self.toPoint(configuration);
            var value = options.putAll ? options.value : options.value[point.xid];
            if (value) {
                var promise = self.putPoint(point, value, options).then(function(data) {
                    // filter promise so we supply point to promise.done
                    return {data: data, point: point};
                });
                promises.push(promise);
            }
        });

        var combinedPromise = MangoAPI.when(promises);
        
        if (options.refresh) {
            // notify all listeners at once in order
            combinedPromise.done(function() {
                for (var i in arguments) {
                    var resolved = arguments[i];
                    self.notifyListeners(resolved.data, resolved.point);
                }
                self.redrawListeners();
            });
        }
        
        if (typeof error == 'function') combinedPromise.fail(error);
        
        return combinedPromise;
    },
    
    putPoint: function(point, value, options) {
        /**
         * TODO properly handle putting a rendered text string to REST endpoints
         * This should work for numeric/multistate/binary points
         * This is a workaround until then
         */
        var putOptions = $.extend({}, this.apiOptions);
        if (putOptions.rendered) {
            putOptions.rendered = false;
            if (point.pointLocator.dataType === 'NUMERIC') {
                putOptions.converted = true;
            }
        }
        
        return this.mangoApi.putValue(point.xid, value, putOptions);
    },
    
    /**
     * Add a listener who registers to know of our updates
     */
    addListener: function(dataProviderListener) {
        this.listeners.push(dataProviderListener);
    },
    
    removeListener: function(dataProviderListener) {
        var index = $.inArray(dataProviderListener, this.listeners);
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
    },
    
    removeAllListeners: function() {
        while(this.listeners.length > 0)
            this.listeners.pop();
    },
    
    disable: function() {
        this.enabled = false;
    },
    
    enable: function() {
        this.enabled = true;
    },
    
    /**
     * Add a data point configuration to our list
     * @return true if point was added, false if it already existed
     */
    addDataPoint: function(dataPointConfiguration) {
        if (!dataPointConfiguration)
            return false;
        var newPoint = this.toPoint(dataPointConfiguration);
        
        //We only allow adding a Data Point Configuration once
        for(var i=0; i<this.pointConfigurations.length; i++) {
            var point = this.toPoint(this.pointConfigurations[i]);
            
            if(point.xid == newPoint.xid)
                return false;
        }
        this.pointConfigurations.push(dataPointConfiguration);

        // ensures that next load() call actually loads
        delete this.previousOptions;

        return true;
    },
    
    /**
     * Enables data providers to use legacy pointConfigurations or just store plain points
     */
    toPoint: function(pointConfig) {
        return typeof pointConfig.xid === 'undefined' ? pointConfig.point : pointConfig;
    },
    
    addDataPoints: function(dataPointConfiguration) {
        for (var i in dataPointConfigurations) {
            this.addDataPoint(dataPointConfigurations[i]);
        }
    },
    
    changedOptions: function(a, b) {
        if (!a || !b) {
            return {
                    from: true,
                    to: true,
                    rollup: true,
                    timePeriodType: true,
                    timePeriods: true
            };
        }
        var result = {
            from: false,
            to: false,
            rollup: false,
            timePeriodType: false,
            timePeriods: false
        };
        if (!a.from || !b.from || a.from.valueOf() !== b.from.valueOf()) {
            result.from = true;
            result.fromValue = b.from;
        }
        if (!a.to || !b.to || a.to.valueOf() !== b.to.valueOf()) {
            result.to = true;
            result.toValue = b.to;
        }
        if (a.rollup !== b.rollup) {
            result.rollup = true;
            result.rollupValue = b.rollup;
        }
        if (a.timePeriodType !== b.timePeriodType) {
            result.timePeriodType = true;
            result.timePeriodTypeValue = b.timePeriodType;
        }
        if (a.timePeriods !== b.timePeriods) {
            result.timePeriods = true;
            result.timePeriodsValue = b.timePeriods;
        }
        return result;
    }
});

function rejectedPromise(reason, description) {
    var deferred = $.Deferred();
    deferred.reject(null, reason, description);
    return deferred.promise();
}

var providers = {};

DataProvider.registerProvider = function(provider) {
    providers[provider.prototype.type] = provider;
};

DataProvider.newProvider = function(type, id, options) {
    return new providers[type](id, options);
};

return DataProvider;

}); // close define