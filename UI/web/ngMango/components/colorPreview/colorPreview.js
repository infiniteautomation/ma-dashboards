/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import requirejs from 'requirejs/require';

var hues = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'A100', 'A200', 'A400', 'A700'];
var namedHues = ['default', 'hue-1', 'hue-2', 'hue-3'];

ColorPreviewController.$inject = ['$mdColors'];
function ColorPreviewController($mdColors) {
    this.theme = '';
    
    this.$onChanges = function(changes) {
        if (changes.palette || changes.theme || changes.allHues) {
            this.colors = this.allHues ? this.huesToColorStrings(hues) : this.huesToColorStrings(namedHues);
        }
    };
    
    this.huesToColorStrings = function(hues) {
        var colors = [];
        var prefix = this.theme ? this.theme + '-' : '';
        for (var i = 0; i < hues.length; i++) {
            var hue = hues[i];
            var suffix = hue === 'default' ? '' : '-' + hue;
            var colorExpression = prefix + this.palette + suffix;
            colors.push({
                name: hue,
                cssColor: this.toHex($mdColors.getThemeColor(colorExpression)),
                spec: colorExpression
            });
        }
        return colors;
    };
    
    this.toHex = function toHex(rgbaString) {
        var matches = /^rgba\((.+?)\)$/.exec(rgbaString);
        if (matches && matches.length === 2) {
            var split = matches[1].split(/\s*,\s*/);
            if (split.length < 3) return rgbaString;
            var result = '#';
            for (var i = 0; i < 3; i++) {
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
    templateUrl: requirejs.toUrl('./colorPreview.html')
};
