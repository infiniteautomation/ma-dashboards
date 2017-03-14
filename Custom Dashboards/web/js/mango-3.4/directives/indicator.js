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

    var value = this.getValue();
    var color = '';

    // jshint eqnull:true
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
