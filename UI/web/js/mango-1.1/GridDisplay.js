/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

define(['jquery', 'extend', 'dojo/_base/declare', 'dstore/Memory', 'dstore/Trackable', 'dgrid/OnDemandGrid'],
function($, extend, declare, Memory, Trackable, OnDemandGrid) {

var GridDisplay = extend({
    constructor: function(options) {
        // stores data which arrives while loading
        this.cache = [];
        this.maximumItems = null;
        
        this.store = new declare([Memory, Trackable])({
            data: [],
            idProperty: 'timestamp'
        });
        this.gridOptions = {
            collection: this.store
        };
        
        $.extend(this.gridOptions, options.gridOptions);
        delete options.gridOptions;
        
        this.loadingMessage = this.gridOptions.loadingMessage;
        this.noDataMessage = this.gridOptions.noDataMessage;
        
        $.extend(this, options);
    },
    
    createDisplay: function() {
        this.grid = new OnDemandGrid(this.gridOptions, this.gridId);
        return this;
    },
    
    /**
     * Data Provider listener to clear data
     */
    onClear: function() {
        this.cache = [];
        this.grid.noDataMessage = this.noDataMessage;
        this.store.setData([]);
        this.grid.refresh();
    },
    
    /**
     * Data Provider Listener
     * On Data Provider load we add new data
     */
    onLoad: function(data, dataPoint) {
        if ($.isArray(data)) {
            this.removeLoading();
            this.store.setData(this.cache.concat(data));
            this.cache = [];
            this.trimItems();
            this.grid.refresh();
        }
        else {
            if (this.isLoading) {
                this.cache.push(data);
            }
            else {
                this.store.put(data);
                this.trimItems();
            }
        }
    },
    
    trimItems: function() {
        if (!this.maximumItems) return;
        
        var sortedStore = this.store.sort(this.store.idProperty);
        
        while (this.store.data.length > this.maximumItems) {
            var lowestIdItem = sortedStore.fetchRangeSync({start: 0, end: 1})[0];
            this.store.removeSync(lowestIdItem[this.store.idProperty]);
        }
    },
    
    loading: function() {
        this.isLoading = true;
        this.grid.noDataMessage = this.loadingMessage;
        this.grid.refresh();
    },
    
    removeLoading: function() {
        this.isLoading = false;
        this.grid.noDataMessage = this.noDataMessage;
        // refresh is called straight after by onLoad()
    }
});

return GridDisplay;

}); // define
