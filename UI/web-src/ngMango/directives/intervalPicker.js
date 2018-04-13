/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import intervalPickerTemplate from './intervalPicker.html';

function intervalPicker() {
    return {
        restrict: 'E',
        scope: {
            interval: '='
        },
        replace: true,
        template: intervalPickerTemplate,
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

export default intervalPicker;


