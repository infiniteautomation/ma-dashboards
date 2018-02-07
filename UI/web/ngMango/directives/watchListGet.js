/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

 /**
  * @ngdoc directive
  * @name ngMango.directive:maWatchListGet
  * @restrict E
  * @description Gets a watch list by its XID and outputs it into the AngularJS scope. Does not display anything.
  *
  * @param {expression} ng-model Assignable expression to output the watch list to.
  * @param {string=} watch-list-xid The XID of the watch list to output.
  * @param {expression=} parameters Assignable expression to output the watch list parameters to. If parameters are passed in the defaults for the
  *     selected watch list will be applied to it.
  * @param {expression=} on-points-change Expression is evaluated when the points change. Available scope parameters are `$points`.
  *     e.g. `on-points-change="$ctrl.pointsChanged($points)"`)
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
            parameters: '=?',
            onPointsChange: '&?'
        },
        require: {
            'ngModelCtrl': 'ngModel'
        },
        designerInfo: {
            translation: 'ui.components.watchListGet',
            icon: 'remove_red_eye',
            category: 'watchLists'
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
