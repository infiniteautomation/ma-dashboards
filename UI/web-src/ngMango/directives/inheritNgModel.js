/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

inheritNgModel.$inject = [];
function inheritNgModel() {
    return {
        require: '^ngModel',
        restrict: 'A',
        priority: 1,
        link: {
            pre: function($scope, $element, $attrs, ngModel) {
                $element.data('$ngModelController', ngModel);
            }
        }
    };
}

export default inheritNgModel;