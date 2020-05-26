/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
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