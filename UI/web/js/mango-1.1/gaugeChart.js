/**
 * Javascript Object for the Configuring a Gauge Chart
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

define(['jquery'], function($) {
"use strict";

/**
 * Gauge Chart Configuration
 * @param divId
 * @param dataProviderIds
 * @param amChartMixin
 * @param mangoChartMixin
 * @param options
 * @returns
 */
var GaugeChartConfiguration = function(divId, dataProviderIds, 
        amChartMixin, mangoChartMixin, options){
    this.divId = divId;
    this.amChartMixin = amChartMixin;
    this.mangoChartMixin = mangoChartMixin;
    this.dataProviderIds = dataProviderIds;
    
    for(var i in options) {
        this[i] = options[i];
    }

    this.configuration = $.extend(true, {}, this.getBaseConfiguration(), this.amChartMixin);
    //Ensure we have a data provider
    if(typeof this.configuration.dataProvider == 'undefined')
        this.configuration.dataProvider = [];
    
};

GaugeChartConfiguration.prototype = {
        divId: null, //Div of chart
        
        mangoChartMixin: null, //Any mixins for the MangoPie chart
        
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
            var chart = new MangoGaugeChart(
                    AmCharts.makeChart(this.divId, this.configuration), 
                    this.dataProviderIds);
            return $.extend(true, {}, chart, this.mangoChartMixin);
        },
        
        
        /**
         * Return the base Serial Chart Configuration
         */
        getBaseConfiguration: function(){
            return  {                    
                "type": "gauge",
                "pathToImages": "/modules/dashboards/web/js/amcharts/images/",
                "marginBottom": 20,
                "marginTop": 40,
                "startDuration": 0,
                "fontSize": 13,
                "theme": "dark",
                "arrows": [
                    {
                        "id": "GaugeArrow-1",
                        "value": 0
                    }
                ],
                "axes": [
                    {
                        "axisThickness": 1,
                        "bottomText": "",
                        "bottomTextYOffset": -20,
                        "endValue": 220,
                        "id": "GaugeAxis-1",
                        "valueInterval": 10,
                        "bands": [
                            {
                                "alpha": 0.7,
                                "color": "#00CC00",
                                "endValue": 90,
                                "id": "GaugeBand-1",
                                "startValue": 0
                            },
                            {
                                "alpha": 0.7,
                                "color": "#ffac29",
                                "endValue": 130,
                                "id": "GaugeBand-2",
                                "startValue": 90
                            },
                            {
                                "alpha": 0.7,
                                "color": "#ea3838",
                                "endValue": 220,
                                "id": "GaugeBand-3",
                                "innerRadius": "95%",
                                "startValue": 130
                            }
                        ]
                    }
                ],
                "allLabels": [],
                "balloon": {},
                "titles": []
        };
     }
};

/**
 * Mango Gauge Chart
 */
var MangoGaugeChart = function(amChart, dataProviderIds, options){
    
    this.amChart = amChart;
    this.dataProviderIds = dataProviderIds;
    this.valueAttribute = 'value'; //Can override with options
    
    for(var i in options) {
        this[i] = options[i];
    }
};

MangoGaugeChart.prototype = {
        
        /**
         * Render the value for the gauge
         * @param value
         * @returns
         */
        renderValue: function(dataItem){
            return dataItem[this.valueAttribute].toFixed(2);
        },
        
        /**
         * Data Provider listener to clear data
         */
        onClear: function(){
            this.amChart.arrows[0].setValue(0);
            this.amChart.axes[0].setBottomText("");
            this.amChart.validateData();   
        },
        
        /**
         * Data Provider Listener
         * On Data Provider load we add new data
         */
        onLoad: function(data, dataPoint){
            if ($.isArray(data)) {
                data = data[0];
            }
            
            this.amChart.arrows[0].setValue(data[this.valueAttribute]);
            this.amChart.axes[0].setBottomText(this.renderValue(data));
            this.amChart.validateData();        
      }
};

//make the related sub types accessible through the returned type
//alternatively could make only visible internally or put them in separate files
GaugeChartConfiguration.MangoGaugeChart = MangoGaugeChart;

return GaugeChartConfiguration;

}); // close define
