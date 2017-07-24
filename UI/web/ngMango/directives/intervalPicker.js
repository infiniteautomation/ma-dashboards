/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

function intervalPicker() {
    return {
        restrict: 'E',
        scope: {
            interval: '='
        },
        replace: true,
        templateUrl: require.toUrl('./intervalPicker.html'),
        link: function ($scope, $element, attr) {
        	$scope.intervals = 1;
        	$scope.type = 'MINUTES';
        	
        	$scope.$watchGroup(['intervals', 'type'], function() {
        		$scope.interval = $scope.intervals + ' ' + $scope.type;
        	});
        },
        designerInfo: {
            translation: 'ui.components.intervalPicker',
            icon: 'date_range'
        }
    };
}

intervalPicker.$inject = [];

return intervalPicker;

}); // define
