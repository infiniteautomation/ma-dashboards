/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import switchTemplate from './switch.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maSwitch
 * @restrict E
 * @description
 * `<ma-switch></ma-switch>`
 * - This component will display a switch that can be used to toggle a binary data point's value.
 * - It can be set to display either radio buttons, checkbox or toggle switch.
 * @param {object=} point A data point object from a watch list, point query, point drop-down, `maPoint` service, or `<ma-get-point-value>` component.
 * @param {string=} point-xid Instead of supplying a data point object, you can supply it's XID.
 * @param {string} display-type Sets the display type of the binary switch. Options are `radio`, `checkbox` or `switch`.
 * @usage
 * <ma-switch point="myPoint" display-type="switch"></ma-switch>
 *
 */

switchDirective.$inject = ['maPointValueController'];
function switchDirective(PointValueController) {

    class SwitchController extends PointValueController {
        
        constructor() {
            super(...arguments);
            this.showValue = true;
        }

        $onInit() {
            if (!this.displayType) {
                this.displayType = 'switch';
            }
        }
    
        valueChangeHandler() {
            super.valueChangeHandler(...arguments);

            this.currentValue = this.getValue();
            
            if (this.point) {
                const renderer = this.point.getTextRenderer();
                const falseRendered = renderer.render(false);
                const trueRendered = renderer.render(true);

                this.falseText = falseRendered.text;
                this.falseStyle = {color: falseRendered.color};
                this.trueText = trueRendered.text;
                this.trueStyle = {color: trueRendered.color};
            } else {
                delete this.falseText;
                delete this.falseStyle;
                delete this.trueText;
                delete this.trueStyle;
            }
        }
    
        inputValue(setValue) {
            if (setValue != null) {
                if (this.point) {
                    this.point.setValue(setValue);
                }
            } else {
                return this.currentValue;
            }
        }
    }
    
    return {
        restrict: 'E',
        template: switchTemplate,
        scope: {},
        controller: SwitchController,
        controllerAs: '$ctrl',
        bindToController: {
            showValue: '<?',
            point: '<?',
            pointXid: '@?',
            displayType: '@?',
            labelAttr: '@?label',
            labelExpression: '&?'
        },
        designerInfo: {
            translation: 'ui.components.switch',
            icon: 'check_circle',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint', pointType: 'BINARY'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid', pointType: 'BINARY'},
                displayType: {options: ['switch', 'checkbox', 'radio']},
                label: {options: ['NAME', 'DEVICE_AND_NAME', 'DEVICE_AND_NAME_WITH_TAGS']}
            }
        }
    };
}

export default switchDirective;
