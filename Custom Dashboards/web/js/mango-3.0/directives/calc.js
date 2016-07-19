/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */



define([], function() {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maCalc
 * @restrict E
 * @description
 * `<ma-calc input="" output="">` - This directive allows you to evaluate an Angular expression and store the result in a variable.
 *
 * ## input
 * - The `input` attribute takes in the expression to store
 * - In the example below an array from the model is passed through a filter on the name property of objects in the array.
 *
 * ## output
 * - The `output` attribute defines the name of the variable to hold the result of the evaluated expression.
 * - Once evaluated it will be availble to use anywhere in your App.
 *
 * @usage
 * <ma-calc input="points | filter:{name:'Real Power ' + phase + ' (kW)'} | first" output="power">
 * </ma-calc>
 */
function calc() {
    return {
        scope: {
            output: '='
        },
        link: function($scope, $element, attr) {
        	var deregister = $scope.$parent.$watch(attr.input, function(newValue) {
            	$scope.output = newValue;
    		});
        	$scope.$on('$destroy', deregister);
        }
    };
}

calc.$inject = [];

return calc;

}); // define
