/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maCopyBlurred
 * @restrict A
 * @description
 * `<input type="text" ng-model="input.value" ma-copy-blurred="point.value">`
 * - Copies the live value from a point to an input when it is not in focus.
 * - Used within `<ma-set-point-value>` to prevent the value from changing when typing in an input.
 *
 * @param {object} ma-copy-blurred The live value
 * @param {object} ng-model The inputs value
 *
 * @usage
 * <input type="text" ng-model="input.value" ma-copy-blurred="point.value" ng-disabled="!point.pointLocator.settable">
 */
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
