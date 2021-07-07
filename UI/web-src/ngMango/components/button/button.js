/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import buttonTemplate from './button.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maButton
 *
 * @description
 * `<ma-button></ma-button>`
 * - This component displays a button that can be configured with built in functionality such as linking to a page,
 * uploading a file, and displaying a tooltip.
 *
 * @param {string=} label The label to display on the button
 * @param {string=} label-tr The translation key to use for the label rather than hardcoded `label`
 * @param {*[]=} label-tr-args Array of argument objects to pass to the translation key
 * @param {string=} tooltip Text to use in a tooltip
 * @param {string=} tooltip-tr The translation key to use for the tooltip rather than hardcoded `tooltip`
 * @param {string=} icon A <a href="https://material.io/icons/" target="_blank">material icon</a> (`home`, `text_fields`) to use
 * in the button. Note spaces in icon name should be replaced with underscore.
 * @param {string=} palette The color palette from the dashboards theme to use for the button. Options are `primary`, `accent`,
 * or `warn`
 * @param {string=} hue The hue or the selected color palette to use for the button. Options are `hue-1`, `hue-2`,
 * or `hue-3`
 * @param {boolean=} raised If set to `true` the button will display with a color filled background
 * @param {string=} ma-choose-file Set to an expression and the file browser dialog will open. After selecting a file the
 * `$url` variable will contain the path to the file
 *
 * @usage
 * <ma-button label="Upload" tooltip="Upload File" raised="true" hue="hue-2" palette="primary" icon="home"
 * ma-choose-file="fileUrl = $url"></ma-button>
 *
 **/
const button = {
    controller: ButtonController,
    template: buttonTemplate,
    bindings: {
        icon: '@?',
        label: '@?',
        tooltip: '@?',
        raised: '<?',
        palette: '@?',
        hue: '@?',
        labelTr: '@?',
        labelTrArgs: '<?',
        tooltipTr: '@?'
    },
    designerInfo: {
        category: 'basic',
        icon: 'touch_app',
        translation: 'dashboardDesigner.button',
        attributes: {
            raised: {type: 'boolean', defaultValue: true},
            palette: {options: ['primary', 'accent', 'warn']},
            hue: {options: ['hue-1', 'hue-2', 'hue-3']},
            uiSref: { type: 'state-name'},
            maChooseFile: {},
            maChooseFileSelected: {},
            maChooseFileOptions: {}
        }
    }
};

ButtonController.$inject = [];
function ButtonController() {
}

ButtonController.prototype.$onInit = function() {
};

ButtonController.prototype.$onChanges = function(changes) {
    this.classes = {
        'md-icon-button': this.icon && !(this.label || this.labelTr),
        'md-warn': this.palette === 'warn',
        'md-accent': this.palette === 'accent',
        'md-primary': this.palette === 'primary',
        'md-hue-1': this.hue === 'hue-1',
        'md-hue-2': this.hue === 'hue-2',
        'md-hue-3': this.hue === 'hue-3',
        'md-raised': this.raised
    };
};

export default button;
