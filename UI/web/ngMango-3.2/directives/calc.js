/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */



define([], function() {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.directive:maCalc
 *
 * @description
 * `<ma-calc input="" output=""></ma-calc>`
 * - This directive allows you to evaluate an Angular expression and store the result in a variable.
 * - In the example below an array from the model is passed through a filter on the name property of objects in the array.
 *
 *
 * @param {expression} input The expression to be evaluated
 * @param {object} output Declare a variable to hold the result of the evaluated expression.
 *
 * @usage
 * <ma-calc input="points | filter:{name:'Real Power ' + phase + ' (kW)'} | maFirst" output="power">
 * </ma-calc>
 */
function calc() {
    return {
        scope: {
            output: '=?',
            onChange: '&?'
        },
        link: function($scope, $element, attr) {
        	var deregister = $scope.$parent.$watch(attr.input, function(newValue) {
            	$scope.output = newValue;
            	if ($scope.onChange) {
            	    $scope.onChange({$value: newValue});
            	}
    		});
        	$scope.$on('$destroy', deregister);
        }
    };
}

calc.$inject = [];

return calc;

}); // define
