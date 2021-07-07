/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maFn
 *
 * @description
 * Parses an AngularJS expression and stores the result as a function which can then be used elsewhere on the page. This can be useful for example
 * when calling Array prototype functions such as .map() and .filter() which require you to pass a function as an argument.
 * 
 * @param {expression} expression Expression to parse and store as a function
 * @param {function} fn Variable to output the generated function to
 * @param {object=} ready Set to true when the function is ready to use
 * @param {string[]=} arg-names Array of argument names which will be made available to use in the expression. If the argument names
 * are not supplied they will be given default names of arg0, arg1, arg2 etc.
 * @param {boolean|number=} memoize Memorizes the inputs and returns a cached result for the function, useful for preventing digest loops.
 * If set to a number sets the cache size.
 *
 * @usage
 * <ma-fn arg-names="::['item']" expression="item.id" fn="getId"></ma-fn>
 * <ma-point-query query="{name: 'test'}" points-changed="page.pointIds = $points.map(getId)"></ma-point-query>
 */
maFnDirective.$inject = ['$parse', 'maUtil'];
function maFnDirective($parse, maUtil) {
    return {
        scope: {
            fn: '=',
            ready: '=?',
            argNames: '<?',
            memoize: '<?'
        },
        compile: function($element, attrs) {
            const parsed = $parse(attrs.expression);

            return function($scope, $element, attrs) {
                const fn = function() {
                    const overrides = {};
                    
                    for (let i = 0; i < arguments.length; i++) {
                        const argName = Array.isArray($scope.argNames) && $scope.argNames[i] || 'arg' + i;
                        overrides[argName] = arguments[i];
                    }
                    
                    return parsed($scope.$parent, overrides);
                };

                $scope.fn = $scope.memoize ? maUtil.memoize(fn, $scope.memoize) : fn;
                $scope.ready = true;
            };
        },
        designerInfo: {
            translation: 'ui.components.maFn',
            icon: 'transform'
        }
    };
}

export default maFnDirective;
