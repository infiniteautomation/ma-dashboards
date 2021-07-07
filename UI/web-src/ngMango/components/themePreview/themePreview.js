/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import themePreviewTemplate from './themePreview.html';
import './themePreview.css';

class ThemePreviewController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', 'maTheming']; }
    
    constructor($element, maTheming) {
        this.$element = $element;
        this.maTheming = maTheming;
        this.themes = maTheming.getThemes();
        this.paletteNames = maTheming.getPaletteNames();
    }

    $doCheck() {
        this.themeObj = this.themes[this.theme];
        if (this.themeObj !== this.prevThemeObj) {
            this.getColors();
            this.prevThemeObj = this.themeObj;
        }
    }
    
    getColors() {
        this.colors = this.paletteNames.map(palette => {
            const colors = this.maTheming.getThemeColors({
                theme: this.theme,
                palette,
                hue: 'default'
            });

            return {
                color: colors.color,
                contrast: colors.contrast,
                style: {'background-color': colors.color, color: colors.contrast}
            };
        });
    }
}

export default {
    bindings: {
        theme: '@'
    },
    controller: ThemePreviewController,
    template: themePreviewTemplate
};
