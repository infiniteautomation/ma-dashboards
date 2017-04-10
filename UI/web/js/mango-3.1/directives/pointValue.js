/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

function pointValue($filter, mangoDefaultDateFormat) {
    return {
        restrict: 'E',
        scope: {
            point: '=?',
            pointXid: '@',
            displayType: '@',
            dateTimeFormat: '@'
        },
        replace: true,
        templateUrl: require.toUrl('./pointValue.html'),
        link: function ($scope, $element, attrs) {
        	var displayType = $scope.displayType || 'rendered';
            var dateTimeFormat = $scope.dateTimeFormat || mangoDefaultDateFormat;

            $scope.valueStyle = {};
            $scope.classes = {};

            $scope.$watch('point.value', function(newValue, oldValue) {
            	var point = $scope.point;
            	if (!point || newValue === undefined) return;
            	
            	$scope.classes['point-disabled'] = !point.enabled;
                
            	var valueRenderer = point.valueRenderer(point.value);
                var color = valueRenderer ? valueRenderer.color : null;
                
                switch(displayType) {
                case 'converted':
                	$scope.displayValue = point.convertedValue;
                    break;
                case 'rendered':
                	$scope.displayValue = point.renderedValue;
                    $scope.valueStyle.color = color;
                    break;
                case 'dateTime':
                	$scope.displayValue = $filter('moment')(point.time, 'format', dateTimeFormat);
                    break;
                default:
                	$scope.displayValue = point.value;
                }
            });

            $scope.$watch('point.xid', function(newXid, oldXid) {
                if (oldXid && oldXid !== newXid) {
                    delete $scope.displayValue;
                    $scope.valueStyle = {};
                    $scope.classes = {};
                }
            });
        }
    };
}

pointValue.$inject = ['$filter', 'mangoDefaultDateFormat'];
return pointValue;

}); // define
