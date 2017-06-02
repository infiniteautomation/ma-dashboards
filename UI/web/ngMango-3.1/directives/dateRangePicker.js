/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['moment-timezone'], function(moment) {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.directive:maDateRangePicker
 *
 * @description
 * `<ma-date-range-picker from="from" to="to" preset="LAST_1_DAYS" update-interval="5 seconds"></ma-date-range-picker>`
 * - Use the `<ma-date-range-picker>` directive to insert a date range preset picker.
 This enables you to choose from a list of commonly used date ranges, such as "Today so far" or "Previous week".
 * - Set the update-interval attribute to have it update automatically.
 * - You can tie the `<ma-date-range-picker>` and `<ma-date-picker>` together using the `from` and `to` attributes on the preset picker, and `ng-model` on the date pickers.
 * - <a ui-sref="ui.examples.basics.datePresets">View Demo</a>
 * @param {string=} preset If provided the specified preset will be pre-selected in the dropdown.
 Possible options are:
<ul>
    <li>LAST_5_MINUTES  </li>
    <li>LAST_15_MINUTES</li>
    <li>LAST_30_MINUTES</li>
    <li>LAST_1_HOURS</li>
    <li>LAST_3_HOURS</li>
    <li>LAST_6_HOURS</li>
    <li>LAST_12_HOURS</li>
    <li>LAST_1_DAYS</li>
    <li>LAST_1_WEEKS</li>
    <li>LAST_2_WEEKS</li>
    <li>LAST_1_MONTHS</li>
    <li>LAST_3_MONTHS</li>
    <li>LAST_6_MONTHS</li>
    <li>LAST_1_YEARS</li>
    <li>LAST_2_YEARS</li>
    <li>DAY_SO_FAR</li>
    <li>WEEK_SO_FAR</li>
    <li>MONTH_SO_FAR</li>
    <li>YEAR_SO_FAR</li>
    <li>PREVIOUS_DAY</li>
    <li>PREVIOUS_WEEK</li>
    <li>PREVIOUS_MONTH</li>
    <li>PREVIOUS_YEAR</li>
</ul>
 * @param {object} from Variable to hold the `from` timestamp.
 * @param {object} to Variable to hold the `to` timestamp.
 * @param {string=} update-interval If provided the time range will update to current time on the given interval.
 Format the interval duration as a string starting with a number followed by one of these units:
<ul>
    <li>years</li>
    <li>months</li>
    <li>weeks</li>
    <li>days</li>
    <li>hours</li>
    <li>minutes</li>
    <li>seconds</li>
    <li>milliseconds</li>
</ul>
Eg: `update-interval="10 minutes"`
 * @param {string=} format Specifies the formatting of the outputted to the `from`/`to` when not using angular material (using [momentJs](http://momentjs.com/) formatting)
 *
 * @usage
 * <md-input-container>
       <label>Preset</label>
       <ma-date-range-picker from="from" to="to" preset="LAST_1_DAYS"
       update-interval="5 seconds"></ma-date-range-picker>
  </md-input-container>
 */
function dateRangePicker($injector) {
    return {
        restrict: 'E',
        controllerAs: '$ctrl',
        scope: {},
        bindToController: {
            preset: '@',
            from: '<?',
            to: '<?',
            format: '@',
            updateInterval: '@',
            refresh: '<?',
            onChange: '&',
            noUnderline: '<?',
            timezone: '@'
        },
        designerInfo: {
            translation: 'ui.components.dateRangePicker',
            icon: 'date_range',
            category: 'timeAndDate',
            attributes: {
                preset: {options: ['LAST_5_MINUTES','LAST_15_MINUTES','LAST_30_MINUTES','LAST_1_HOURS','LAST_3_HOURS','LAST_6_HOURS','LAST_12_HOURS','LAST_1_DAYS',
                    'LAST_1_WEEKS','LAST_2_WEEKS','LAST_1_MONTHS','LAST_3_MONTHS','LAST_6_MONTHS','LAST_1_YEARS','LAST_2_YEARS','DAY_SO_FAR','WEEK_SO_FAR',
                    'MONTH_SO_FAR','YEAR_SO_FAR','PREVIOUS_DAY','PREVIOUS_WEEK','PREVIOUS_MONTH','PREVIOUS_YEAR']}
            }
        },
        template: function(element, attrs) {
            if ($injector.has('$mdUtil')) {
                return '<md-select ng-model="$ctrl.preset" ng-change="$ctrl.inputChanged($event)" ma-tr="ui.app.dateRangePreset" ng-class="{\'md-no-underline\': $ctrl.noUnderline}">' +
                '<md-option ng-value="p.type" ng-repeat="p in $ctrl.presets track by p.type">{{p.label}}</md-option>' +
                '</md-select>';
            }

            return '<select ng-options="p.type as p.label for p in $ctrl.presets" ng-model="$ctrl.preset" ng-change="$ctrl.inputChanged($event)"></select>';
        },
        controller: ['$attrs', '$parse', '$scope', '$interval', 'maUtil', 'MA_DATE_RANGE_PRESETS', 'MA_DATE_FORMATS',
                     function($attrs, $parse, $scope, $interval, Util, MA_DATE_RANGE_PRESETS, mangoDateFormats) {
            
        	var fromExpression = $parse($attrs.from);
        	var toExpression = $parse($attrs.to);
            var fromAssign = fromExpression.assign && fromExpression.assign.bind(null, $scope.$parent);
            var toAssign = toExpression.assign && toExpression.assign.bind(null, $scope.$parent);
            
            this.$onChanges = function(changes) {
                if (changes.preset) {
                    this.doUpdate();
                }
                
                if (changes.refresh && !changes.refresh.isFirstChange()) {
                    this.doUpdate();
                    this.startUpdateTimer();
                }
                
                if (changes.updateInterval) {
                    this.startUpdateTimer();
                }
                
                if (changes.from && !changes.from.isFirstChange() || changes.to && !changes.to.isFirstChange()) {
                    if (!(this.isSame(this.fromMoment, this.from) && this.isSame(this.toMoment, this.to))) {
                        this.preset = '';
                        this.onChange({from: this.from, to: this.to, preset: this.preset});
                    }
                }
            };
            
            this.$onDestroy = function() {
                $interval.cancel(this.timerPromise);
            };
            
            var mdPickers = $injector.has('$mdpDatePicker');
            this.presets = MA_DATE_RANGE_PRESETS;

            this.isSame = function isSame(m, check) {
                if (!m) return false;
                if (typeof check === 'string') {
                    return m.format(this.format || mangoDateFormats.dateTimeSeconds) === check;
                }
                return m.isSame(check);
            };

            this.inputChanged = function inputChanged($event) {
                this.doUpdate();
                this.onChange({from: this.from, to: this.to, preset: this.preset, '$event': $event});
            };
            
            this.doUpdate = function doUpdate() {
                if (!this.preset) return;
                var from = moment();
                var to = moment();
                if (this.timezone) {
                    from.tz(this.timezone);
                    to.tz(this.timezone);
                }
                
                switch(this.preset) {
                case 'LAST_5_MINUTES': from.subtract(5, 'minutes'); break;
                case 'LAST_15_MINUTES': from.subtract(15, 'minutes'); break;
                case 'LAST_30_MINUTES': from.subtract(30, 'minutes'); break;
                case 'LAST_1_HOURS': from.subtract(1, 'hours'); break;
                case 'LAST_3_HOURS': from.subtract(3, 'hours'); break;
                case 'LAST_6_HOURS': from.subtract(6, 'hours'); break;
                case 'LAST_12_HOURS': from.subtract(12, 'hours'); break;
                case 'LAST_1_DAYS': from.subtract(1, 'days'); break;
                case 'LAST_1_WEEKS': from.subtract(1, 'weeks'); break;
                case 'LAST_2_WEEKS': from.subtract(2, 'weeks'); break;
                case 'LAST_1_MONTHS': from.subtract(1, 'months'); break;
                case 'LAST_3_MONTHS': from.subtract(3, 'months'); break;
                case 'LAST_6_MONTHS': from.subtract(6, 'months'); break;
                case 'LAST_1_YEARS': from.subtract(1, 'years'); break;
                case 'LAST_2_YEARS': from.subtract(2, 'years'); break;
                case 'DAY_SO_FAR': from.startOf('day'); break;
                case 'WEEK_SO_FAR': from.startOf('week'); break;
                case 'MONTH_SO_FAR': from.startOf('month'); break;
                case 'YEAR_SO_FAR': from.startOf('year'); break;
                case 'PREVIOUS_DAY':
                    from.subtract(1, 'days').startOf('day');
                    to.startOf('day');
                    break;
                case 'PREVIOUS_WEEK':
                    from.subtract(1, 'weeks').startOf('week');
                    to.startOf('week');
                    break;
                case 'PREVIOUS_MONTH':
                    from.subtract(1, 'months').startOf('month');
                    to.startOf('month');
                    break;
                case 'PREVIOUS_YEAR':
                    from.subtract(1, 'years').startOf('year');
                    to.startOf('year');
                    break;
                }
                
                this.fromMoment = from;
                this.toMoment = to;

                if (mdPickers || this.format === 'false') {
                    if (fromAssign)
                    	fromAssign(from.toDate());
                    if (toAssign)
                    	toAssign(to.toDate());
                } else {
                    var format = this.format || mangoDateFormats.dateTimeSeconds;
                    if (fromAssign)
                    	fromAssign(from.format(format));
                    if (toAssign)
                    	toAssign(to.format(format));
                }
            }.bind(this);

            this.startUpdateTimer = function startUpdateTimer() {
                $interval.cancel(this.timerPromise);

                if (Util.isEmpty(this.updateInterval)) return;
                var parts = this.updateInterval.split(' ');
                if (parts.length < 2) return;
                if (Util.isEmpty(parts[0]) || Util.isEmpty(parts[1])) return;

                var duration = moment.duration(parseFloat(parts[0]), parts[1]);
                var millis = duration.asMilliseconds();

                // dont allow continuous loops
                if (millis === 0) return;

                this.timerPromise = $interval(this.doUpdate, millis);
            };
        }]
    };
}

dateRangePicker.$inject = ['$injector'];

return dateRangePicker;

}); // define
