/**
 * Javascript Object for the Configuring a Pie Chart
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */


/**
 * Pie Chart Configuration
 * @param divId
 * @param dataProviderIds
 * @param amChartMixin
 * @param mangoPieMixin
 * @param options
 * @returns
 */
PieChartConfiguration = function(divId, dataProviderIds, 
        amChartMixin, mangoPieMixin, options){
    this.divId = divId;
    this.amChartMixin = amChartMixin;
    this.mangoPieMixin = mangoPieMixin;
    this.dataProviderIds = dataProviderIds;
    
    for(var i in options) {
        this[i] = options[i];
    }

    this.configuration = $.extend(true, {}, this.getBaseConfiguration(), this.amChartMixin);
    //Ensure we have a data provider
    if(typeof this.configuration.dataProvider == 'undefined')
        this.configuration.dataProvider = [];
    
};

PieChartConfiguration.prototype = {
        divId: null, //Div of chart
        
        mangoPieMixin: null, //Any mixins for the MangoPie chart
        
        amChartMixin: null, //Any AmChart JSON configuration to override
        
        configuration: null, //The full config with mixin
       
        dataProviderIds: null, //List of my data provider ids
        
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
            var pie = new MangoPieChart(
                    AmCharts.makeChart(this.divId, this.configuration), 
                    this.dataProviderIds);
            return $.extend(true, {}, pie, this.mangoPieMixin);
        },
        
        
        /**
         * Return the base Serial Chart Configuration
         */
        getBaseConfiguration: function(){
            return  {                    
            type: "pie",
            theme: "none",
            valueField: "total",
            titleField: "name",
            balloonFunction: function(graphDataItem, text){
                if(typeof graphDataItem.value != 'undefined'){
                    return "<b>" + graphDataItem.title +  "</b><br>" + graphDataItem.value.toFixed(2) + " (" + graphDataItem.percents.toFixed(2) + "%)";
                }else{
                    return "";
                }
            },

            exportConfig:{    
                menuItems: [{
                icon: "/resources/amcharts/images/export.png",
                format: "png"   
                }]
            }
        };
     }
};

/**
 * Mango Pie Chart
 */
MangoPieChart = function(amChart, dataProviderIds, options){
    
    this.amChart = amChart;
    this.dataProviderIds = dataProviderIds;
    this.valueAttribute = 'value'; //Can override with options
    
    for(var i in options) {
        this[i] = options[i];
    }
};

MangoPieChart.prototype = {
        
        titleField: 'name', //Data Point Member to use for titles
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
         * Default action is to total per name
         * Data Provider Listener
         * On Data Provider load we add new data
         */
        onLoad: function(data, dataPoint){

            var total = 0;
            for(var i=0; i<data.length; i++){
                total += data[i][this.valueAttribute];
            }
            
            //Check to see if it already exists in the chart
            for(i=0; i<this.amChart.dataProvider.length; i++){
                if(this.amChart.dataProvider[i][this.titleField] == dataPoint[this.titleField]){
                    this.amChart.dataProvider[i].total = total;
                    this.amChart.validateData();
                    return; //Done
                }
            }
            //We didn't find our set, so add a brand new one
            var entry = {total: total};
            entry[this.titleField] = dataPoint[this.titleField];
            this.amChart.dataProvider.push(entry);
            this.amChart.validateData();        
      }
};