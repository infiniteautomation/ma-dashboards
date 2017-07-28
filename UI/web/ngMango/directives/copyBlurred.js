/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.directive:maCopyBlurred
 * @restrict A
 * @description
 * `<input type="text" ng-model="input.value" ma-copy-blurred="point.value">`
 * - Restricted to be used as an attribute on an input.
 * - Copies the live value from a point to an input when it is not in focus.
 * - Used within `<ma-set-point-value>` to prevent the value from changing when typing in an input.
 *
 * @param {object} ng-model The input's value
 * @param {object} ma-copy-blurred The live value
 *
 * @usage
 * <input type="text" ng-model="input.value" ma-copy-blurred="point.value">
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
            	if (!$element.is(':focus')) {
            		$scope.ngModel = value;
            	}
            });
        }
    };
}

return copyBlurred;

}); // define
