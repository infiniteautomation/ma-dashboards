/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', './PointValueController'], function(angular, PointValueController) {
'use strict';

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
    // jshint eqnull:true
    var value = 0;
    if (this.value != null) {
        value = this.value;
    } else if (this.point && this.point.convertedValue != null) {
        value = this.point.convertedValue;
    } else if (this.point && this.point.value != null) {
        value = this.point.value;
    }
    
    var maximum = this.maximum || 100;
    var minimum = this.minimum || 0;
    var range = maximum - minimum;
    var percent = (value / range * 100) + '%';
    
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

function barDisplay() {
    return {
        restrict: 'E',
        designerInfo: {
            translation: 'dashboards.v3.components.barDisplay',
            icon: 'trending_flat',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'dashboards.v3.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'dashboards.v3.components.dataPointXid', type: 'datapoint-xid'},
                direction: {
                    options: ['left-to-right', 'bottom-to-top', 'right-to-left', 'top-to-bottom']
                }
            },
            size: {
                width: '200px',
                height: '30px'
            }
        },
        bindToController: {
            point: '<?',
            pointXid: '@?',
            direction: '@?',
            maximum: '<?',
            minimum: '<?',
            value: '<?'
        },
        template: '<div class="bar-display-fill" ng-style="$ctrl.style"></div>',
        scope: {},
        controller: BarDisplayController,
        controllerAs: '$ctrl'
    };
}

return barDisplay;

}); // define
