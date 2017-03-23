/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

var DEFAULT_SORT = ['name'];
var UPDATE_TYPES = ['add', 'update', 'delete'];

WatchListSelectController.$inject = ['$scope', '$element', '$attrs', 'WatchList', 'WatchListEventManager'];
function WatchListSelectController($scope, $element, $attrs, WatchList, WatchListEventManager) {
    this.$scope = $scope;
    this.$element = $element;
    this.$attrs = $attrs;
    this.WatchList = WatchList;
    this.WatchListEventManager = WatchListEventManager;
}

WatchListSelectController.prototype.$onInit = function() {
    this.ngModelCtrl.$render = this.render.bind(this);

    this.doQuery().then(function(items) {
        if (!this.watchList && this.selectFirst && items.length) {
            this.setViewValue(items[0]);
        }
        
        this.subscribe();
    }.bind(this));
};

WatchListSelectController.prototype.$onChanges = function(changes) {
    if (changes.watchListXid && (changes.watchListXid.currentValue || !changes.watchListXid.isFirstChange())) {
        this.setWatchListByXid(this.watchListXid);
    }

    if (changes.query && !changes.query.isFirstChange() || changes.start && !changes.start.isFirstChange() ||
            changes.limit && !changes.limit.isFirstChange() || changes.sort && !changes.sort.isFirstChange()) {
        this.doQuery();
    }
    
    if (changes.parameters && (changes.parameters.currentValue || !changes.parameters.isFirstChange())) {
        this.doGetPoints(this.parameters);
    }
};

WatchListSelectController.prototype.setViewValue = function(item) {
    this.ngModelCtrl.$setViewValue(item);
    this.render();
    this.doGetPoints(this.parameters);
};

WatchListSelectController.prototype.render = function() {
    this.watchList = this.ngModelCtrl.$viewValue;
};

WatchListSelectController.prototype.subscribe = function() {
    this.WatchListEventManager.smartSubscribe(this.$scope, null, UPDATE_TYPES, this.updateHandler.bind(this));
};

WatchListSelectController.prototype.setWatchListByXid = function(xid) {
    if (xid) {
        this.WatchList.get({xid: xid}).$promise.then(null, angular.noop).then(function(item) {
            if (item) {
                // we want to output watchlists without a points property and supply these points as a separate callback
                // via onPointsChange() after calling doGetPoints()
                delete item.points;
            }
            this.setViewValue(item || null);
        }.bind(this));
    } else {
        this.setViewValue(null);
    }
};

WatchListSelectController.prototype.doQuery = function() {
    this.queryPromise = this.WatchList.objQuery({
        query: this.query,
        start: this.start,
        limit: this.limit,
        sort: this.sort || DEFAULT_SORT
    }).$promise.then(function(items) {
        return (this.watchLists = items);
    }.bind(this));
    
    return this.queryPromise;
};

WatchListSelectController.prototype.doGetPoints = function(parameters) {
    if (!this.onPointsChange) return;
    
    if (!this.watchList) {
        this.points = null;
        this.onPointsChange({$points: this.points});
    } else {
        this.watchList.getPoints(parameters).then(null, angular.noop).then(function(points) {
            this.points = points || null;
            this.onPointsChange({$points: this.points});
        }.bind(this));
    }
};

WatchListSelectController.prototype.updateHandler = function updateHandler(event, update) {
    var item;
    if (update.object) {
        item = angular.merge(new this.WatchList(), update.object);
    }
    
    if (update.action === 'add') {
        // TODO filter added points according to the current query somehow
        this.watchLists.push(item);
    } else {
        for (var i = 0; i < this.watchLists.length; i++) {
            if (this.watchLists[i].xid === item.xid) {
                if (update.action === 'update') {
                    this.watchLists[i] = item;
                } else if (update.action === 'delete') {
                    this.watchLists.splice(i, 1);
                }
                break;
            }
        }
    }

    if (this.watchList && this.watchList.xid === item.xid) {
        this.setViewValue(update.action === 'delete' ? null : item);
    }
};

return WatchListSelectController;

}); // define
