/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['moment-timezone'], function(moment) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maDateRangePicker
 *
 * @description
 * `<ma-date-range-picker from="from" to="to" preset="LAST_1_DAYS" update-interval="5 seconds"></ma-date-range-picker>`
 * - Use the `<ma-date-range-picker>` directive to insert a date range preset picker.
 This enables you to choose from a list of commonly used date ranges, such as "Today so far" or "Previous week".
 * - Set the update-interval attribute to have it update automatically.
 * - You can tie the `<ma-date-range-picker>` and `<ma-date-picker>` together using the `from` and `to` attributes on the preset picker, and `ng-model` on the date pickers.
 * - <a ui-sref="dashboard.examples.basics.datePresets">View Demo</a>
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
function dateRangePicker($rootScope, $injector, mangoDefaultDateFormat) {
    return {
        restrict: 'E',
        scope: {
            preset: '@',
            from: '=',
            to: '=',
            format: '@',
            updateInterval: '@'
        },
        replace: true,
        template: function(element, attrs) {
            if ($injector.has('$mdUtil')) {
                return '<md-select ng-model="preset">' +
                '<md-option ng-value="p.type" ng-repeat="p in presets track by p.type">{{p.label}}</md-option>' +
                '</md-select>';
            }

            return '<select ng-options="p.type as p.label for p in presets" ng-model="preset"></select>';
        },
        link: function ($scope, $element) {
            var mdPickers = $injector.has('$mdpDatePicker');

        	var from, to;
        	$scope.presets = $rootScope.dateRangePresets;

        	$scope.$watch('preset', doUpdate);

        	$scope.$watch('updateInterval', function() {
            	startUpdateTimer();
            });

        	$scope.$watchGroup(['from', 'to'], function(newValues) {
        		if (!(isSame(from, newValues[0]) && isSame(to, newValues[1]))) {
        			$scope.preset = '';
        		}
        	});

        	function isSame(m, check) {
                if (typeof check === 'string') {
                    return m.format($scope.format || mangoDefaultDateFormat) === check;
                }
                return m.isSame(check);
        	}

        	function doUpdate() {
        		if (!$scope.preset) return;
        		from = moment();
        		to = moment();
        		switch($scope.preset) {
        		case 'LAST_5_MINUTES': from = from.subtract(5, 'minutes'); break;
        		case 'LAST_15_MINUTES': from = from.subtract(15, 'minutes'); break;
        		case 'LAST_30_MINUTES': from = from.subtract(30, 'minutes'); break;
        		case 'LAST_1_HOURS': from = from.subtract(1, 'hours'); break;
        		case 'LAST_3_HOURS': from = from.subtract(3, 'hours'); break;
        		case 'LAST_6_HOURS': from = from.subtract(6, 'hours'); break;
        		case 'LAST_12_HOURS': from = from.subtract(12, 'hours'); break;
        		case 'LAST_1_DAYS': from = from.subtract(1, 'days'); break;
        		case 'LAST_1_WEEKS': from = from.subtract(1, 'weeks'); break;
        		case 'LAST_2_WEEKS': from = from.subtract(2, 'weeks'); break;
        		case 'LAST_1_MONTHS': from = from.subtract(1, 'months'); break;
        		case 'LAST_3_MONTHS': from = from.subtract(3, 'months'); break;
        		case 'LAST_6_MONTHS': from = from.subtract(6, 'months'); break;
        		case 'LAST_1_YEARS': from = from.subtract(1, 'years'); break;
        		case 'LAST_2_YEARS': from = from.subtract(2, 'years'); break;
        		case 'DAY_SO_FAR': from = from.startOf('day'); break;
        		case 'WEEK_SO_FAR': from = from.startOf('week'); break;
        		case 'MONTH_SO_FAR': from = from.startOf('month'); break;
        		case 'YEAR_SO_FAR': from = from.startOf('year'); break;
        		case 'PREVIOUS_DAY':
        			from = from.subtract(1, 'days').startOf('day');
        			to = to.startOf('day');
        			break;
        		case 'PREVIOUS_WEEK':
        			from = from.subtract(1, 'weeks').startOf('week');
        			to = to.startOf('week');
        			break;
        		case 'PREVIOUS_MONTH':
        			from = from.subtract(1, 'months').startOf('month');
        			to = to.startOf('month');
        			break;
        		case 'PREVIOUS_YEAR':
        			from = from.subtract(1, 'years').startOf('year');
        			to = to.startOf('year');
        			break;
        		}

        		if (mdPickers || $scope.format === 'false') {
        		    $scope.from = from.toDate();
                    $scope.to = to.toDate();
        		} else {
        		    var format = $scope.format || mangoDefaultDateFormat;
                    $scope.from = from.format(format);
                    $scope.to = to.format(format);
        		}
        	}

            var timerId;
            function startUpdateTimer() {
                cancelUpdateTimer();

                if (isEmpty($scope.updateInterval)) return;
                var parts = $scope.updateInterval.split(' ');
                if (parts.length < 2) return;
                if (isEmpty(parts[0]) || isEmpty(parts[1])) return;

                var duration = moment.duration(parseFloat(parts[0]), parts[1]);
                var millis = duration.asMilliseconds();

                // dont allow continuous loops
                if (millis === 0) return;

                timerId = setInterval(function() {
                    $scope.$apply(function() {
                        doUpdate();
                    });
                }, millis);
            }

            // test for null, undefined or whitespace
            function isEmpty(str) {
            	return !str || /^\s*$/.test(str);
            }

            function cancelUpdateTimer() {
                if (timerId) {
                    clearInterval(timerId);
                    timerId = null;
                }
            }
        }
    };
}

dateRangePicker.$inject = ['$rootScope', '$injector', 'mangoDefaultDateFormat'];

return dateRangePicker;

}); // define
