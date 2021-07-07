/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

formatArray.$inject = ['$parse'];
function formatArray($parse) {
    return {
        require: ['ngModel', '^?mdInputContainer'],
        restrict: 'A',
        link: function($scope, $element, $attrs, [ngModel, containerCtrl]) {
            if (!$attrs.maFormatArray) return;
            
            const expression = $parse($attrs.maFormatArray);
            const method = $attrs.maFormatArrayMethod || 'map';

            ngModel.$formatters.push(value => {
                if (!Array.isArray(value)) return value;

                const result = value[method](($item, $index, $array) => {
                    return expression($scope, {$item, $index, $array, $args: arguments});
                });
                
                if (containerCtrl) {
                    // the mdInputContainer adds a formatter which runs before this one which sets the
                    // .md-input-has-value class, work around by setting it again
                    containerCtrl.setHasValue(!ngModel.$isEmpty(result));
                }
                
                return result;
            });
        }
    };
}

export default formatArray;