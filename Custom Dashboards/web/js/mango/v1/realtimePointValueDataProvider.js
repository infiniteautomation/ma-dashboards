/**
 * Javascript Objects for the Providing Data on HTML pages.  
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 * @deprecated
 */

if (window.console) console.log('This file is deprecated. Please use RealtimeDataProvider.js instead.');

(function(factory) { // anonymous function
    // Support multiple module loading scenarios
    if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(['jquery', './dataProvider', './mangoApi'], factory);
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        this.RealtimePointValueDataProvider = factory(jQuery, DataProvider, mangoRest);
    }
}(function($, DataProvider, mangoRest) { // factory function

var RealtimePointValueDataProvider = DataProvider.extend({
    /**
     * Data Provider constructor
     * @param id
     * @param options
     * @returns
     */
    constructor: function(id, options) {
        this.socketMap = {};
        DataProvider.apply(this, arguments);
    },

    type: 'RealtimePointValueDataProvider',
    socketMap: null, //Map of sockets to xids
    loadMostRecent: true, //Load most recent 1 sample

    /**
     * Clear out our pointConfigurations if required
     * 
     * Signal to all Listeners to clear ALL their data
     * 
     * @param clearConfigurations - boolean to clear pointConfigurations too
     */
    clear: function(clearConfigurations) {
        var self = this;

        if(clearConfigurations) {
            $.each(this.socketMap, function(xid, socket) {
                self.unregisterPoint(xid);
            });
        }
        
        DataProvider.prototype.clear.apply(this, arguments);
    },

    needsToLoad: function(changedOptions) {
        // never need to reload as its continually updated
        if (this.previousOptions)
            return false;
        return true;
    },
    
    loadPoint: function(point, options) {
        return mangoRest.pointValues.getLatest(point.xid, 1);
    },

    disable: function() {
        var self = this;
        $.each(this.socketMap, function(xid, socket) {
            self.unregisterPoint(xid);
        });
        
        DataProvider.prototype.disable.apply(this, arguments);
    },

    enable: function() {
        var self = this;
        $.each(this.pointConfigurations, function(key, pointConfig) {
            self.registerPoint(pointConfig.point.xid);
        });
        
        DataProvider.prototype.enable.apply(this, arguments);
    },

    /**
     * Add a data point configuration to our list
     */
    addDataPoint: function(dataPointConfiguration) {
        DataProvider.prototype.addDataPoint.apply(this, arguments);
        
        if (!dataPointConfiguration)
            return;
        
        if (this.enabled)
            this.registerPoint(dataPointConfiguration.point.xid); //Register for events
    },

    /**
     * Register a point with XID to a WebSocket
     * @param xid - String xid of point
     * @return socket
     */
    registerPoint: function(xid){
        //Don't allow registering for a data point More than once
        var socket = this.socketMap[xid];
        if (socket)
            return socket;

        var self = this;
        socket = mangoRest.pointValues.registerForEvents(xid, ['UPDATE'], function(message) {
            //On Message Received Method
            if(message.status == 'OK'){
                for(var x=0; x<self.pointConfigurations.length; x++){
                    var point = self.pointConfigurations[x].point;
                    if (point.xid == xid) {
                        self.notifyListeners([message.payload.value], point);
                    }
                }
            }else{
                self.error(message.payload.type + " - " + message.payload.message);
            }
        },function(error){ //On Error Method
            self.error(error);
        },function(){ //On Open Method
            //document.getElementById('errors').innerHTML = '';
        },function(){ //On Close Method
            //document.getElementById('errors').innerHTML = '';
        });
        this.socketMap[xid] = socket;

        return socket;
    },

    unregisterPoint: function(xid) {
        var socket = this.socketMap[xid];
        socket.close();
        delete this.socketMap[xid];
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

DataProvider.registerProvider(RealtimePointValueDataProvider);
return RealtimePointValueDataProvider;

})); // close factory function and execute anonymous function