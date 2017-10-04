/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', './PointValueController'], function(angular, PointValueController) {
'use strict';

function barDisplay() {
    return {
        restrict: 'E',
        template: '<div class="bar-display-fill" ng-style="$ctrl.style"></div>',
        scope: {},
        controller: BarDisplayController,
        controllerAs: '$ctrl',
        bindToController: {
            point: '<?',
            pointXid: '@?',
            direction: '@?',
            maximum: '<?',
            minimum: '<?',
            value: '<?',
            renderValue: '&?'
        },
        designerInfo: {
            translation: 'ui.components.barDisplay',
            icon: 'insert_chart',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid'},
                direction: {
                    options: ['left-to-right', 'bottom-to-top', 'right-to-left', 'top-to-bottom']
                }
            },
            size: {
                width: '200px',
                height: '30px'
            }
        }
    };
}

BarDisplayController.$inject = PointValueController.$inject;
function BarDisplayController() {
    PointValueController.apply(this, arguments);
    
    this.style = {};
}

BarDisplayController.prototype = Object.create(PointValueController.prototype);
BarDisplayController.prototype.constructor = BarDisplayController;

BarDisplayController.prototype.$onChanges = function(changes) {
    PointValueController.prototype.$onChanges.apply(this, arguments);
    
    if (changes.maximum || changes.minimum || changes.direction) {
        this.updateBar();
    }
};

BarDisplayController.prototype.valueChangeHandler = function() {
    PointValueController.prototype.valueChangeHandler.apply(this, arguments);
    
    this.updateBar();
};

BarDisplayController.prototype.updateBar = function() {
    var value = this.getValue() || 0;
    
    var maximum = this.maximum || 100;
    var minimum = this.minimum || 0;
    var range = maximum - minimum;
    var percent = ((value - minimum) / range * 100) + '%';
    
    delete this.style.top;
    delete this.style.bottom;
    delete this.style.left;
    delete this.style.right;

    if (this.direction === 'bottom-to-top') {
        this.style.height = percent;
        this.style.width = '100%';
        this.style.bottom = 0;
    } else if (this.direction === 'top-to-bottom') {
        this.style.height = percent;
        this.style.width = '100%';
        this.style.top = 0;
    } else if (this.direction === 'right-to-left') {
        this.style.width = percent;
        this.style.height = '100%';
        this.style.right = 0;
    } else {
        this.style.width = percent;
        this.style.height = '100%';
    }
};

return barDisplay;

}); // define
