/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

var SUBSCRIPTION_TYPES = ['REGISTERED', 'UPDATE', 'TERMINATE', 'INITIALIZE'];

PointValueController.$inject = ['$scope', '$element', '$attrs', 'pointEventManager', 'Point'];
function PointValueController($scope, $element, $attrs, pointEventManager, Point) {
    this.$scope = $scope;
    this.$element = $element;
    this.$attrs = $attrs;
    this.pointEventManager = pointEventManager;
    this.Point = Point;
    
    $element.addClass('live-value');
}

PointValueController.prototype.$onChanges = function(changes) {
    if (changes.value) {
        this.valueChangeHandler();
    }
    if (changes.point) {
        this.setPoint();
    }
    if (changes.pointXid && !(!changes.pointXid.currentValue && changes.pointXid.isFirstChange())) {
        this.getPointByXid();
    }
};

PointValueController.prototype.setPoint = function(point) {
    if (point !== undefined)
        this.point = point;
    
    if (this.unsubscribe) {
        this.unsubscribe();
    }
    
    this.valueChangeHandler();
    
    if (this.point) {
        this.unsubscribe = this.pointEventManager.smartSubscribe(this.$scope, this.point.xid, SUBSCRIPTION_TYPES, this.websocketHandler.bind(this));
    }
};

PointValueController.prototype.websocketHandler = function(event, payload) {
    if (!this.point) {
        console.error('No point but got websocket msg', payload);
        return;
    }
    if (this.point.xid !== payload.xid) {
        console.error('Got websocket msg for wrong xid', payload, this.point);
        return;
    }
    
    // sets the value, convertedValue and renderedValue on the point from the websocket payload
    this.point.websocketHandler(payload);
    this.valueChangeHandler();
};

PointValueController.prototype.valueChangeHandler = function() {
    if (!this.point || this.point.enabled) {
        this.$element.removeClass('point-disabled');
    } else {
        this.$element.addClass('point-disabled');
    }
    
    if (this.onValueUpdated) {
        this.onValueUpdated({point: this.point, value: this.value});
    }
};

PointValueController.prototype.getPointByXid = function() {
    if (this.point && this.pointXid === this.point.xid) return;
    
    var $ctrl = this;
    
    if (this.pointRequest) {
        this.pointRequest.$cancelRequest();
    }
    
    if (!this.pointXid) {
        this.pointRequest = null;
        $ctrl.setPoint(point);
        return;
    }
    
    this.pointRequest = this.Point.get({xid: this.pointXid});
    this.pointRequest.$promise.then(function(point) {
        $ctrl.pointRequest = null;
        $ctrl.setPoint(point);
    }, function() {
        $ctrl.pointRequest = null;
        $ctrl.setPoint(null);
    });
};

return PointValueController;

}); // define
