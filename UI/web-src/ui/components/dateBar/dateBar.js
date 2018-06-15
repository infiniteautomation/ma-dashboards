/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import dateBarTemplate from './dateBar.html';
import angular from 'angular';

DateBarController.$inject = ['$mdMedia', '$stateParams', 'maUtil', 'MA_ROLLUP_TYPES', 'MA_TIME_PERIOD_TYPES', 'maUiDateBar'];
function DateBarController($mdMedia, $stateParams, Util, MA_ROLLUP_TYPES, MA_TIME_PERIOD_TYPES, maUiDateBar) {
    this.params = maUiDateBar;
    this.stateParams = $stateParams;
    this.rollupTypes = MA_ROLLUP_TYPES;
    this.timePeriodTypes = MA_TIME_PERIOD_TYPES;
    this.mdMedia = $mdMedia;

    this.$onInit = function() {
        this.calcAutoRollup();
        this.updateIntervalFromRollupInterval();
        this.calcUpdateIntervalString();
        this.checkAutoSimplifyTolerance();
        this.prevSettings = angular.copy(this.params.data);
    };
    
    this.$doCheck = function() {
        if (!angular.equals(this.params.data, this.prevSettings)) {
            this.prevSettings = angular.copy(this.params.data);
            this.calcAutoRollup();
            this.updateIntervalFromRollupInterval();
            this.calcUpdateIntervalString();
            this.checkAutoSimplifyTolerance();
        }
    };
    
    this.updateIntervalFromRollupInterval = function updateIntervalFromRollupInterval() {
        const intervalControlsPristine = !this.form ||
            ((!this.form.updateIntervals || this.form.updateIntervals.$pristine) &&
                (!this.form.updateIntervalPeriod || this.form.updateIntervalPeriod.$pristine));
        
        // only change updateInterval if user hasn't manually set it 
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
            const calc = Util.rollupIntervalCalculator(this.params.from, this.params.to, this.params.rollupType, true);
            this.params.rollupIntervals = calc.intervals;
            this.params.rollupIntervalPeriod = calc.units;
            this.updateIntervalFromRollupInterval();
        }
    };
    
    this.checkAutoSimplifyTolerance = function checkAutoSimplifyTolerance() {
        this.autoSimplifyTolerance = this.params.simplifyTolerance < 0;
    };
}

export default {
    template: dateBarTemplate,
    controller: DateBarController,
    bindings: {
        onRefresh: '&'
    }
};


