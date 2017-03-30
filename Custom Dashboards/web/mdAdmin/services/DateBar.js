/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

DateBarFactory.$inject = ['localStorageService', 'MA_ROLLUP_TYPES', '$filter'];
function DateBarFactory(localStorageService, MA_ROLLUP_TYPES, $filter) {
    var LOCAL_STORAGE_KEY = 'dateBarSettings';
    
    var defaults = {
        preset: 'LAST_1_DAYS',
        rollupType: 'POINT_DEFAULT',
        rollupIntervals: 10,
        rollupIntervalPeriod: 'MINUTES',
        autoRollup: true,
        updateIntervals: 10,
        updateIntervalPeriod: 'MINUTES',
        autoUpdate: true,
        expanded: false,
        rollupTypesFilter: {},
        rollupTypesFilterLast: {}
    };

    function DateBar() {
        this.cache = {};
        this.load();
    }
    
    DateBar.prototype = {
        load: function load() {
            this.data = localStorageService.get(LOCAL_STORAGE_KEY) || defaults;
            return this;
        },
        save: function save() {
            localStorageService.set(LOCAL_STORAGE_KEY, this.data);
            return this;
        },
        set preset(value) {
            this.data.preset = value;
            this.save();
        },
        set rollupType(value) {
            this.data.rollupType = value;
            this.save();
        },
        set rollupIntervals(value) {
            this.data.rollupIntervals = value;
            this.save();
        },
        set rollupIntervalPeriod(value) {
            this.data.rollupIntervalPeriod = value;
            this.save();
        },
        set autoRollup(value) {
            this.data.autoRollup = value;
            this.save();
        },
        set updateIntervals(value) {
            this.data.updateIntervals = value;
            this.save();
        },
        set updateIntervalPeriod(value) {
            this.data.updateIntervalPeriod = value;
            this.save();
        },
        set autoUpdate(value) {
            this.data.autoUpdate = value;
            this.save();
        },
        set expanded(value) {
            this.data.expanded = value;
            this.save();
        },
        set rollupTypesFilter(value) {
            this.data.rollupTypesFilter = value;

            var currentRollupOk = $filter('filter')(MA_ROLLUP_TYPES, value).some(function(rollupType) {
                return rollupType.type === this.data.rollupType;
            }.bind(this));
            
            if (!currentRollupOk) {
                this.data.rollupType = 'POINT_DEFAULT';
            }

            this.save();
        },
        set from(value) {
            this.cache.from = value;
            this.data.from = value.valueOf();
            this.save();
        },
        set to(value) {
            this.cache.to = value;
            this.data.to = value.valueOf();
            this.save();
        },
        get preset() {
            return this.data.preset;
        },
        get rollupType() {
            return this.data.rollupType;
        },
        get rollupIntervals() {
            return this.data.rollupIntervals;
        },
        get rollupIntervalPeriod() {
            return this.data.rollupIntervalPeriod;
        },
        get autoRollup() {
            return this.data.autoRollup;
        },
        get updateIntervals() {
            return this.data.updateIntervals;
        },
        get updateIntervalPeriod() {
            return this.data.updateIntervalPeriod;
        },
        get autoUpdate() {
            return this.data.autoUpdate;
        },
        get expanded() {
            return this.data.expanded;
        },
        get rollupTypesFilter() {
            return this.data.rollupTypesFilter;
        },
        get from() {
            if (!this.cache.from) {
                if (!this.data.from) return;
                this.cache.from = new Date(this.data.from);
            }
            return this.cache.from;
        },
        get to() {
            if (!this.cache.to) {
                if (!this.data.to) return;
                this.cache.to = new Date(this.data.to);
            }
            return this.cache.to;
        }
    };
    
    return new DateBar();
}
return DateBarFactory;

}); // define
