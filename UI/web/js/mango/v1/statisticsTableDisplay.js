/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

(function(factory) { // anonymous function
    // Support multiple module loading scenarios
    if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(['jquery', 'moment-timezone'], factory);
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        this.StatisticsTableDisplay = factory(jQuery, moment);
    }
}(function($, moment) {

var StatisticsTableDisplay = function(options) {
    this.table = null;
    this.dataProviderIds = [];
    this.rows = {};
    
    for(var i in options) {
        this[i] = options[i];
    }
};

StatisticsTableDisplay.prototype = {
    pointProperties: ['name'],
    dataProperties: ['average', 'maximum', 'minimum'],
    
    createDisplay: function() {
        return this;
    },
    
    onClear: function() {
        this.table.find('tbody tr').remove();
        delete this.rows;
        this.rows = {};
    },
    
    loading: function() {
        if (this.table.find('tbody tr.loading').length > 0)
            return;
        
        var tr = $('<tr>');
        tr.addClass('loading');
        td = $('<td>');
        td.text('Loading');
        td.attr('colspan', this.pointProperties.length + this.dataProperties.length);
        tr.append(td);
        this.table.find('tbody').append(tr);
    },
    
    onLoad: function(data, dataPoint) {
        if (!data.hasData)
            return;
        
        this.table.find('tbody tr.loading').remove();
        
        var row = this.rows[dataPoint.xid];
        if (!row) {
            row = this.createRow(dataPoint);
        }
        
        var prop, td, value;
        
        for (var i in this.pointProperties) {
            prop = this.pointProperties[i];
            td = row.find('.point-prop-' + prop);
            value = dataPoint[prop];
            td.text(this.renderValue(value));
        }
        
        for (i in this.dataProperties) {
            prop = this.dataProperties[i];
            td = row.find('.data-prop-' + prop);
            value = data[prop];
            td.text(this.renderValue(value));
        }
    },
    
    createRow: function(dataPoint) {
        var tr = $('<tr>');
        tr.addClass('stats-row-xid-' + dataPoint.xid);
        
        var prop, td;
        
        for (var i in this.pointProperties) {
            prop = this.pointProperties[i];
            td = $('<td>');
            td.addClass('point-prop-' + prop);
            tr.append(td);
        }
        
        for (i in this.dataProperties) {
            prop = this.dataProperties[i];
            td = $('<td>');
            td.addClass('data-prop-' + prop);
            tr.append(td);
        }
        
        this.table.find('tbody').append(tr);
        return tr;
    },

    renderValue: function(value) {
        // PointValueTime
        if (value.value && value.timestamp) {
            return this.renderNumber(value.value) + " @ " + this.renderTime(value.timestamp);
        }
        
        if (typeof value === 'number') {
            return this.renderNumber(value);
        }
        
        return value;
    },

    renderNumber: function(number) {
        return number.toFixed(2);
    },

    renderTime: function(timestamp) {
        return moment(timestamp).format('lll');
    }
};

return StatisticsTableDisplay;
})); // define
