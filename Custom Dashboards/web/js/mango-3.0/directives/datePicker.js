/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'moment'], function(angular, moment) {
'use strict';

function datePicker($injector, mangoDefaultDateFormat) {
    return {
        scope: {
            format: '@',
            ngModel: '='
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
                require(['jquery', 'jquery-ui/jquery.datetimepicker'], function($) {
                    if ($('#datetimpicker-style').length === 0) {
                        var url = require.toUrl('jquery-ui/jquery.datetimepicker.css');
                        $('head').append('<link id="datetimpicker-style" rel="stylesheet" href="' + url + '"></link>');
                    }
                    
                    $element.datetimepicker();
                });
            }
            return link;
        }
    };
    
    function link($scope, $element, attrs, ngModel) {
        if ($injector.has('$mdpDatePicker')) {
            var $mdpDatePicker = $injector.get('$mdpDatePicker');
            var $mdpTimePicker = $injector.get('$mdpTimePicker');
            
            $scope.format = $scope.format || mangoDefaultDateFormat;
            
            ngModel.$formatters.push(function(value) {
                if (angular.isDate(value)) {
                    return moment(value).format($scope.format);
                } else if (moment.isMoment(value)) {
                    return value.format($scope.format);
                }
            });
            
            ngModel.$parsers.unshift(function(value) {
                if (typeof value === 'string') {
                    var m = moment(value, $scope.format, true);
                    if (m.isValid())
                        return m.toDate();
                }
            });

            $scope.showPicker = function showPicker(ev) {
                $mdpDatePicker(ngModel.$modelValue, {
                    targetEvent: ev
                }).then(function(date) {
                    return $mdpTimePicker(date, {
                        targetEvent: ev,
                        autoSwitch: false
                    });
                }).then(function(date) {
                    $scope.ngModel = date;
                });
            };
        }
    }
}

datePicker.$inject = ['$injector', 'mangoDefaultDateFormat'];

return datePicker;

}); // define
