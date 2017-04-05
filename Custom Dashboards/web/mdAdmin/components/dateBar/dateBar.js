/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

DateBarController.$inject = ['$mdMedia', '$stateParams', 'Util', 'MA_ROLLUP_TYPES', 'MA_TIME_PERIOD_TYPES', 'DateBar', 'mdAdminSettings'];
function DateBarController($mdMedia, $stateParams, Util, MA_ROLLUP_TYPES, MA_TIME_PERIOD_TYPES, DateBar, mdAdminSettings) {
    this.params = DateBar;
    this.stateParams = $stateParams;
    this.rollupTypes = MA_ROLLUP_TYPES;
    this.timePeriodTypes = MA_TIME_PERIOD_TYPES;
    this.mdMedia = $mdMedia;
    this.mdAdminSettings = mdAdminSettings;

    this.$onInit = function() {
        this.calcUpdateIntervalString();
    };
    
    this.$doCheck = function() {
        if (this.params.from !== this.prevFrom || this.params.to !== this.prevTo) {
            this.prevFrom = this.params.from;
            this.prevTo = this.params.to;
            this.calcAutoRollup();
        }
    };
    
    this.updateIntervalFromRollupInterval = function updateIntervalFromRollupInterval() {
        var intervalControlsPristine = !this.form ||
            ((!this.form.updateIntervals || this.form.updateIntervals.$pristine) &&
                (!this.form.updateIntervalPeriod || this.form.updateIntervalPeriod.$pristine));
        if (intervalControlsPristine) {
            this.params.updateIntervals = this.params.rollupIntervals;
            this.params.updateIntervalPeriod = this.params.rollupIntervalPeriod;
        }
    };
    
    this.calcUpdateIntervalString = function calcUpdateIntervalString() {
        this.params.updateIntervalString = this.params.autoUpdate ? this.params.updateIntervals + ' ' + this.params.updateIntervalPeriod : '';
    };
    
    this.calcAutoRollup = function calcAutoRollup() {
        if (this.params.autoRollup) {
            var calc = Util.rollupIntervalCalculator(this.params.from, this.params.to, this.params.rollupType, true);
            this.params.rollupIntervals = calc.intervals;
            this.params.rollupIntervalPeriod = calc.units;
            this.updateIntervalFromRollupInterval();
        }
    };
}

return {
    templateUrl: require.toUrl('./dateBar.html'),
    controller: DateBarController,
    bindings: {
        onRefresh: '&'
    }
};

}); // define
