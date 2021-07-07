/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

applyThemeDirective.$inject = ['maTheming'];
function applyThemeDirective(maTheming) {
    
    class ApplyThemeController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$element']; }
        
        constructor($element) {
            this.$element = $element;
        }

        $doCheck() {
            const theme = maTheming.getThemes()[this.theme];
            if (theme !== this.prevTheme) {
                maTheming.themeElement(this.$element[0], this.theme);
                this.prevTheme = theme;
            }
        }
    }

    return {
        restrict: 'A',
        controller: ApplyThemeController,
        bindToController: {
            theme: '@maApplyTheme'
        },
        scope: false
    };
}

export default applyThemeDirective;