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
        this.HistoricalPointValueDataProvider = factory(jQuery, DataProvider, mangoRest);
    }
}(function($, DataProvider, mangoRest) { // factory function

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
        return mangoRest.pointValues.getLatest(point.xid, options.historicalSamples);
    },

    /**
     * Put Point Value 
     * @param options {
     *                  refresh: boolean to refresh displays,
     *                  value: PointValueTime Model
     *                 }
     * 
     * @param error - function(jqXHR, textStatus, errorThrown, mangoMessage)
     * @return promise
     */
    put: function(options, error){

        //We will keep the requests in order by using a Deferred Chain
        var link = $.Deferred();
        var promise = link.promise();

        var self = this;
        $.each(this.pointConfigurations, function(i, configuration){
            //Form Chain
            promise = promise.then(function(){
                //Define the options to use within the done callback
                var callbackOptions = {
                        refresh: options.refresh, //Refresh?
                        configuration: configuration, //Configuration to use
                        listeners: self.listeners //Listeners to fire
                }; 
                return mangoRest.pointValues.put(configuration.point.xid,
                        options.value,
                        function(pvt, xid, options){

                    if(options.refresh){
                        var data = [];
                        data.push(pvt);
                        //Inform our listeners of this new data
                        for(var i=0; i<options.listeners.length; i++){
                            options.listeners[i].onLoad(data, options.configuration.point);
                        }
                    }
                },error, callbackOptions);                    
            });
        });
        //Resolve the Deferred and start the Chain
        link.resolve();
        //Return the final promise that will be resolved when done
        return promise;
    }
});

DataProvider.registerProvider(HistoricalPointValueDataProvider);
return HistoricalPointValueDataProvider;

})); // close factory function and execute anonymous function