/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', './WatchListSelectController'], function(angular, require, WatchListSelectController) {
'use strict';

watchListGetFactory.$inject = [];
function watchListGetFactory() {
    return {
        restrict: 'E',
        scope: {},
        controller: WatchListGetController,
        controllerAs: '$ctrl',
        bindToController: {
            watchListXid: '@?',
            parameters: '<?',
            onPointsChange: '&?'
        },
        require: {
            'ngModelCtrl': 'ngModel'
        }
    };
}

WatchListGetController.$inject = WatchListSelectController.$inject;
function WatchListGetController() {
    WatchListSelectController.apply(this, arguments);
}

WatchListGetController.prototype = Object.create(WatchListSelectController.prototype);
WatchListGetController.prototype.constructor = WatchListGetController;

WatchListGetController.prototype.$onInit = function() {
    this.ngModelCtrl.$render = this.render.bind(this);
};

WatchListGetController.prototype.render = function() {
    WatchListSelectController.prototype.render.apply(this, arguments);
    
    if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
    }
    
    this.subscribe();
};

WatchListGetController.prototype.subscribe = function() {
    if (this.watchList) {
        this.unsubscribe = this.WatchListEventManager.smartSubscribe(this.$scope, this.watchList.xid, 'update', this.updateHandler.bind(this));
    }
};

WatchListGetController.prototype.updateHandler = function updateHandler(event, update) {
    if (update.action === 'update' && update.object && this.watchList && update.object.xid === this.watchList.xid) {
        this.setViewValue(angular.merge(new this.WatchList(), update.object));
    }
};

return watchListGetFactory;

}); // define
