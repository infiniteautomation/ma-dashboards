/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import colorPreviewTemplate from './colorPreview.html';

const hues = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'A100', 'A200', 'A400', 'A700'];
const namedHues = ['default', 'hue-1', 'hue-2', 'hue-3'];

ColorPreviewController.$inject = ['$mdColors'];
function ColorPreviewController($mdColors) {
    this.theme = '';
    
    this.$onChanges = function(changes) {
        if (changes.palette || changes.theme || changes.allHues) {
            this.colors = this.allHues ? this.huesToColorStrings(hues) : this.huesToColorStrings(namedHues);
        }
    };
    
    this.huesToColorStrings = function(hues) {
        const colors = [];
        const prefix = this.theme ? this.theme + '-' : '';
        for (let i = 0; i < hues.length; i++) {
            const hue = hues[i];
            const suffix = hue === 'default' ? '' : '-' + hue;
            const colorExpression = prefix + this.palette + suffix;
            colors.push({
                name: hue,
                cssColor: this.toHex($mdColors.getThemeColor(colorExpression)),
                spec: colorExpression
            });
        }
        return colors;
    };
    
    this.toHex = function toHex(rgbaString) {
        const matches = /^rgba\((.+?)\)$/.exec(rgbaString);
        if (matches && matches.length === 2) {
            const split = matches[1].split(/\s*,\s*/);
            if (split.length < 3) return rgbaString;
            let result = '#';
            for (let i = 0; i < 3; i++) {
                result += ('0' + parseInt(split[i], 10).toString(16)).slice(-2);
            }
            return result.toUpperCase();
        }
        return rgbaString;
    };
}

export default {
    bindings: {
        theme: '@',
        palette: '@',
        allHues: '<'
    },
    controller: ColorPreviewController,
    template: colorPreviewTemplate
};
