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

WatchListSelectController.$inject = ['$scope', '$element', '$attrs', 'WatchList', '$stateParams', '$state', 'Point', 'WatchListEventManager'];
function WatchListSelectController($scope, $element, $attrs, WatchList, $stateParams, $state, Point, WatchListEventManager) {
    var xid = $stateParams.watchListXid || this.watchListXid;

    this.showSelect = !this.noSelect;
    if (this.showSelect) {
        this.queryPromise = WatchList.query({rqlQuery: 'sort(name)'}).$promise.then(function(watchLists) {
            this.watchLists = watchLists;
            
            if (xid) {
                var found = false;
                for (var i = 0; i < watchLists.length; i++) {
                    if (watchLists[i].xid === xid) {
                        found = true;
                        this.setWatchList(watchLists[i]);
                        break;
                    }
                }
                if (!found) {
                    WatchList.get({xid: xid}).$promise.then(function(watchList) {
                        this.setWatchList(watchList);
                    }.bind(this));
                }
            } else if ((angular.isUndefined(this.selectFirst) || this.selectFirst) && watchLists.length) {
                this.setWatchList(watchLists[0]);
            }
            
            return watchLists;
        }.bind(this));
    } else if (xid) {
        WatchList.get({xid: xid}).$promise.then(function(watchList) {
            this.setWatchList(watchList);
        }.bind(this));
    }
    
    this.$onInit = function() {
        if (this.onInit) {
            this.onInit({$ctrl: this});
        }
    };

    this.$onChanges = function(changes) {
        if (changes.watchListXid) {
            WatchList.get({xid: this.watchListXid}).$promise.then(function(watchList) {
                this.setWatchList(watchList);
            }.bind(this));
        }
        if (changes.parameters && this.watchList && this.parameters) {
            this.getPoints();
        }
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
        
        if (!watchList) {
            this.points = [];
            return;
        }
        
        $state.go('.', {watchListXid: watchList.xid}, {location: 'replace', notify: false});
        
        this.watchList = watchList;
        
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
        //this.points = [];
        this.watchList.$getPoints(this.parameters).then(function(watchList) {
            this.points = watchList.points;
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
            disableGetPointValue: '<?'
        },
        controller: WatchListSelectController
    };
}

return watchListSelectFactory;

}); // define
