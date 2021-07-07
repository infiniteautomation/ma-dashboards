/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

//you can't use this directive as is, you must bind eventName and directiveName to the function
eventHandler.$inject = ['$parse', '$rootScope'];
function eventHandler(eventName, directiveName, $parse, $rootScope) {
    return {
        restrict: 'A',
        compile: function($element, attr) {
            const fn = $parse(attr[directiveName]);
            return function(scope, element) {
                element.on(eventName, (event) => {
                    scope.$apply(() => {
                        fn(scope, {$event: event});
                    });
                });
            };
        }
    };
}

export default eventHandler;
