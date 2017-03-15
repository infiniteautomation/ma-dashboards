/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

watchListList.$inject = ['$injector'];
return watchListList;

function watchListList($injector) {
    var DEFAULT_SORT = ['name'];
    var UPDATE_TYPES = ['add', 'update', 'delete'];

    return {
        restrict: 'E',
        controllerAs: '$ctrl',
        bindToController: true,
        scope: {
            selectXid: '@',
            selectFirst: '<?',
            showNewButton: '<?',
            showEditButtons: '<?',
            query: '<?',
            start: '<?',
            limit: '<?',
            sort: '<?',
            user: '<?',
            newButtonClicked: '&',
            editButtonClicked: '&'
        },
        templateUrl: function() {
            if ($injector.has('$mdUtil')) {
                return require.toUrl('./watchListList-md.html');
            }
            return require.toUrl('./watchListList.html');
        },
        require: {
            'ngModelCtrl': 'ngModel'
        },
        controller: ['$scope', 'WatchList', '$stateParams', '$state', 'localStorageService', 'WatchListEventManager',
                     WatchListListController]
    };
    
    function WatchListListController($scope, WatchList, $stateParams, $state, localStorageService, WatchListEventManager) {
        this.$onInit = function() {
            this.ngModelCtrl.$render = this.render;
            
            var localStorageWatchListXid = localStorageService.get('watchListPage') ? localStorageService.get('watchListPage').watchListXid : null;
            
            var xid = $stateParams.watchListXid || localStorageWatchListXid || this.selectXid;
            if (xid) {
                this.fetchingInitial = true;
                WatchList.get({xid: xid}).$promise.then(null, angular.noop).then(function(item) {
                    this.fetchingInitial = false;
                    this.setViewValue(item);
                }.bind(this));
            }
            
            this.doQuery().then(function(items) {
                this.items = items;
                if (!xid && (angular.isUndefined(this.selectFirst) || this.selectFirst) && items.length) {
                    this.setViewValue(items[0]);
                }
                
                WatchListEventManager.smartSubscribe($scope, null, UPDATE_TYPES, this.updateHandler);
            }.bind(this));
        };
        
        this.$onChanges = function(changes) {
            if ((changes.query && !changes.query.isFirstChange()) ||
                    (changes.start && !changes.start.isFirstChange()) ||
                    (changes.limit && !changes.limit.isFirstChange()) ||
                    (changes.sort && !changes.sort.isFirstChange())) {
                this.doQuery();
            }
        };
        
        this.doQuery = function() {
            this.queryPromise = WatchList.objQuery({
                query: this.query,
                start: this.start,
                limit: this.limit,
                sort: this.sort || DEFAULT_SORT
            }).$promise.then(function(items) {
                return (this.items = items);
            }.bind(this));
            
            return this.queryPromise;
        };
        
        this.setViewValue = function(item) {
            this.render(item);
            this.ngModelCtrl.$setViewValue(item);
        };
        
        this.render = function(item) {
            this.selected = item;
            this.setStateParam(item);
            this.setLocalStorageParam(item);
        }.bind(this);

        this.updateHandler = function updateHandler(event, update) {
            var item;
            if (update.object) {
                item = angular.merge(new WatchList(), update.object);
            }
            
            if (update.action === 'add') {
                this.items.push(item);
            } else {
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i].xid === item.xid) {
                        if (update.action === 'update') {
                            this.items[i] = item;
                        } else if (update.action === 'delete') {
                            this.items.splice(i, 1);
                        }
                        break;
                    }
                }
            }

            if (this.selected && this.selected.xid === item.xid) {
                this.setViewValue(update.action === 'delete' ? null : item);
            }
            
        }.bind(this);
        
        this.setStateParam = function(item) {
            if (this.fetchingInitial) return;
            $stateParams.watchListXid = item ? item.xid : null;
            $state.go('.', $stateParams, {location: 'replace', notify: false});
        };
        
        this.setLocalStorageParam = function(item) {
            if (this.fetchingInitial) return;
            
            var watchListXid = item ? item.xid : null;
            
            // jshint eqnull:true
            if (watchListXid != null) {
                localStorageService.set('watchListPage', {
                    watchListXid: watchListXid
                });
            }
        };
    }
}

}); // define
