/**
 * Javascript Objects for the Displaying Data on HTML pages.  
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */


/**
 * Configuration for Serial Charts
 * @param divId
 * @param dataProviderIds
 * @param mixin
 * @param options
 * @returns
 */
SerialChartConfiguration = function(divId, dataProviderIds, amChartMixin, mangoChartMixin, options){
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
    if(typeof this.configuration.dataProvider == 'undefined')
        this.configuration.dataProvider = [];
    
};

/**
 * Serial Chart Config
 */
SerialChartConfiguration.prototype = {
        divId: null, //Div of chart
        
        amChartMixin: null, //Any AmChart JSON configuration to override
        
        mangoChartMixin: null, //Any Mango Serial Chart mixins
        
        configuration: null, //The full config with mixin
       
        dataProviderIds: null, //List of my data provider ids
        
        dataPointMappings: null, //List of Data Point Matching Items (not required)
        
        balloonFunction: function(graphDataItem, amGraph){
            if(typeof graphDataItem.values != 'undefined'){
                return graphDataItem.category + "<br>" + graphDataItem.values.value.toFixed(2);
            }else{
                return "";
            }
        },
        
        /**
         * Displaying Loading... on top of chart div
         */
        chartLoading: function(){
            $('#' + this.divId).html('<b>Loading Chart...</b>');
        },
        
        /**
         * Do the heavy lifting and create the item
         * @return AmChart created
         */
        createDisplay: function(){
            this.chartLoading();
            var serial = new MangoSerialChart(this.divId,
                    AmCharts.makeChart(this.divId, this.configuration), 
                    this.dataProviderIds, this.dataPointMappings);
            
            return $.extend(true, {}, serial, this.mangoChartMixin);
        },
        
        
        /**
         * Return the base Serial Chart Configuration
         */
        getBaseConfiguration: function(){
            return  {                    
            type: "serial",
            //Note the path to images
            pathToImages: "/resources/amcharts/images/",
            //Set to date field in result data
            categoryField: "timestamp",
            categoryAxis: {
                "minPeriod": "ss",
                "parseDates": true //TODO Fix this so we are sending in dates
            },
            chartCursor: {
                "categoryBalloonDateFormat": "JJ:NN:SS"
            },
            "chartScrollbar": {},
            "trendLines": [],
            "graphs": [],
            "guides": [],
            "valueAxes": [],
            "allLabels": [],
            "balloon": {},
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
            "titles": []
        };
     }
};


/**
 * Serial Chart Object
 * @param amChart
 * @param dataProviderIds
 * @param options
 * @returns
 */
MangoSerialChart = function(divId, amChart, dataProviderIds, dataPointMappings, options){
    
    this.divId = divId;
    this.amChart = amChart;
    this.dataProviderIds = dataProviderIds;
    this.valueAttribute = 'value'; //Can override with options
    this.dataPointMappings = dataPointMappings;
    
    for(var i in options) {
        this[i] = options[i];
    }
};

MangoSerialChart.prototype = {
        
        divId: null, //Div of chart
        seriesValueMapping: null, //Set to 'xid' or 'name' if using multiple series on a chart, otherwise default of 'value' is used
        
        
        
        /**
         * Using our map get the series value attribute
         * 
         * This currently only allows matching the data point to one attribute
         * we need to expand this to allow making multiple series from 1 Data Point
         * 
         * TODO Could use a combination of Data Point matching and matching on what 
         * attributes are in the data
         * 
         * @param dataPoint 
         */
        getSeriesValueAttribute: function(dataPoint, data){
            
            var dataValue;
            if(data.length > 0)
                dataValue = data[0];
            else
                dataValue = null;
            
            if(this.dataPointMappings !== null){
                for(var i=0; i<this.dataPointMappings.length; i++){
                    if(this.matchPoint(this.dataPointMappings[i], dataPoint, dataValue)){
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
        matchPoint: function(configuration, point, dataValue){
            var match = true;
            //Does this point match this template
            if(configuration.nameStartsWith){
                if(point.name.indexOf(configuration.nameStartsWith) === 0)
                    match = true;
                else
                    match = false;
            }
            if(configuration.nameEndsWith){
                if(point.name.indexOf(configuration.nameEndsWith, point.name.length - configuration.nameEndsWith.length) !== -1)
                    match = true;
                else
                    match = false;
            }
            if(configuration.xidStartsWith){
                if(point.xid.indexOf(configuration.xidStartsWith) === 0)
                    match = true;
                else
                    match = false;
            }
            if(configuration.xidEndsWith){
                if(point.xid.indexOf(configuration.xidEndsWith, point.xid.length - configuration.xidEndsWith.length) !== -1)
                    match = true;
                else
                    match = false;
            }
            
            //Match on the hasDataAttributes
            if(typeof configuration.hasDataAttributes != 'undefined'){
                for(var i=0; i<configuration.hasDataAttributes.length; i++){
                    if(typeof dataValue[configuration.hasDataAttributes[i]] == 'undefined'){
                        match = false;
                        break;
                    }
                }
                    
            }
            
            
            return match;
        },
        
        /**
         * Data Provider listener to clear data
         */
        onClear: function(){
            while(this.amChart.dataProvider.length >0){
                this.amChart.dataProvider.pop();
            }
            this.amChart.validateData();
        },
        
        /**
         * Data Provider Listener
         * On Data Provider load we add new data
         */
        onLoad: function(data, dataPoint){
            var entry, k;
            if(data.length === 0)
                return; //Nothing to do here
            
            //Get the member name to put the value against in the Series
            var seriesValueAttribute = this.getSeriesValueAttribute(dataPoint, data);
            
            //We cannot assume the data is in time order but it must be on the chart,
            // so we do extra work here to make sure things go into the data provider in
            // order.
            var dataProviderPos, newDataPos; 
            //Set the initial position
            if(this.amChart.dataProvider.length  > 0){
                newDataPos = 0; //Starting at first data entry
            }else{
                //No data so insert the first one so we can merge the rest
                entry = {};
                for(k in data[0])
                    entry[k] = data[0][k];
                entry[seriesValueAttribute] = data[0][this.valueAttribute];
                this.amChart.dataProvider.push(entry);
                newDataPos = 1; //Start after first piece of data
            }
            
            //Insert the data
            for(var i=newDataPos; i<data.length; i++){
                //Find the next location to insert
                var found = false;
                for(var j = 0; j<this.amChart.dataProvider.length; j++){
                    if(this.amChart.dataProvider[j].timestamp >= data[i].timestamp){
                        dataProviderPos = j;
                        found = true;
                        break;
                    }
                }
                
                //Append or splice
                if(!found){
                    //Insert at end
                    entry = {};
                    for(k in data[i])
                        entry[k] = data[i][k];
                    entry[seriesValueAttribute] = data[i][this.valueAttribute];
                    this.amChart.dataProvider.push(entry);
                }else{
                    if(this.amChart.dataProvider[dataProviderPos].timestamp == data[i].timestamp){
                        //Merge the new data value into the existing entry
                        this.amChart.dataProvider[dataProviderPos][seriesValueAttribute] = data[i][this.valueAttribute];
                    }else{
                        //Splice into array 
                        entry = {};
                        for(k in data[i])
                            entry[k] = data[i][k];
                        entry[seriesValueAttribute] = data[i][this.valueAttribute];
                        //Splice new data into array at the current dataProviderPos because its time is before
                        this.amChart.dataProvider.splice(dataProviderPos,0,entry);
                    } 
                }

            }
            this.amChart.validateData();
        }
};
