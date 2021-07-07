/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';

const DEFAULT_SORT = ['name'];

class WatchListSelectController {
    static get $$ngIsClass() {
        return true;
    }

    static get $inject() {
        return ['$scope', '$element', '$attrs', 'maWatchList', 'maUtil'];
    }

    constructor($scope, $element, $attrs, WatchList, maUtil) {
        this.$scope = $scope;
        this.$element = $element;
        this.$attrs = $attrs;
        this.WatchList = WatchList;
        this.maUtil = maUtil;
    }

    $onInit() {
        this.ngModelCtrl.$render = this.render.bind(this);
        this.subscribe();

        this.doQuery().then((items) => {
            if (!this.watchList && this.selectFirst && items.length) {
                this.setViewValue(items[0]);
            }
        });
    }

    $onChanges(changes) {
        if (changes.watchListXid && !changes.watchListXid.isFirstChange()) {
            this.setWatchListByXid(this.watchListXid);
        }

        if (changes.query && !changes.query.isFirstChange() || changes.start && !changes.start.isFirstChange() ||
            changes.limit && !changes.limit.isFirstChange() || changes.sort && !changes.sort.isFirstChange()) {
            this.doQuery();
        }
    }

    $doCheck() {
        if (this.parameters && this.prevParams && this.watchListParams && this.onPointsChange) {
            const changeDetected = Object.keys(this.parameters).some(param => {
                return this.watchListParams[param] && !angular.equals(this.parameters[param], this.prevParams[param]);
            });

            if (changeDetected) {
                this.doGetPoints(this.parameters);
            }
        }
    }

    setViewValue(item) {
        this.ngModelCtrl.$setViewValue(item);
        this.render();
    }

    render() {
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
                this.watchList.paramValuesFromState(this.parameters);
            }

            this.watchList.defaultParamValues(this.parameters);
        }

        this.doGetPoints(this.parameters);
    }

    subscribe() {
        this.WatchList.notificationManager.subscribe({
            scope: this.$scope,
            handler: this.updateHandler.bind(this)
        });
    }

    setWatchListByXid(xid) {
        if (xid) {
            this.WatchList.get({xid: xid}).$promise.then(null, angular.noop).then((item) => {
                if (item) {
                    // we want to output watchlists without a points property and supply these points as a separate callback
                    // via onPointsChange() after calling doGetPoints()
                    delete item.points;
                }
                this.setViewValue(item || null);
            });
        } else {
            this.setViewValue(null);
        }
    }

    doQuery() {
        this.queryPromise = this.WatchList.objQuery({
            query: this.query,
            start: this.start,
            limit: this.limit,
            sort: this.sort || DEFAULT_SORT
        }).$promise.then((items) => {
            return (this.watchLists = items);
        });

        if (this.onQuery) {
            this.onQuery({$promise: this.queryPromise});
        }

        return this.queryPromise;
    }

    doGetPoints() {
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
            this.wlPointsPromise = this.watchList.getPoints(this.parameters).then(null, angular.noop).then((points) => {
                this.points = points || null;
                this.onPointsChange({$points: this.points});
            });

            this.wlPointsPromise['finally'](() => {
                delete this.wlPointsPromise;
            });
        }
    }

    updateHandler(event, item) {
        if (Array.isArray(this.watchLists)) {
            const index = this.watchLists.findIndex(wl => wl.xid === item.xid);
            if (index >= 0) {
                if (event.name === 'add' || event.name === 'update') {
                    this.watchLists[index] = item;
                } else if (event.name === 'delete') {
                    this.watchLists.splice(index, 1);
                }
            } else if (event.name === 'add') {
                // TODO filter added points according to the current query somehow
                this.watchLists.push(item);
            }
        }

        if (this.watchList && this.watchList.xid === item.xid) {
            if (!angular.equals(this.watchList, item)) {
                this.setViewValue(event.name === 'delete' ? null : item);
            }
        }
    }
}

export default WatchListSelectController;
