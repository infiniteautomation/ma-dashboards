/**
 * Javascript Objects for the Displaying Data on HTML pages.  
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

(function(factory) { // anonymous function
    // Support multiple module loading scenarios
    if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(['jquery', 'amcharts/serial'], factory);
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        this.BarChartConfiguration = factory(jQuery);
    }
}(function($) { // factory function
"use strict";

/**
 * Configuration for Bar Charts
 * @param divId
 * @param dataProviderIds
 * @param mixin
 * @param options
 * @returns
 */
var BarChartConfiguration = function(divId, dataProviderIds, amChartMixin, mangoChartMixin, options){
    this.divId = divId;
    this.amChartMixin = amChartMixin;
    this.mangoChartMixin = mangoChartMixin;
    this.dataProviderIds = dataProviderIds;
    
    for(var i in options) {
        this[i] = options[i];
    }

    this.configuration = $.extend(true, {}, this.getBaseConfiguration(), this.amChartMixin);
    
    //Ensure we have a balloon function
    for(i=0; i<this.configuration.graphs.length; i++){
        if(typeof this.configuration.graphs[i].balloonFunction == 'undefined')
            this.configuration.graphs[i].balloonFunction = this.balloonFunction;
    }
    
    //Ensure we have a data provider
    if(typeof this.configuration.dataProvider === 'undefined')
        this.configuration.dataProvider = [];
};

/**
 * Bar Chart Config
 */
BarChartConfiguration.prototype = {
        divId: null, //Div of chart
        amChartMixin: null, //Any AmChart JSON configuration to override
        mangoChartMixin: null, //Any Mango Serial Chart mixins
        configuration: null, //The full config with mixin
        dataProviderIds: null, //List of my data provider ids
        dataPointMappings: null, //List of Data Point Matching Items (not required)
        
        balloonFunction: function(graphDataItem, amGraph){
            if(typeof graphDataItem.values === 'undefined')
                return '';
            
            var label =  graphDataItem.category + "<br>" +
                graphDataItem.values.value.toFixed(2);
            if (amGraph.unit) {
                label += ' ' + amGraph.unit;
            }
            return label;
        },
        
        /**
         * Do the heavy lifting and create the item
         * @return AmChart created
         */
        createDisplay: function(){
            var serial = new MangoBarChart(this.divId, 
                    AmCharts.makeChart(this.divId, this.configuration), 
                    this.dataProviderIds, this.dataPointMappings);
            
            return $.extend(true, {}, serial, this.mangoChartMixin);
        },
        
        
        /**
         * Return the base Serial Chart Configuration
         */
        getBaseConfiguration: function(){
            return  {
            addClassNames: true,
            type: "serial",
            //Note the path to images
            pathToImages: "/resources/amcharts/images/",
            //Set to date field in result data
            categoryField: "xid",
            rotate: true,
            startDuration: 1,
            categoryAxis: {
                gridPosition: "start",
                position: "left"
            },
            trendLines: [],
            chartCursor: {},
            chartScrollbar: {},
            graphs: [],
            guides: [],
            valueAxes: [],
            allLabels: [],
            balloon: {},
            legend: {
                useGraphSettings: true,
                /**
                 * Method to render the Legend Values better
                 */
                valueFunction: function(graphDataItem){
                    if(typeof graphDataItem.values != 'undefined')
                        if(typeof graphDataItem.values.value != 'undefined')
                            return graphDataItem.values.value.toFixed(2);
                    
                    return ""; //Otherwise nada
                }
            },
            titles: []
        };
     }
};


/**
 * Bar Chart Object
 * @param amChart
 * @param dataProviderIds
 * @param options
 * @returns
 */
var MangoBarChart = function(divId, amChart, dataProviderIds, dataPointMappings, options){
    this.divId = divId;
    this.amChart = amChart;
    this.dataProviderIds = dataProviderIds;
    this.categoryField = 'xid'; //How to separate Categories
    this.dataPointMappings = dataPointMappings;
    
    for(var i in options) {
        this[i] = options[i];
    }
};

MangoBarChart.prototype = {
        
        divId: null,
        seriesValueMapping: null, //Set to 'xid' or 'name' if using multiple series on a chart, otherwise default of 'value' is used
        /**
         * Using our map get the series value attribute
         * 
         * @param dataPoint 
         */
        getSeriesValueAttribute: function(dataPoint){
            
            if(this.dataPointMappings !== null){
                for(var i=0; i<this.dataPointMappings.length; i++){
                    if(this.matchPoint(this.dataPointMappings[i], dataPoint)){
                        return this.dataPointMappings[i].valueField;
                    }
                }
            }else{
                if(this.seriesValueMapping === null)
                    return 'value';
                else{
                    return dataPoint[this.seriesValueMapping];
                }                
            }

        },
        
        /**
         * Check to see if our data point matches this mapping
         */
        matchPoint: function(configuration, point){
            var match = true;
            //Does this point match this template
            if(configuration.nameStartsWith !== null){
                if(point.name.indexOf(configuration.nameStartsWith) === 0)
                    match = true;
                else
                    match = false;
            }
            if(configuration.nameEndsWith !== null){
                if(point.name.indexOf(configuration.nameEndsWith, point.name.length - configuration.nameEndsWith.length) !== -1)
                    match = true;
                else
                    match = false;
            }
            if(configuration.xidStartsWith !== null){
                if(point.xid.indexOf(configuration.xidStartsWith) === 0)
                    match = true;
                else
                    match = false;
            }
            if(configuration.xidEndsWith !== null){
                if(point.xid.indexOf(configuration.xidEndsWith, point.xid.length - configuration.xidEndsWith.length) !== -1)
                    match = true;
                else
                    match = false;
            }
            return match;
        },
        
        /**
         * Displaying Loading... on top of chart div
         */
        loading: function() {
            if ($('#' + this.divId).find('div.loading').length > 0)
                return;
            var loadingDiv = $('<div>');
            loadingDiv.addClass('loading');
            loadingDiv.text('Loading Chart...');
            $('#' + this.divId).prepend(loadingDiv);
        },
        
        removeLoading: function() {
            $('#' + this.divId).find('div.loading').remove();
        },
        
        /**
         * Data Provider listener to clear data
         */
        onClear: function(){
            this.removeLoading();
            
            while(this.amChart.dataProvider.length >0){
                this.amChart.dataProvider.pop();
            }
            this.amChart.validateData();
        },
        
        /**
         * Default behaviour is to average them values
         * Data Provider Listener
         * On Data Provider load we add new data
         */
        onLoad: function(data, dataPoint){
            this.removeLoading();
            
            //Get the member name to put the value against in the Series
            var seriesValueAttribute = this.getSeriesValueAttribute(dataPoint);
            var total = 0;
            //Simply total up the values
            for(var i=0; i<data.length; i++){
                total = total + data[i].value;
            }
            total = total / i;
            //Create one entry per Data Point
            var entry = {};
            entry[seriesValueAttribute] = total;
            entry[this.categoryField] = dataPoint[this.categoryField];
            this.amChart.dataProvider.push(entry);
        },
        
        redraw: function() {
            this.amChart.validateData();
        }
};

return BarChartConfiguration;

})); // close factory function and execute anonymous function
