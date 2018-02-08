/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

var DEFAULT_SORT = ['name'];
var UPDATE_TYPES = ['add', 'update', 'delete'];

WatchListSelectController.$inject = ['$scope', '$element', '$attrs', 'maWatchList', 'maWatchListEventManager', 'maUtil'];
function WatchListSelectController($scope, $element, $attrs, WatchList, WatchListEventManager, maUtil) {
    this.$scope = $scope;
    this.$element = $element;
    this.$attrs = $attrs;
    this.WatchList = WatchList;
    this.WatchListEventManager = WatchListEventManager;
    this.maUtil = maUtil;
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
    if (changes.watchListXid && !changes.watchListXid.isFirstChange()) {
        this.setWatchListByXid(this.watchListXid);
    }

    if (changes.query && !changes.query.isFirstChange() || changes.start && !changes.start.isFirstChange() ||
            changes.limit && !changes.limit.isFirstChange() || changes.sort && !changes.sort.isFirstChange()) {
        this.doQuery();
    }
};

WatchListSelectController.prototype.$doCheck = function() {
    if (this.parameters && this.prevParams && this.watchListParams && this.onPointsChange) {
        const changeDetected = Object.keys(this.parameters).some(param => {
            return this.watchListParams[param] && !angular.equals(this.parameters[param], this.prevParams[param]);
        });
        
        if (changeDetected) {
            this.doGetPoints(this.parameters);
        }
    }
};

WatchListSelectController.prototype.setViewValue = function(item) {
    this.ngModelCtrl.$setViewValue(item);
    this.render();
};

WatchListSelectController.prototype.render = function() {
    this.watchList = this.ngModelCtrl.$viewValue;
    this.watchListParams = null;

    // the $onChanges hook doesn't call setWatchListByXid() for the first change (i.e. on initialization)
    // we handle this here so that if the $viewValue already has the same XID we don't fetch it again
    if (!this.firstRenderComplete) {
        this.firstRenderComplete = true;
        if (this.watchListXid && (!this.ngModelCtrl.$viewValue || this.ngModelCtrl.$viewValue.xid !== this.watchListXid)) {
            this.setWatchListByXid(this.watchListXid);
            return;
        }
    }

    if (this.watchList) {
        if (this.watchList.params && this.watchList.params.length) {
            this.watchListParams = {};
            this.watchList.params.forEach(param => {
                this.watchListParams[param.name] = param;
            });
        }

        if (!this.parameters) {
            this.parameters = {};
        }
        
        if (this.autoStateParams) {
            this.maUtil.updateFromStateParams(this.watchList, this.parameters);
        }
        
        this.watchList.defaultParamValues(this.parameters);
    }

    this.doGetPoints(this.parameters);
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

WatchListSelectController.prototype.doGetPoints = function() {
    this.prevParams = Object.assign({}, this.parameters);
    
    if (this.onParametersChange) {
        this.onParametersChange({$parameters: this.parameters});
    }
    
    if (this.autoStateParams) {
        const encodedParams = this.maUtil.encodeStateParams(this.parameters);
        this.maUtil.updateStateParams(encodedParams);
    }
    
    if (!this.onPointsChange) return;
    
    if (!this.watchList) {
        this.points = null;
        this.onPointsChange({$points: this.points});
    } else {
        if (this.wlPointsPromise && this.wlPointsPromise.cancel) {
            this.wlPointsPromise.cancel();
        }
        this.wlPointsPromise = this.watchList.getPoints(this.parameters).then(null, angular.noop).then(function(points) {
            this.points = points || null;
            this.onPointsChange({$points: this.points});
        }.bind(this));

        this.wlPointsPromise['finally'](function() {
            delete this.wlPointsPromise;
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
