/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
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
            translation: 'dashboards.v3.components.switch',
            icon: 'check_circle',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'dashboards.v3.app.dataPoint', type: 'datapoint', pointType: 'BINARY'},
                pointXid: {nameTr: 'dashboards.v3.components.dataPointXid', type: 'datapoint-xid', pointType: 'BINARY'},
                displayType: {options: ['switch', 'checkbox', 'radio']}
            }
        }
    };
}

SwitchController.$inject = PointValueController.$inject.concat('Util');
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
    // jshint eqnull:true
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
