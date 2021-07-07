/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import colorPreviewTemplate from './colorPreview.html';

class ColorPreviewController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', 'maTheming']; }
    
    constructor($element, maTheming) {
        this.$element = $element;
        this.maTheming = maTheming;
        this.themes = maTheming.getThemes();
        this.hueNames = maTheming.getHueNames();
    }
    
    $onChanges(changes) {
        if (changes.palette || changes.theme || changes.allHues) {
            this.prevThemeObj = this.themeObj = this.themes[this.theme];
            this.getColors();
        }
    }
    
    $doCheck() {
        this.themeObj = this.themes[this.theme];
        if (this.themeObj !== this.prevThemeObj) {
            this.getColors();
            this.prevThemeObj = this.themeObj;
        }
    }
    
    getColors() {
        if (this.allHues) {
            this.colors = this.huesToColors(this.hueNames.slice(4));
        } else {
            this.colors = this.huesToColors(this.hueNames.slice(0, 4));
        }
    }
    
    huesToColors(hues) {
        return hues.map(hue => {
            const colors = this.maTheming.getThemeColors({
                theme: this.theme,
                palette: this.palette,
                hue
            });

            return {
                name: hue,
                color: colors.color,
                contrast: colors.contrast,
                style: {'background-color': colors.color, color: colors.contrast}
            };
        });
    }
}

export default {
    bindings: {
        theme: '@',
        palette: '@',
        allHues: '<?'
    },
    controller: ColorPreviewController,
    template: colorPreviewTemplate
};
