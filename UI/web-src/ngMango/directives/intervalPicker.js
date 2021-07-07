/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import intervalPickerTemplate from './intervalPicker.html';

function intervalPicker() {
    return {
        restrict: 'E',
        scope: {
            interval: '='
        },
        replace: true,
        template: intervalPickerTemplate,
        link: function ($scope, $element, attr) {
            $scope.intervals = 1;
            $scope.type = 'MINUTES';
            
            $scope.$watchGroup(['intervals', 'type'], function() {
                $scope.interval = $scope.intervals + ' ' + $scope.type;
            });
        },
        designerInfo: {
            translation: 'ui.components.intervalPicker',
            icon: 'date_range'
        }
    };
}

intervalPicker.$inject = [];

export default intervalPicker;


