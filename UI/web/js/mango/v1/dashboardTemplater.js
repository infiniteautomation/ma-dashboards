/**
*
* This is the Templeater aka the thing that ties the all the other imporant modlues togeather. 
* a Simple DashboardTemplater Would look something like this
*
* Copyright (C) 2014 Infinite Automation Software. All rights reserved.
* Terry Packer (implamentation)
* Joseph Mills (documention)
*
*
     * Simple Example
     *
     *     @example
     *     var templaterConfig = {
     *         debug: true,
     *         type: 'PointHierarchy',
     *         displayConfigurations: displayConfigurations,
     *         pointConfigurations: pointConfigurations,
     *         groupConfigurations: groupConfigurations,
     *         dataProviders: dataProviders,
     *         groupSelectConfiguration: groupListView,
     *     }
     *     templater = new DashboardTemplater(templaterConfig);
     *
*
* Lets say that we want to take in custom objects on are query to the Mango backend. 
* If one would want to do such a thing they can. Here  is a example of using Custom Input to a Templater, 
* for setting the time to be one month from 24 hours ago see line's
*
     * Custom Templater
     *
     *     @example
     *     var to = new Date();
     *     var from = new Date(to.getTime() - 1000*60*60*24*30);
     *     var templaterCustomConfig = {
     *     debug: true,
     *     displayConfigurations: displayConfigurations,
     *     pointConfigurations: pointConfigurations,
     *     groupConfigurations: groupConfigurations,
     *     dataProviders: dataProviders,
     *     groupSelectConfiguration: groupListView,
     *     //grouper
     *     startDate: from, //adding the custom option of startDate and adding the varible that we defined above. 
     *     endDate: to, // adding the too varible to the custom options
     *     rollup: 'AVERAGE',
     *     timePeriods: 1,
     *     }
     *     var templaterCustom  = new DashboardTemplater(templaterCustomConfig);
     *
*
* Adding more then One Templeater
*
* TODO after terry fixes this I will document this.  
*
*
*
*@param {Boolean} debug Make sure that the templeate for the Widget is in debug mode.  This is handy when wondering why a widget is not working
*
*@param {String} type DOCME
*
*@param {String} dataDisplayManager This is the connecting peice to you Display Manger. If you would like to read more about the display manager please vist <a
* src="#">This Help Page</a>
*
*@param {String} pointConfigurations This is the main point Configuration That one would assign 
* tpo many points or just single points in the mango 
* system
* If you would like to read more about the pointConfigurations please vist <a src="#">This Help Page</a>
*
*@param {String} groupConfigurations This is the main grouper that one is using to group points to the 
* display system and pass them off to the Matcher
* If you would like to read more about the Groups and there configuration  please vist {@link Man#groupConfigurations This Help Page}
*
*@param {String} groupSelectConfiguration this is the main ui piece that one is going to use with the grouped data. 
*
*
* Optional Custom Inputs:
*  
*@param {String} Rollup Drop Down
*@param {String} Time Period Drop Down
*@param {String} Periods Input
* 
*@param {Date} startDatePicker
*@param {Date} endDatePicker
* 
*
*/

