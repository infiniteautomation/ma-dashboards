/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function copyBlurred() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
        	maCopyBlurred: '=',
            ngModel: '='
        },
        link: function ($scope, $element) {
            $scope.$watch('maCopyBlurred', function(value) {
            	if (!$element.is(":focus")) {
            		$scope.ngModel = value;
            	}
            });
        }
    };
}

return copyBlurred;

}); // define
