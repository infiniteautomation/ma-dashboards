/**
 * Javascript Object for the templating HTML pages.  
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

(function(factory) { // anonymous function
    // Support multiple module loading scenarios
    if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(['jquery', './dataProvider', './accumulatorDataProvider', './accumulatorRollupDataProvider',
                './historicalPointValueDataProvider', './pointValueDataProvider', './RealtimeDataProvider',
                './realtimePointValueDataProvider', './statisticsDataProvider'], factory);
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        this.DataDisplayManager = factory(jQuery, DataProvider);
    }
}(function($, DataProvider) { // factory function
"use strict";

/**
 * Data Display Manager
 * @param options
 * @returns
 */
var DataDisplayManager = function(displayConfigurations, options){
    
    this.displayConfigurations = displayConfigurations;
    this.dataProviderConfigurations = [];
    
    this.dataProviders = [];
    this.displays = [];
    
    this.errorDivId = "errors";
    
    for(var i in options) {
        this[i] = options[i];
    }
    
    if(!this.displayConfigurations)
        this.displayConfigurations = [];
    else{
        for(i=0; i<this.displayConfigurations.length; i++){
            this.displays.push(this.displayConfigurations[i].createDisplay());
        }
    }
};

DataDisplayManager.prototype = {
        displayConfigurations: null, //List of all display widget configuration
        dataProviderConfigurations: null, //List of data provider configurations
        
        displays: null, //List of our displays
        dataProviders: null, //List of all our data providers
        errorDivId: null, //Div to place error messages

        /**
         *  @param displayConfiguration - config to use
         *  @param createDisplay - optional boolean to create the object
         */
        addDisplayConfiguration: function(displayConfiguration){
            //Add a display configuration 
            var display = displayConfiguration.createDisplay();
            this.displays.push(display);
            this.displayConfigurations.push(displayConfiguration);
            this.registerWithDataProviders(display);
        },
        
        addProvider: function(dataProvider){
            this.dataProviders.push(dataProvider);
            //Search our displays to find who wants to listen
            this.registerWithDisplays(dataProvider);
        },
        
        clearProviders: function(){
            while(this.dataProviders.length >0)
                this.dataProviders.pop(); //Empty out array
        },
        
        /**
         * Finds an existing provider which matches an array of DataPointConfigurations
         * or creates a new provider and returns its id
         * 
         * @param dataPointConfigurations - array of DataPointConfiguration
         * @returns a providerId
         */
        findOrCreateProvider: function(dataPointConfigurations) {
            for (var i = 0; i < this.dataProviders.length; i++) {
                var provider = this.dataProviders[i];
                if (this.comparePointConfigs(dataPointConfigurations, provider.pointConfigurations)) {
                    return provider.id;
                }
            }
            
            return this.addDataPointConfigurations(dataPointConfigurations);
        },
        
        /**
         * Compares two DataPointConfiguration arrays
         * 
         * @param array1
         * @param array2
         * @returns true if equivalent
         */
        comparePointConfigs: function(array1, array2) {
            if (array1.length !== array2.length)
                return false;
            
            for (var i = 0; i < array1.length; i++) {
                var config1 = array1[i];
                var foundConfig1 = false;
                for (var j = 0; j < array2.length; j++) {
                    var config2 = array2[j];
                    if (config1.point.xid == config2.point.xid &&
                            config1.providerType == config2.providerType) {
                        foundConfig1 = true;
                        break;
                    }
                }
                if (!foundConfig1)
                    return false;
            }
            return true;
        },
        
        /**
         * Add multiple data point configurations under the same providerId
         * Do not use if you want multiple providers or different provider types
         * 
         * @param dataPointConfigurations - array of data point configurations
         */
        addDataPointConfigurations: function(dataPointConfigurations) {
            if (dataPointConfigurations.length <= 0) {
                return;
            }
            
            var providerId = this.addDataPointConfiguration(dataPointConfigurations[0]);
            for (var i = 1; i < dataPointConfigurations.length; i++) {
                dataPointConfigurations[i].providerId = providerId;
                this.addDataPointConfiguration(dataPointConfigurations[i]);
            }
            return providerId;
        },
        
        /**
         * Using a point and a configuration create or find an existing data provider
         * @param dataPointConfiguration - data point configuration
         */
        addDataPointConfiguration: function(dataPointConfiguration){
            var dataProvider; 
            if(dataPointConfiguration.providerId !== null){
                //Find it in the list
                for(var i=0; i<this.dataProviders.length; i++){
                    if(this.dataProviders[i].id == dataPointConfiguration.providerId){
                        this.dataProviders[i].addDataPoint(dataPointConfiguration);
                        return this.dataProviders[i].id;
                    }
                }
                
            }else{
                //Assign an id
                dataPointConfiguration.providerId = this.dataProviders.length;
            }
            
            //None found, provider Id is set
            dataProvider = DataProvider.newProvider(dataPointConfiguration.providerType + 'DataProvider',
                    dataPointConfiguration.providerId);
            
            //Add the point configuration
            dataProvider.addDataPoint(dataPointConfiguration);
            //Search our displays to find who wants to listen
            this.addProvider(dataProvider);
            
            return dataPointConfiguration.providerId;
        },
        
        /**
         * Register a data provider with any displays that have it as one of
         * its dataProviderIds
         * @param dataProvider
         * @returns
         */
        registerWithDisplays: function(dataProvider){
            //Search our displays and add them as listeners to the data provider
            for(var i=0; i<this.displays.length; i++){
                if($.inArray(dataProvider.id, this.displays[i].dataProviderIds) >= 0){
                    dataProvider.addListener(this.displays[i]);
                }
            }
        },
        
        /**
         * @param dataProviderListener
         */
        registerWithDataProviders: function(dataProviderListener){
            //Search our providers and add the listener
            for(var i=0; i<this.dataProviders.length; i++){
                if ($.inArray(this.dataProviders[i].id, dataProviderListener.dataProviderIds) >= 0){
                    this.dataProviders[i].addListener(dataProviderListener);
                }
            }
        },
        
        /**
         * Signal to data providers to clear data
         * 
         * @param clearConfigurations - boolean to indicate we need to drop point configurations too
         * @param ids - array of integers indicating which data providerIDs to signal to clear 
         */
        clear: function(clearConfigurations, ids){
            if((typeof ids == 'undefined')||(ids === null)){
                for(var i=0; i<this.dataProviders.length; i++){
                     this.dataProviders[i].clear(clearConfigurations);
                }
            }else{
                //We have Args
                for(var j=0; j<this.dataProviders.length; j++){
                    if($.inArray(this.dataProviders[j].id, ids) >= 0){
                         this.dataProviders[j].clear(clearConfigurations);
                    }
                }
            }
        },
        
        /**
         * Refresh data providers with IDs (or if not defined then all)
         */
        refresh: function(ids, options){
            if((typeof ids == 'undefined')||(ids === null)){
                for(var i=0; i<this.dataProviders.length; i++){
                    this.dataProviders[i].load(options, this.error);
                }
            }else{
                //We have Args
                for(var j=0; j<this.dataProviders.length; j++){
                    if($.inArray(this.dataProviders[j].id, ids) >= 0){
                        this.dataProviders[j].load(options, this.error);
                    }
                }
            }
        },
        
        /**
         * Force an AmCharts Re-size
         * @param divIds - Array of String div ids
         * @param displayManager - manager for displays
         */
        invalidateChartSize: function(divIds, displayManager){
            //Refresh the am chart for all divIds
            for(var i=0; i<displayManager.displays.length; i++){
                var display = displayManager.displays[i];
                if($.inArray(display.divId, divIds) >= 0){
                   //Invlidate the chart size
                   display.amChart.invalidateSize();
               }
            }

        },
        
        
        /**
         * Helper Function to show error messages
         * Override to use different format or divId than 'errors'
         */
        error: function(jqXHR, textStatus, errorThrown, mangoMessage, errorDivId){
            
            var msg = "";
            if(textStatus !== null)
                msg += (textStatus + " ");
            if(errorThrown !== null)
                msg += (errorThrown + " ");
            if(mangoMessage !== null)
                msg += (mangoMessage + " ");
            msg += "\n";
            $("#errors").text(msg);
        }
        
};


return DataDisplayManager;

})); // close factory function and execute anonymous function