(function(factory) { // anonymous function
    // Support multiple module loading scenarios
    if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(['jquery', './select', './dateTimePicker', './rollupPicker',
                './timePeriodTypePicker', './input', './dataDisplayManager',
                './dataPointMatcher', './mangoApi', './pointHierarchyGrouper'], factory);
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        this.DashboardTemplater = factory(jQuery, SelectConfiguration, DateTimePickerConfiguration,
                RollupConfiguration, TimePeriodTypeConfiguration, InputConfiguration, DataDisplayManager,
                DataPointMatcher, mangoRest, PointHierarchyGrouper);
    }
}(function($, SelectConfiguration, DateTimePickerConfiguration, RollupConfiguration,
        TimePeriodTypeConfiguration, InputConfiguration, DataDisplayManager, DataPointMatcher,
        mangoRest, PointHierarchyGrouper) { // factory function
"use strict";

var DashboardTemplater = function(options){
    for(var i in options) {
        this[i] = options[i];
    }
    
    //Ensure we have arrays for all important items
    if(this.displayConfigurations === null)
        this.displayConfigurations = [];
    if(this.pointConfigurations === null)
        this.pointConfigurations = [];
    if(this.groupConfigurations === null)
        this.groupConfigurations = [];
    if(this.groups === null)
        this.groups = [];
    
    if(this.endDate === null)
        this.endDate = new Date();
    if(this.startDate === null)
        this.startDate = new Date(this.endDate.getTime() - 1000*60*60*12); //12Hr
    if(this.rollup === null)
        this.rollup = 'AVERAGE';
    if(this.timePeriodType === null)
        this.timePeriodType = 'HOURS';
    if(this.timePeriods === null)
        this.timePeriods = 1;
    if(this.historicalSamples === null)
        this.historicalSamples = 10; //Default to 10 Historical Samples
    
    // bind call backs to this object
    // use Function.prototype.bind() if supported otherwise use jQuery.proxy()
    var useBind = typeof Function.prototype.bind == 'function';
    for (var prop in this) {
        if (typeof this[prop] == 'function') {
            this[prop] = useBind ? this[prop].bind(this) : $.proxy(this[prop], this);
        }
    }
    
    var self = this; //Save a reference for our actions
    
    //Setup the Inputs
    if(!this.customPeriodConfiguration){
        this.customPeriodConfiguration = new SelectConfiguration('customPeriodSelect', 
                {options: [
                           {label: 'Today', value: "0"},
                           {label: '7 Days', value: "1"},
                           {label: '30 Days', value: "2"},
                           {label: 'This Year', value: "3"}
                           ]
                },{onChange: this.customPeriodChanged}
                );
    }else{
        if(this.customPeriodConfiguration.onChange === null)
            this.customPeriodConfiguration.onChange = this.startDateChanged;
    } 
    this.customPeriodConfiguration.create();
    
    //Start Date Picker
    if(this.startDateConfiguration === null)
        this.startDateConfiguration = new DateTimePickerConfiguration('startDate', {}, {defaultValue: this.startDate, onChange: this.startDateChanged});
    else{
        this.startDateConfiguration.onChange = this.startDateChanged;
    } 
    this.startDateConfiguration.create();
    
    //Create End Date
    if(this.endDateConfiguration === null)
        this.endDateConfiguration = new DateTimePickerConfiguration('endDate', {}, {defaultValue: this.endDate, onChange: this.endDateChanged});
    else{
        this.endDateConfiguration.onChange = this.endDateChanged;
    } 
    this.endDateConfiguration.create();
    
    if(this.rollupConfiguration === null)
        this.rollupConfiguration = new RollupConfiguration('rollup', {}, {onChange: this.rollupChanged, selected: 0});
    else{
        this.rollupConfiguration.onChange = this.rollupChanged;
    }    
    this.rollupConfiguration.create();
    
    if(this.timePeriodTypeConfiguration === null)
        this.timePeriodTypeConfiguration = new TimePeriodTypeConfiguration('timePeriodType', {}, {onChange: this.timePeriodTypeChanged, selected: 1});
    else{
        this.timePeriodTypeConfiguration.onChange = this.timePeriodTypeChanged;
    }
    this.timePeriodTypeConfiguration.create();
  
    if(this.timePeriodConfiguration === null)
        this.timePeriodConfiguration = new InputConfiguration('timePeriod', {}, {onChange: this.timePeriodChanged, defaultValue: this.timePeriods});
    else{
        this.timePeriodConfiguration.onChange = this.timePeriodChanged;
    }
    this.timePeriodConfiguration.create();
    
    if(this.groupSelectConfiguration === null)
        this.groupSelectConfiguration = new SelectConfiguration('groups',{}, {onChange: this.groupChanged, defaultValue: 0});
    else{
        this.groupSelectConfiguration.onChange = this.groupChanged;
    }
    this.groupSelectConfiguration.create();
    
    //Display Manager
    if(this.displayManager === null)
        this.displayManager = new DataDisplayManager(this.displayConfigurations);
    if(this.dataProviders !== null){
        for(i=0; i<this.dataProviders.length; i++){
            this.displayManager.addProvider(this.dataProviders[i]);
        }
    }
    
    //Point Matcher
    if(this.pointMatcher === null) {
        this.pointMatcher = new DataPointMatcher({
            matchConfigurations: this.pointConfigurations
        });
    }
    
    //Grouper
    if(this.groupMatcher === null){
        if(this.type == 'PointHierarchy'){
            //Fetch the Point Hierarchy to work with        
            this.deferred = mangoRest.hierarchy.getRoot();
            this.deferred.done(function(root) {
                self.groupMatcher = new PointHierarchyGrouper(root, self.groupConfigurations, self.onGroup, {});
                self.groupMatcher.group(); //Do your job grouper
                if(self.loadGroupAtStartup !== null) //Load a Group if required
                    self.groupChanged(self.loadGroupAtStartup);
            }).fail(this.showError);
        }
    }
    
};


DashboardTemplater.prototype = {
        
        debug: false,
        
        type: 'PointHierarchy', //Currently only available Option
        
        deferred: null, //Deferred to know when Templater is Ready after creation
        
        loadGroupAtStartup: null, //Group Index to load at startup, can be null
        
        rollupConfiguration: null,
        timePeriodTypeConfiguration: null,
        timePeriodConfiguration: null,
        
        historicalSamples: null, //Default Number of historical samples to use for historical providers
        
        startDateConfiguration: null,
        endDateConfiguration: null,
        
        displayManager: null, 
        displayConfigurations: null,
        
        dataProviders: null, //List of pre-created providers
        
        pointMatcher: null,
        pointConfigurations: null,
        
        groupMatcher: null,
        groupConfigurations: null,
        groupSelectConfiguration: null,
        groups: null, //List of matched groups for drop down
        groupId: null, //Current Group ID
        
        startDate: null,
        endDate: null,
        rollup: null,
        timePeriodType: null,
        timePeriods: null, //Currently selected Time Periods
        providersToRefresh: null, //If null refresh all otherwise can set to array of provider IDS to refresh
        
        /**
         * Called when custom period has been changed
         */
        customPeriodChanged: function(value){
            if(this.debug)
                console.log("customPeriod: " + value);
            if(value == "0"){
                this.startDate = new Date();
                this.startDate.setHours(0,0,0,0);
                this.endDate = new Date();
                $("#" + this.timePeriodTypeConfiguration.divId).val("HOURS");
                if($("#" + this.timePeriodTypeConfiguration.divId).selectmenu !== undefined)
                    $("#" + this.timePeriodTypeConfiguration.divId).selectmenu('refresh', true);
                this.timePeriodType = "HOURS";        

            }else if(value == "1"){
                this.endDate = new Date();
                //Subtract 7*24Hrs
                this.startDate = new Date(new Date().getTime() - 1000*60*60*24*7);
                $("#" + this.timePeriodTypeConfiguration.divId).val("DAYS");
                if($("#" + this.timePeriodTypeConfiguration.divId).selectmenu !== undefined)
                    $("#" + this.timePeriodTypeConfiguration.divId).selectmenu('refresh', true);
                this.timePeriodType = "DAYS";        

            }else if(value == "2"){
                this.endDate = new Date();
                //Subtract 30 Days
                this.startDate = new Date(new Date().getTime() - 1000*60*60*24*30);
                $("#" + this.timePeriodTypeConfiguration.divId).val("DAYS");
                if($("#" + this.timePeriodTypeConfiguration.divId).selectmenu !== undefined)
                    $("#" + this.timePeriodTypeConfiguration.divId).selectmenu('refresh', true);
                this.timePeriodType = "DAYS";        
            }else if(value == "3"){ //This Year
                this.endDate = new Date();
                //Set Date to first of year
                this.startDate = new Date(new Date().getFullYear(), 0, 1);
                this.startDate.setHours(0,0,0,0);
                $("#" + this.timePeriodTypeConfiguration.divId).val("MONTHS");
                if($("#" + this.timePeriodTypeConfiguration.divId).selectmenu !== undefined)
                    $("#" + this.timePeriodTypeConfiguration.divId).selectmenu('refresh', true);
                this.timePeriodType = "MONTHS";        
            }
            //Refresh the date pickers
            $("#" + this.startDateConfiguration.divId).val(this.startDate.dateFormat(this.startDateConfiguration.configuration.format));
            $("#" + this.endDateConfiguration.divId).val(this.endDate.dateFormat(this.endDateConfiguration.configuration.format));

            this.refresh(this.providersToRefresh);
        },
        /**
         * Called on start date change
         */
        startDateChanged: function(date, $input){
            if(this.debug)
                console.log('SD: ' + date);
            this.startDate = date;
            this.refresh(this.providersToRefresh);
        },
        endDateChanged: function(date, $input){
            if(this.debug)
                console.log('ED: ' + date);
            this.endDate = date;
            this.refresh(this.providersToRefresh);
        },
        rollupChanged: function(rollup){
            if(this.debug)
                console.log('RU: ' + rollup);
            this.rollup = rollup;
            this.refresh(this.providersToRefresh);
        },
        timePeriodTypeChanged: function(timePeriodType){
            if(this.debug)
                console.log('TPT: ' + timePeriodType);
            this.timePeriodType = timePeriodType;
            this.refresh(this.providersToRefresh);
        },
        timePeriodChanged: function(timePeriods){
            if(this.debug)
                console.log('TP: ' + timePeriods);
            this.timePeriods = timePeriods;
            this.refresh(this.providersToRefresh);
        },
        onGroup: function(dataPointGroup){
            if(this.debug)
                console.log('MatchedGroup: ' + dataPointGroup.label + "(" + dataPointGroup.dataPoints.length + ")");
            this.groupSelectConfiguration.addItem(dataPointGroup.label, this.groups.length);
            this.groups.push(dataPointGroup);
        },
        groupChanged: function(groupId){
            if(this.debug)
                console.log('GroupChanged: ' + groupId);
            this.groupId =  groupId;
            this.displayManager.clear(true); //Clear all data  AND Point Configurations on a change of Group
            
            var self = this;
            var matchedConfigs = this.pointMatcher.matchDataPoints(this.groups[groupId].dataPoints);
            $.each(matchedConfigs, function(key, dataPointConfiguration) {
                if(self.debug)
                    console.log('MatchedPoint: {name: ' + dataPointConfiguration.point.name + ", providerId: " + dataPointConfiguration.providerId + ", providerType: " + dataPointConfiguration.providerType);
                self.displayManager.addDataPointConfiguration(dataPointConfiguration);
            });
            
            this.refresh(this.providersToRefresh);
        },
        /**
         * Refresh the providers using the dates/rollups already set in templater
         * @param providerIds
         */
        refresh: function(providerIds){
            this.displayManager.refresh(providerIds, 
                    {
                        from: this.startDate, 
                        to: this.endDate, 
                        rollup: this.rollup, 
                        timePeriodType: this.timePeriodType, 
                        timePeriods: this.timePeriods,
                        historicalSamples: this.historicalSamples
                });
        },
        
        /**
         * Have one or many data providers put a value to Mango
         * @param ids - Array of integer Ids of data providers
         * @param options - { 
         *                    value: PointValueTimeModel {value: object, time: long},
         *                    refresh: boolean to indicate a refresh of displays with this data
         *                  }
         */
        put: function(ids, options){
            if((typeof ids == 'undefined')||(ids === null)){
                for(var i=0; i<this.dataProviders.length; i++){
                    this.dataProviders[i].put(options, this.showError);
                }
            }else{
                //We have Args
                for(var j=0; j<this.dataProviders.length; j++){
                    if($.inArray(this.dataProviders[j].id, ids) >= 0){
                        this.dataProviders[j].put(options, this.showError);
                    }
                }
            }
        },
        
        invalidateChartSize: function(chartDivIds){
            for(var i=0; i<this.displayManager.displays.length; i++){
                var display = this.displayManager.displays[i];
                if($.inArray(display.divId, chartDivIds) >= 0){
                   //Invlidate the chart size
                   display.amChart.invalidateSize();
               }
            }
        },
        
        /**
         * Display Errors method
         */
        showError: function(jqXHR, textStatus, errorThrown, mangoMessage){
            
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

return DashboardTemplater;

})); // close factory function and execute anonymous function
