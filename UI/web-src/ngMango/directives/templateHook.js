/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

templateHookDirective.$inject = ['maTemplateHooks', '$compile'];
function templateHookDirective(maTemplateHooks, $compile) {
    return {
        restrict: 'A',
        priority: 400,
        terminal: true,
        scope: true,
        link: function($scope, $element, attrs) {
            const hookName = attrs.maTemplateHook;
            if (hookName && maTemplateHooks.hasHook(hookName)) {
                const template = maTemplateHooks.getTemplate(hookName);
                $element.html(template);
                $compile($element.contents())($scope);
            } else {
                $element.empty();
            }
        }
    };
}

export default templateHookDirective;