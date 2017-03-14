/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', './PointValueController'], function(angular, PointValueController) {
'use strict';

IndicatorController.$inject = PointValueController.$inject.concat('Util');
function IndicatorController() {
    PointValueController.apply(this, arguments);
    var firstArg = PointValueController.$inject.length;

    this.Util = arguments[firstArg];
}

IndicatorController.prototype = Object.create(PointValueController.prototype);
IndicatorController.prototype.constructor = IndicatorController;

IndicatorController.prototype.valueChangeHandler = function() {
    PointValueController.prototype.valueChangeHandler.apply(this, arguments);
    
    // jshint eqnull:true
    var value;
    if (this.value != null) {
        value = this.value;
    } else if (this.point && this.point.convertedValue != null) {
        value = this.point.convertedValue;
    } else if (this.point && this.point.value != null) {
        value = this.point.value;
    }
    
    var color = '';
    if (value != null) {
        var attrName = this.Util.camelCase('color-' + value);
        color = this.$attrs[attrName];
    }
    this.$element.css('background-color', color);
};

function indicator() {
    return {
        restrict: 'E',
        designerInfo: {
            translation: 'dashboards.v3.components.indicator',
            icon: 'lightbulb_outline',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'dashboards.v3.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'dashboards.v3.components.dataPointXid', type: 'datapoint-xid'},
                colorTrue: {
                    type: 'color'
                },
                colorFalse: {
                    type: 'color'
                }
            },
            size: {
                width: '30px',
                height: '30px'
            }
        },
        bindToController: {
            point: '<?',
            pointXid: '@?',
            value: '<?'
        },
        scope: {},
        controller: IndicatorController
    };
}

return indicator;

}); // define
