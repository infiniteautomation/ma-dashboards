/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maSwitch
 * @restrict E
 * @description
 * `<ma-switch></ma-switch>`
 * - This component will display a switch that can be used to toggle a binary data point's value.
 * - It can be set to display either radio buttons, checkbox or toggle switch.
 * @param {point} point Select the point to use with the switch by passing in a point object.
 * @param {string} point-xid Select the point to use with the switch by passing in a point's xid as a string.
 * @param {string} display-type Sets the display type of the binary switch. Options are `radio`, `checkbox` or `switch`.
 * @usage
 * <ma-switch point="myPoint" display-type="switch"></ma-switch>
 *
 */

define(['angular', 'require', './PointValueController'], function(angular, require, PointValueController) {
'use strict';

function switchDirective() {
    return {
        restrict: 'E',
        templateUrl: require.toUrl('./switch.html'),
        scope: {},
        controller: SwitchController,
        controllerAs: '$ctrl',
        bindToController: {
            point: '<?',
            pointXid: '@?',
            displayType: '@?'
        },
        designerInfo: {
            translation: 'ui.components.switch',
            icon: 'check_circle',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint', pointType: 'BINARY'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid', pointType: 'BINARY'},
                displayType: {options: ['switch', 'checkbox', 'radio']}
            }
        }
    };
}

SwitchController.$inject = PointValueController.$inject.concat('maUtil');
function SwitchController() {
    PointValueController.apply(this, arguments);
    var firstArg = PointValueController.$inject.length;

    this.Util = arguments[firstArg];
}

SwitchController.prototype = Object.create(PointValueController.prototype);
SwitchController.prototype.constructor = SwitchController;

SwitchController.prototype.$onInit = function() {
    if (!this.displayType) {
        this.displayType = 'switch';
    }
};

SwitchController.prototype.valueChangeHandler = function() {
    PointValueController.prototype.valueChangeHandler.apply(this, arguments);

    this.currentValue = this.getValue();
    
    if (this.point) {
        var falseRenderer = this.point.valueRenderer(false);
        var trueRenderer = this.point.valueRenderer(true);
        
        if (falseRenderer) {
            this.falseText = falseRenderer.text;
            this.falseStyle = {color: falseRenderer.colour || falseRenderer.color};
        }
        if (trueRenderer) {
            this.trueText = trueRenderer.text;
            this.trueStyle = {color: trueRenderer.colour || trueRenderer.color};
        }
    } else {
        delete this.falseText;
        delete this.falseStyle;
        delete this.trueText;
        delete this.trueStyle;
    }
};

SwitchController.prototype.inputValue = function(setValue) {
    if (setValue != null) {
        if (this.point) {
            this.point.setValue(setValue);
        }
    } else {
        return this.currentValue;
    }
};

return switchDirective;

}); // define
