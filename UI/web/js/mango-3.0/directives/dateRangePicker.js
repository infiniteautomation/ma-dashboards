/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['moment-timezone'], function(moment) {
'use strict';

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
            
            return '<select ng-options="t.type as " ng-model="preset"></select>';
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
                    check = moment(check, $scope.format || mangoDefaultDateFormat);
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
