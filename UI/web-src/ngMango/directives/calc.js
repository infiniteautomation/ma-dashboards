/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */





/**
 * @ngdoc directive
 * @name ngMango.directive:maCalc
 *
 * @description
 * `<ma-calc input="points | filter:{name:'Energy Accumulator (kWh)'} | maFirst" output="energy"></ma-calc>`
 * - This directive allows you to evaluate an Angular expression and store the result in a variable.
 * - In the example below an array from the model is passed through a filter on the name property of objects in the array.
 *
 *
 * @param {expression} input The expression to be evaluated
 * @param {object} output Declare a variable to hold the result of the evaluated expression.
 * @param {function} onChange Pass in a function or expression to be called when the input is changed.
 * `$value` object will contain the `output`
 *
 * @usage
 * <ma-calc input="points | filter:{name:'Real Power ' + phase + ' (kW)'} | maFirst" output="power" on-change="myVar = $value">
 * </ma-calc>
 */
function calc() {
    return {
        scope: {
            output: '=?',
            onChange: '&?'
        },
        link: function($scope, $element, attr) {
            const deregister = $scope.$parent.$watch(attr.input, function(newValue) {
                $scope.output = newValue;
                if ($scope.onChange) {
                    $scope.onChange({$value: newValue});
                }
            });
            $scope.$on('$destroy', deregister);
        },
        designerInfo: {
            translation: 'ui.components.maCalc',
            icon: 'add',
            attributes: {
                input: {type: 'string'}
            }
        }
    };
}

calc.$inject = [];

export default calc;


