/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */



/**
 * @ngdoc directive
 * @name ngMango.directive:maFn
 *
 * @description
 * `<ma-fn expression="" fn="myFunction" ready="" arg-names=""></ma-fn>`
 * - This directive allows you to evaluate an Angular expression and store the result in a variable.
 * - In the example below an array from the model is passed through a filter on the name property of objects in the array.
 *
 *
 * @param {expression} expression Expression to store as a function.
 * @param {object} fn Variable to hold the evaluated function.
 * @param {object=} ready doc
 * @param {object=} arg-names doc
 *
 * @usage
 * <ma-fn expression="" fn="myFunction" ready="" arg-names="">
 * </ma-fn>
 */
maFnDirective.$inject = ['$parse'];
function maFnDirective($parse) {
    return {
        scope: {
            fn: '=',
            ready: '=?',
            argNames: '=?'
        },
    	compile: function($element, attrs) {
    		var parsed = $parse(attrs.expression);

    		return function($scope, $element, attrs) {
    			$scope.fn = argMatch.bind(null, parsed, $scope.$parent, $scope.argNames);
    			$scope.ready = true;
            };

            function argMatch(parsedFn, context, argNames) {
                var overrides = {};
                for (var i = 3; i < arguments.length; i++) {
                    var argNumber = i - 3;
                    var argName = argNames && argNames.length > argNumber && argNames[argNumber] || 'arg' + argNumber;
                    overrides[argName] = arguments[i];
                }
                return parsedFn(context, overrides);
            }
    	},
        designerInfo: {
            translation: 'ui.components.maFn',
            icon: 'transform'
        }
    };
}

export default maFnDirective;


