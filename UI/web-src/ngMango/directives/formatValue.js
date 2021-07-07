/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import moment from 'moment-timezone';

formatValue.$inject = ['$parse'];
function formatValue($parse) {
    return {
        require: ['ngModel', '^?mdInputContainer'],
        restrict: 'A',
        priority: 1,
        link: function($scope, $element, $attrs, [ngModel, containerCtrl]) {
            if (!$attrs.maFormatValue) return;
            
            const expression = $parse($attrs.maFormatValue);
            
            ngModel.$formatters.push(value => {
                const result = expression($scope, {$value: value, $Math: Math, $Number: Number, $moment: moment});
                if (containerCtrl) {
                    // TODO check if this is needed anymore after increasing priority
                    
                    // the mdInputContainer adds a formatter which runs before this one which sets the
                    // .md-input-has-value class, work around by setting it again
                    containerCtrl.setHasValue(!ngModel.$isEmpty(result));
                }
                return result;
            });
        }
    };
}

export default formatValue;