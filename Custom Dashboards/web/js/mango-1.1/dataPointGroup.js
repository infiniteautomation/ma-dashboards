/**
 * Javascript Objects Used for Grouping Data Points
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

define(['jquery'], function($) {
"use strict";

/**
 * Group Label 
 * @param id
 * @param label
 * @param options
 * @returns
 */
var GroupLabel = function(id, label, options){
    this.id = id;
    this.label = label;
    
    for(var i in options) {
        this[i] = options[i];
    }
};


var DataPointGroupConfiguration = function(options){
    
    this.groupBy = 'All'; //When grouping by All if no label set it will be 'All'
    
    for(var i in options) {
        this[i] = options[i];
    }
    //Ensure we at least have an empty array
    if(this.matchConfigurations === null)
        this.matchConfigurations = []; 
    
};

DataPointGroupConfiguration.prototype = {
       
    groupBy: null, //Options vary ['All', ... ... ...] see your Grouper for more info
    label: null, //Use directly for Group Label
    labelAttribute: null, //Optionally use a member to generate the label
    
    matchConfigurations: null //List of GroupMatchConfiguration
        
};

var GroupMatchConfiguration = function(matchAttribute, regex, options){
    this.matchAttribute = matchAttribute;
    this.regex = regex;
};

GroupMatchConfiguration.prototype = {
    matchAttribute: null,
    regex: null //Regex to match
};

/**
 * Group of Data Points
 * @param label
 * @param dataPoints
 * @param options
 * @returns
 */
var DataPointGroup = function(label, dataPoints, options){
    
    this.label = label;
    this.dataPoints = dataPoints;
    
    for(var i in options) {
        this[i] = options[i];
    }
};

DataPointGroup.prototype = {
        
        label: null, //Label for group
        dataPoints: null //The list of DataPoint 
        
        
};

//make the related sub types accessible through the returned type
//alternatively could make only visible internally or put them in separate files
DataPointGroup.GroupLabel = GroupLabel;
DataPointGroup.DataPointGroupConfiguration = DataPointGroupConfiguration;
DataPointGroup.GroupMatchConfiguration = GroupMatchConfiguration;

return DataPointGroup;

}); // close define
