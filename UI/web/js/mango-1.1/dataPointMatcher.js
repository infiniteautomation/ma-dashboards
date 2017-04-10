/**
 * Javascript Object for the Matching Data Points from a list.  
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

define(['jquery'], function($) {
"use strict";

/**
 * Used for matching
 */
var DataPointMatchConfiguration = function(providerId, matchConfigurations, options){
    this.providerId = providerId;
    this.providerType = 'PointValue';
    this.matchConfigurations = matchConfigurations;
    
    for(var i in options) {
        this[i] = options[i];
    }
    if((typeof this.matchConfigurations == 'undefined')||(this.matchConfigurations === null)){
        this.matchConfigurations = [];
    }
    
};

DataPointMatchConfiguration.prototype = {
        matchConfigurations: null, //Array of PointMatchConfigurations

        timeAttribute: null, //Leave null to use timestamp
        valueAttribute: null, //Leave null to use matched point xid
        
        providerId: null,
        providerType: null, //['PointValue', 'Statistics']

        /**
         * Operation for getting a Value
         */
        valueOperation: function(processedData, pvt, xid){
            return pvt.value.toFixed(2);
        },
        /**
         * Operation for getting the time
         */
        timeOperation: function(processedData, pvt, xid){
            return pvt.timestamp;
        }
};

var PointMatchConfiguration = function(matchAttribute, regex, options){
    this.matchAttribute = matchAttribute;
    this.regex = regex;
};

PointMatchConfiguration.prototype = {
    matchAttribute: null,
    regex: null //Regex to match
};


/**
 * Data Point Configuration Uses a data point
 * and matches to a provider Id
 * @param point
 * @param providerId
 * @param options
 * @returns
 */
var DataPointConfiguration = function(point, providerId, providerType, options){
    this.point = point;
    this.providerId = providerId;
    this.providerType = providerType; 
    
    for(var i in options) {
        this[i] = options[i];
    }
};

DataPointConfiguration.prototype = {
        point: null, //Data Point
        providerId: null, //Data Provider ID to add this to
        providerType: null //Data Provider Type ['PointValue', 'Statistcs']
};

/**
 * The Mango Data Point Matcher will match points to their configurations
 * 
 * @param options
 */
var DataPointMatcher = function(options) {
    for(var i in options) {
        this[i] = options[i];
    }
};

/**
 * Match one point to one configuration.  If no matching attributes are set,
 * a match is assumed.
 * 
 * If more than one matching attribute is in the configuration they must all match.
 * 
 * @param point - data point
 * @param configuration - point configuration
 * @return - true if match, false if not
 */
DataPointMatcher.matchPointToConfiguration = function(point, configuration) {
    //Does this point match this template
    for(var i=0; i<configuration.matchConfigurations.length; i++){
        var matchConfig = configuration.matchConfigurations[i];
        if(point[matchConfig.matchAttribute].match(matchConfig.regex) === null)
            return false;
    }
    return true;
};

DataPointMatcher.prototype = {
        matchConfigurations: null,
        dataPoints: null,
        matchAll: true, //Use all points that match a point configuration (or use first match)
        
        matchConfigs: function(configurations) {
            return this.match(configurations, this.dataPoints);
        },
        
        matchDataPoints: function(dataPoints) {
            return this.match(this.matchConfigurations, dataPoints);
        },
        
        /**
         * Match each configuration to as many points as possible.  Then
         * return the list of DataPointConfiguration
         * 
         * @param configurations
         * @param dataPoints
         * @return - List of DataPointConfigurations
         */
        match: function(first, second) {
            if (first && !$.isArray(first))
                first = [first];
            if (second && !$.isArray(second))
                second = [second];
            
            var dataPoints, configurations;
            if (typeof first[0].matchConfigurations !== 'undefined') {
                configurations = first;
                dataPoints = second || this.dataPoints;
            }
            else {
                dataPoints = first;
                configurations = second || this.matchConfigurations;
            }
            
            var matchedConfigurations = [];
            for (var i = 0; i < configurations.length; i++) {
                var configuration = configurations[i];
                for (var j = 0; j < dataPoints.length; j++) {
                    var point = dataPoints[j];
                    if (DataPointMatcher.matchPointToConfiguration(point, configuration)) {
                        //Matched, create/add to data provider
                        var dataPointConfiguration = new DataPointConfiguration(point, configuration.providerId, configuration.providerType);
                        matchedConfigurations.push(dataPointConfiguration);
                        if (!this.matchAll)
                            break; //Break out if we are not matching all
                    }
                }
            }
            return matchedConfigurations;
        }
};

// make the related sub types accessible through the returned type
// alternatively could make only visible internally or put them in separate files
DataPointMatcher.DataPointMatchConfiguration = DataPointMatchConfiguration;
DataPointMatcher.PointMatchConfiguration = PointMatchConfiguration;
DataPointMatcher.DataPointConfiguration = DataPointConfiguration;

return DataPointMatcher;

}); // close define
