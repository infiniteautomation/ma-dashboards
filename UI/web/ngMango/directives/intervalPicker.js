/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import requirejs from 'requirejs/require';


function intervalPicker() {
    return {
        restrict: 'E',
        scope: {
            interval: '='
        },
        replace: true,
        templateUrl: requirejs.toUrl('./intervalPicker.html'),
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


