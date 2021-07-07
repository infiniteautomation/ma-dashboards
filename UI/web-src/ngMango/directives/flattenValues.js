/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

flattenValues.$inject = ['$parse', 'maMultipleValues', '$compile'];
function flattenValues($parse, MultipleValues, $compile) {
    
    const msgTemplate = `<div class="ma-small-text" ng-if="ngModel.$modelValue.hasMultipleValues()">
                            <em ng-bind="ngModel.$modelValue.toString()"></em>
                         </div>`;
    
    const linkFn = $compile(msgTemplate);
    
    return {
        require: ['ngModel', '^?mdInputContainer'],
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs, [ngModel, containerCtrl]) {
            let expression;
            if ($attrs.maFlattenValues) {
                expression = $parse($attrs.maFlattenValues);
            }
            
            if ($element[0].tagName === 'INPUT' && $attrs.type === 'number' && $element.parent()[0].tagName === 'MD-INPUT-CONTAINER' ||
                    $element[0].tagName === 'MD-CHECKBOX') {
                
                const scope = $scope.$new(true);
                scope.ngModel = ngModel;
                linkFn(scope, (cloned, scope) => {
                    if ($element[0].tagName === 'MD-CHECKBOX') {
                        $element.maFind('div.md-label').append(cloned);
                    } else {
                        $element.parent().append(cloned);
                    }
                });
            }
            
            ngModel.$formatters.push(function multipleValueFormatter(value) {
                if (value instanceof MultipleValues) {
                    let result;
                    if (expression) {
                        result = expression($scope, {$values: value});
                    }
                    if (containerCtrl) {
                        // the mdInputContainer adds a formatter which runs before this one which sets the
                        // .md-input-has-value class, work around by setting it again
                        containerCtrl.setHasValue(!ngModel.$isEmpty(result));
                    }
                    return result;
                }
                return value;
            });
        }
    };
}

export default flattenValues;