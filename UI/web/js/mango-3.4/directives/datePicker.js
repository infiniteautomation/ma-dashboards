/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'moment'], function(angular, moment) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maDatePicker
 *
 * @description
 * `<ma-date-picker ng-model="time"></ma-date-picker>`
 * - Use the `<ma-date-picker>` directive to display a date/time picker, note that you can also add it as an attribute to an existing `<input>` tag.
 * - Often used in conjunction with `<ma-date-range-picker>`
 * - <a ui-sref="dashboard.examples.basics.datePresets">View Demo</a>
 * @param {object} ng-model The variable to hold the resulting timestamp
 * @param {string=} format Specifies the formatting of the date/time within the input (using [momentJs](http://momentjs.com/) formatting)
 *
 * @usage
 * <md-input-container>
       <label>From date</label>
       <ma-date-picker ng-model="from" format="MMM-Do-YY @ ha"></ma-date-picker>
  </md-input-container>
  <md-input-container>
       <label>To date</label>
       <ma-date-picker ng-model="to" format="MMM-Do-YY @ ha"></ma-date-picker>
  </md-input-container>
 */
function datePicker($injector, mangoDateFormats, maDashboardsInsertCss, cssInjector, $q) {
    return {
        restrict: 'E',
        designerInfo: {
            translation: 'dashboards.v3.components.datePicker',
            icon: 'access_time',
            category: 'timeAndDate',
            attributes: {
                mode: {options: ['date', 'time', 'datetime']}
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
                if (maDashboardsInsertCss) {
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

        // formatter converts from Date ($modelValue) into String ($viewValue)
        ngModel.$formatters.push(function(value) {
            if (angular.isDate(value) || moment.isMoment(value)) {
                var m = moment(value);
                if ($scope.timezone) {
                    m.tz($scope.timezone);
                }
                return m.format($scope.getFormat());
            }
        });

        // parser converts from String ($viewValue) into Date ($modelValue)
        ngModel.$parsers.unshift(function(value) {
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

datePicker.$inject = ['$injector', 'mangoDateFormats', 'maDashboardsInsertCss', 'cssInjector', '$q'];

return datePicker;

}); // define
