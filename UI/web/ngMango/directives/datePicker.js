/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'moment'], function(angular, moment) {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.directive:maDatePicker
 *
 * @description
 * `<ma-date-picker ng-model="time"></ma-date-picker>`
 * - Use the `<ma-date-picker>` directive to display a date/time picker.
 * - Often used in conjunction with `<ma-date-range-picker>`
 * - <a ui-sref="ui.examples.basics.datePresets">View Demo</a>
 * @param {object} ng-model The variable to hold the resulting timestamp
 * @param {string=} format Specifies the formatting of the date/time within the input (using [momentJs](http://momentjs.com/) formatting)
 * @param {string=} timezone Specifies the timezone
 * @param {string=} mode Specify whether to use the date picker to set `date`, `time`, or `both` for both date and time.
 * @param {boolean=} auto-switch-time Whether or not time picker will automatically switch to minute select after selecting
 * hour on clock. (defaults to `true`)
 *
 * @usage
 * <md-input-container>
       <label>From date</label>
       <ma-date-picker ng-model="from" format="MMM-Do-YY" mode="date"></ma-date-picker>
  </md-input-container>
  <md-input-container>
       <label>To date</label>
       <ma-date-picker ng-model="to" format="MMM-Do-YY" mode="date"></ma-date-picker>
  </md-input-container>
 */
function datePicker($injector, mangoDateFormats, ngMangoInsertCss, cssInjector, $q) {
    return {
        restrict: 'E',
        designerInfo: {
            translation: 'ui.components.datePicker',
            icon: 'access_time',
            category: 'timeAndDate',
            attributes: {
                mode: {options: ['date', 'time', 'both']}
            }
        },
        scope: {
            format: '@',
            timezone: '@',
            mode: '@',
            autoSwitchTime: '<?'
        },
        require: 'ngModel',
        replace: true,
        template: function() {
            if ($injector.has('$mdpDatePicker')) {
                return '<input type="text" ng-click="showPicker($event)">';
            }
            return '<input type="text">';
        },
        compile: function($element, attributes) {
            if (!$injector.has('$mdpDatePicker')) {
                if (ngMangoInsertCss) {
                    cssInjector.injectLink(require.toUrl('jquery-ui/jquery.datetimepicker.css'), this.name);
                }
                require(['jquery', 'jquery-ui/jquery.datetimepicker'], function($) {
                    $element.datetimepicker();
                });
            }
            return link;
        }
    };

    function link($scope, $element, attrs, ngModel) {
        
        $scope.getFormat = function getFormat() {
            if ($scope.format) return $scope.format;
            if ($scope.mode === 'date') {
                return mangoDateFormats.date;
            } else if ($scope.mode === 'time') {
                return mangoDateFormats.time;
            } else {
                return mangoDateFormats.dateTimeSeconds;
            }
        };
        
        $scope.$watch('format + timezone', function(newVal, oldVal) {
        	if (newVal === oldVal) return;
            ngModel.$viewValue = modelToView(ngModel.$modelValue);
            ngModel.$render();
        });
        
        // formatter converts from Date ($modelValue) into String ($viewValue)
        ngModel.$formatters.push(modelToView);

        function modelToView(value) {
            if (angular.isDate(value) || moment.isMoment(value)) {
                var m = moment(value);
                if ($scope.timezone) {
                    m.tz($scope.timezone);
                }
                return m.format($scope.getFormat());
            }
        }

        // parser converts from String ($viewValue) into Date ($modelValue)
        ngModel.$parsers.push(function(value) {
            if (typeof value === 'string') {
                var initialDate = moment(ngModel.$modelValue);
                var m;
                if ($scope.timezone) {
                    initialDate.tz($scope.timezone);
                    m = moment.tz(value, $scope.getFormat(), true, $scope.timezone);
                } else {
                    m = moment(value, $scope.getFormat(), true);
                }
                
                if ($scope.mode === 'date') {
                    m.hours(initialDate.hours());
                    m.minutes(initialDate.minutes());
                    m.seconds(initialDate.seconds());
                    m.milliseconds(initialDate.milliseconds());
                } else if ($scope.mode === 'time') {
                    m.date(initialDate.date());
                    m.month(initialDate.month());
                    m.year(initialDate.year());
                }
                
                if (m.isValid())
                    return m.toDate();
            }
        });

        if ($injector.has('$mdpDatePicker')) {
            var $mdpDatePicker = $injector.get('$mdpDatePicker');
            var $mdpTimePicker = $injector.get('$mdpTimePicker');

            $scope.showPicker = function showPicker(ev) {
            	if (ev.altKey) return;
            	
                var autoSwitchTime = angular.isUndefined($scope.autoSwitchTime) ? true : $scope.autoSwitchTime;
                var initialDate;
                
                if ($scope.timezone) {
                    var m = moment(ngModel.$modelValue);
                    var defaultMomentOffset = m.utcOffset();
                    initialDate = m.tz($scope.timezone).utcOffset(defaultMomentOffset, true).toDate();
                } else {
                    initialDate = ngModel.$modelValue;
                }

                var promise;
                if (!$scope.mode || $scope.mode === 'both' || $scope.mode === 'date') {
                    promise = $mdpDatePicker(initialDate, {
                        targetEvent: ev
                    });
                } else {
                    promise = $q.when(initialDate);
                }
                
                if (!$scope.mode || $scope.mode === 'both' || $scope.mode === 'time') {
                    promise = promise.then(function(date) {
                        return $mdpTimePicker(date, {
                            targetEvent: ev,
                            autoSwitch: autoSwitchTime
                        });
                    });
                }
                
                promise.then(function(date) {
                    var stringValue = moment(date).format($scope.getFormat());
                    ngModel.$setViewValue(stringValue, ev);
                    ngModel.$render();
                });
            };
        }
    }
}

datePicker.$inject = ['$injector', 'MA_DATE_FORMATS', 'MA_INSERT_CSS', 'maCssInjector', '$q'];

return datePicker;

}); // define
