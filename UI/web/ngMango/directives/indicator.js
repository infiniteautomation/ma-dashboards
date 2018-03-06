/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import PointValueController from './PointValueController';

function indicator() {
    return {
        restrict: 'E',
        scope: {},
        controller: IndicatorController,
        bindToController: {
            toggleOnClick: '<?',
            point: '<?',
            pointXid: '@?',
            value: '<?',
            renderValue: '&?'
        },
        designerInfo: {
            translation: 'ui.components.indicator',
            icon: 'flare',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid'},
                toggleOnClick: {type: 'boolean'},
                colorTrue: {
                    type: 'color'
                },
                colorFalse: {
                    type: 'color'
                },
                defaultColor: {
                    type: 'color'
                }
            },
            size: {
                width: '30px',
                height: '30px'
            }
        }
    };
}

IndicatorController.$inject = PointValueController.$inject.concat('maUtil');
function IndicatorController() {
    PointValueController.apply(this, arguments);
    var firstArg = PointValueController.$inject.length;

    this.Util = arguments[firstArg];
}

IndicatorController.prototype = Object.create(PointValueController.prototype);
IndicatorController.prototype.constructor = IndicatorController;

IndicatorController.prototype.$onChanges = function(changes) {
    PointValueController.prototype.$onChanges.apply(this, arguments);
    
    if (changes.toggleOnClick) {
        if (this.toggleOnClick) {
            this.$element.on('click.maIndicator', this.clickHandler.bind(this));
            this.$element.attr('role', 'button');
        } else {
            this.$element.off('click.maIndicator');
            this.$element.removeAttr('role');
        }
    }
};

IndicatorController.prototype.valueChangeHandler = function() {
    PointValueController.prototype.valueChangeHandler.apply(this, arguments);

    var value = this.getValue();
    var color;

    if (value != null) {
        var attrName = this.Util.camelCase('color-' + value);
        color = this.$attrs[attrName];
        
        if (!color && this.point) {
            var renderer = this.point.valueRenderer(value);
            color = renderer.colour || renderer.color;
        }
        
        if (!color) {
            color = this.$attrs.defaultColor;
        }
    }
    this.$element.css('background-color', color || '');

    if (this.point && this.point.pointLocator && !this.point.pointLocator.settable) {
        this.$element.attr('disabled', 'disabled');
    } else {
        this.$element.removeAttr('disabled');
    }
};

IndicatorController.prototype.clickHandler = function() {
    if (this.point && !this.$element.attr('disabled')) {
        this.point.toggleValue();
    }
};

export default indicator;
