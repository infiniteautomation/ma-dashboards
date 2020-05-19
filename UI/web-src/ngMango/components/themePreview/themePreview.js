/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import themePreviewTemplate from './themePreview.html';
import './themePreview.css';

const palettes = ['primary', 'accent', 'warn', 'background'];

class ThemePreviewController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', 'maTheming']; }
    
    constructor($element, maTheming) {
        this.$element = $element;
        this.maTheming = maTheming;
    }
    
    $onChanges(changes) {
        if (changes.theme && this.theme) {
            this.maTheming.themeElement(this.$element[0], this.theme);
        }
    }
}

export default {
    bindings: {
        theme: '@'
    },
    controller: ThemePreviewController,
    template: themePreviewTemplate
};
