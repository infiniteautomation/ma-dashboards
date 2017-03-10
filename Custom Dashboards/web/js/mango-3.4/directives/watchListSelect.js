/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */


 /**
  * @ngdoc directive
  * @name maDashboards.maWatchListSelect
  * @restrict E
  * @description
  * `<ma-watch-list-select watch-list="myWatchlist"></ma-watch-list-select>`
  * - The `<ma-watch-list-select>` component can be used to load watch list data onto a custom page.
  * - Can be combined with `<ma-watch-list-chart>` to display the watch list's custom chart designed on the watch list page.
  *
  * @param {object} watch-list Variable holds the resulting watch list object.
  * @param {string=} watch-list-xid Set to the XID of a watch list to auto load or bind a string for dynamic switching (as shown above).
  * @param {boolean=} no-select Set to `true` to hide the dropdown select from the page, but still availble for loading watchlist data. (Defaults to `false`)
  * @param {array=} points Array of point objects contained in the watch list object.
  * @param {boolean=} select-first Set to `false` to not auto select a the first watch list. (Defaults to `true`)
  * @param {boolean=} disabled Set to `true` to disable the dropdown input. (Defaults to `false`)
  * 
  * @usage
  * <ma-watch-list-select no-select="true" watch-list-xid="{{watchlistXID}}" watch-list="myWatchlist"></ma-watch-list-select>
  *
  */


define(['angular', 'require'], function(angular, require) {
'use strict';

var UPDATE_TYPES = ['update'];

WatchListSelectController.$inject = ['$scope', '$element', '$attrs', 'WatchList', '$state', 'Point', 'WatchListEventManager'];
function WatchListSelectController($scope, $element, $attrs, WatchList, $state, Point, WatchListEventManager) {

    this.disableGetPoints = !$attrs.points;

    this.$onInit = function() {
        if (!this.watchListXid && !this.watchList && $state.params.watchListXid) {
            this.watchListXid = $state.params.watchListXid;
            this.setWatchListFromXid();
        }

        this.showSelect = !this.noSelect;
        if (this.showSelect) {
            this.queryPromise = WatchList.query({rqlQuery: 'sort(name)'}).$promise.then(function(watchLists) {
                this.watchLists = watchLists;
                if ((angular.isUndefined(this.selectFirst) || this.selectFirst) && watchLists.length && !this.watchListXid && !this.watchList) {
                    this.setWatchList(watchLists[0]);
                }
                return watchLists;
            }.bind(this));
        }
        
        if (this.onInit) {
            this.onInit({$ctrl: this});
        }
    };

    this.$onChanges = function(changes) {
        if (changes.watchListXid) {
            if (this.watchListXid) {
                this.setWatchListFromXid();
            } else {
                this.setWatchList(null);
            }
        }
        if (changes.watchList) {
            this.setWatchList(this.watchList);
        }
        if (changes.parameters && this.watchList) {
            this.getPoints();
        }
    };
    
    this.setWatchListFromXid = function() {
        WatchList.get({xid: this.watchListXid}).$promise.then(function(watchList) {
            this.setWatchList(watchList);
        }.bind(this));
    };
    
    this.onSelectChange = function() {
        this.setWatchList(this.watchList);
        if (this.onChange) {
            this.onChange({$watchList: this.watchList});
        }
    };
    
    this.onOpen = function() {
        return this.queryPromise;
    };
    
    var unsubscribe;
    this.setWatchList = function(watchList) {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
        
        this.watchList = watchList;
        
        if (!watchList) {
            this.points = [];
            return;
        }
        
        $state.params.watchListXid = watchList.xid;
        $state.go('.', $state.params, {location: 'replace', notify: false});

        unsubscribe = WatchListEventManager.smartSubscribe($scope, this.watchList.xid, UPDATE_TYPES, this.updateHandler);
        this.getPoints();
    };
    
    this.updateHandler = function updateHandler(event, update) {
        if (update.action === 'update') {
            this.watchList = angular.merge(new WatchList(), update.object);
            this.getPoints();
        }
    }.bind(this);
    
    this.getPoints = function() {
        if (this.disableGetPoints) return;

        this.watchList.$getPoints(this.parameters).then(function(watchList) {
            this.points = watchList.points;
            if (this.onPointsChange) {
                this.onPointsChange({$point: this.points});
            }
        }.bind(this));
    };
}

watchListSelectFactory.$inject = ['$injector'];
function watchListSelectFactory($injector) {
    return {
        restrict: 'E',
        templateUrl: function() {
            if ($injector.has('$mdUtil')) {
                return require.toUrl('./watchListSelect-md.html');
            }
            return require.toUrl('./watchListSelect.html');
        },
        controllerAs: '$ctrl',
        bindToController: true,
        scope: {
            points: '=?',
            watchList: '=?',
            watchListXid: '@',
            noSelect: '=?',
            selectFirst: '=?',
            disabled: '=?',
            parameters: '<?',
            onInit: '&?',
            onChange: '&?',
            onPointsChange: '&?',
            disableGetPointValue: '<?'
        },
        controller: WatchListSelectController
    };
}

return watchListSelectFactory;

}); // define
