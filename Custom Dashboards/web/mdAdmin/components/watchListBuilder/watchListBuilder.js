/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'rql/query'], function(angular, require, query) {
'use strict';

watchListBuilderController.$inject = ['Point', '$mdMedia', 'cssInjector', 'WatchList', 'Util', 'mdAdminSettings',
    '$stateParams', '$state', '$mdDialog', 'Translate', '$timeout', '$scope', '$mdToast', 'User'];
function watchListBuilderController(Point, $mdMedia, cssInjector, WatchList, Util, mdAdminSettings,
        $stateParams, $state, $mdDialog, Translate, $timeout, $scope, $mdToast, User) {
    var $ctrl = this;
    $ctrl.baseUrl = require.toUrl('.');
    
    $ctrl.$mdMedia = $mdMedia;
    
    var defaultTotal = $ctrl.total = '\u2026';
    var defaultQuery ='sort(deviceName,name)&limit(200)';
    $ctrl.tableSelection = [];
    $ctrl.hierarchySelection = [];
    $ctrl.staticSelected = [];
    $ctrl.allPoints = [];
    $ctrl.tableQuery = {
        limit: 10,
        page: 1,
        order: 'deviceName'
    };
    $ctrl.staticTableQuery = {
        limit: 10,
        page: 1
    };
    $ctrl.selectedTab = 0;

    $ctrl.queryProperties = [
        {
            label: 'Point name',
            value: 'name'
        },
        {
            label: 'Device name',
            value: 'deviceName'
        },
        {
            label: 'XID',
            value: 'xid'
        },
        {
            label: 'Data source name',
            value: 'dataSourceName'
        },
        {
            label: 'Data source XID',
            value: 'dataSourceXid'
        },
        {
            label: 'Point hierarchy folder ID',
            value: 'pointFolderId'
        },
        {
            label: 'Enabled',
            value: 'enabled'
        },
        {
            label: 'Read permission',
            value: 'readPermission'
        },
        {
            label: 'Set permission',
            value: 'setPermission'
        }
    ];
    
    $ctrl.newWatchlist = function newWatchlist(name) {
        $ctrl.selectedWatchlist = null;
        var watchlist = new WatchList();
        watchlist.isNew = true;
        watchlist.name = name;
        watchlist.xid = '';
        watchlist.points = [];
        watchlist.username = User.current.username;
        watchlist.type = 'static';
        watchlist.readPermission = 'user';
        watchlist.editPermission = User.current.hasPermission('edit-watchlists') ? 'edit-watchlists' : '';
        $ctrl.editWatchlist(watchlist);
        $ctrl.resetForm();
    };
    
    $ctrl.typeChanged = function typeChanged() {
        if ($ctrl.watchlist.type === 'query') {
            if (!$ctrl.watchlist.query)
                $ctrl.watchlist.query = defaultQuery;
            if (!$ctrl.watchlist.params) {
                $ctrl.watchlist.params = [];
            }
            $ctrl.parseQuery();
            $ctrl.doPointQuery();
        } else if ($ctrl.watchlist.type === 'hierarchy') {
            if (!$ctrl.watchlist.folderIds)
                $ctrl.watchlist.folderIds = [];
        }
    };

    $ctrl.nextStep = function() {
        $ctrl.selectedTab++;
    };
    $ctrl.prevStep = function() {
        $ctrl.selectedTab--;
    };
    $ctrl.isLastStep = function() {
        if (!$ctrl.watchlist) return false;
        switch($ctrl.watchlist.type) {
        case 'static': return $ctrl.selectedTab === 3;
        case 'query':
            var lastTab = $ctrl.watchlist.params && $ctrl.watchlist.params.length ?  2 : 3;
            return $ctrl.selectedTab === lastTab;
        case 'hierarchy': return $ctrl.selectedTab === 1;
        }
        return true;
    };
    
    $ctrl.addParam = function addParam() {
        if (!$ctrl.watchlist.params) {
            $ctrl.watchlist.params = [];
        }
        $ctrl.watchlist.params.push({type:'input'});
    };
    
    $ctrl.isError = function isError(name) {
        if (!$scope.watchListForm || !$scope.watchListForm[name]) return false;
        return $scope.watchListForm[name].$invalid && ($scope.watchListForm.$submitted || $scope.watchListForm[name].$touched);
    };
    
    $ctrl.resetForm = function resetForm() {
        if ($scope.watchListForm) {
            $scope.watchListForm.$setUntouched();
            $scope.watchListForm.$setPristine();
            $scope.watchListForm.$submitted = false;
        }
    };
    
    $ctrl.save = function save() {
        var saveMethod = $ctrl.watchlist.isNew ? '$save' : '$updateWithRename';
        if ($scope.watchListForm.$valid) {
            $ctrl.watchlist[saveMethod]().then(function(wl) {
                $ctrl.selectedWatchlist = wl;
                $ctrl.watchlistSelected();
                
                var found = false
                for (var i = 0; i < $ctrl.watchlists.length; i++) {
                    if ($ctrl.watchlists[i].xid === wl.xid) {
                        $ctrl.watchlists.splice(i, 1, wl);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    $ctrl.watchlists.push(wl);
                }
                
                var toast = $mdToast.simple()
                    .textContent(Translate.trSync('dashboards.v3.app.watchListSaved'))
                    .action(Translate.trSync('common.ok'))
                    .highlightAction(true)
                    .position('bottom center')
                    .hideDelay(2000);
                $mdToast.show(toast);
    
                $ctrl.resetForm();
            }, function(response) {
                // error saving
                var toast = $mdToast.simple()
                    .textContent(Translate.trSync('dashboards.v3.app.errorSavingWatchlist', response.statusText))
                    .action(Translate.trSync('common.ok'))
                    .highlightAction(true)
                    .highlightClass('md-warn')
                    .position('bottom center')
                    .hideDelay(5000);
                $mdToast.show(toast);
                console.log(response);
            });
        }
    };
    
    $ctrl.deleteWatchlist = function deleteWatchlist(event) {
        
        var confirm = $mdDialog.confirm()
            .title(Translate.trSync('dashboards.v3.app.areYouSure'))
            .textContent(Translate.trSync('dashboards.v3.app.confirmDeleteWatchlist'))
            .ariaLabel(Translate.trSync('dashboards.v3.app.areYouSure'))
            .targetEvent(event)
            .ok(Translate.trSync('common.ok'))
            .cancel(Translate.trSync('common.cancel'));
        
        $mdDialog.show(confirm).then(function() {
            $ctrl.watchlist.$delete().then(function(wl) {
                $ctrl.newWatchlist();
                for (var i = 0; i < $ctrl.watchlists.length; i++) {
                    if ($ctrl.watchlists[i].xid === wl.xid) {
                        $ctrl.watchlists.splice(i, 1);
                        break;
                    }
                }
            });
        });
    };
    
    $ctrl.$onInit = function() {
        $ctrl.refreshWatchlists();
        if ($stateParams.watchListXid) {
            $ctrl.getWatchlist($stateParams.watchListXid);
        } else if ($stateParams.watchList) {
            $ctrl.selectedWatchlist = null;
            var watchlist = $stateParams.watchList;
            if (!watchlist.xid)
                watchlist.xid = Util.uuid();
            watchlist.username = User.current.username;
            watchlist.readPermission = 'user';
            watchlist.editPermission = User.current.hasPermission('edit-watchlists') ? 'edit-watchlists' : '';
            $ctrl.editWatchlist(watchlist);
            $ctrl.resetForm();
        } else {
            $ctrl.newWatchlist();
        }
    };
    
    $ctrl.getWatchlist = function getWatchlist(xid) {
        WatchList.get({xid: xid}).$promise.then(function(wl) {
            var user = User.current;
            if (wl.username !== user.username && !user.hasPermission(wl.editPermission)) {
                throw 'no edit permission';
            }
            $ctrl.selectedWatchlist = wl;
            $ctrl.watchlistSelected();
        }, function() {
            $ctrl.newWatchlist();
        });
    };
    
    $ctrl.refreshWatchlists = function refreshWatchlists() {
        WatchList.query({rqlQuery: 'sort(name)'}).$promise.then(function(watchlists) {
            var filtered = [];
            var user = User.current;
            for (var i = 0; i < watchlists.length; i++) {
                var wl = watchlists[i];
                if (wl.username === user.username || user.hasPermission(wl.editPermission)) {
                    wl.points = [];
                    filtered.push(wl);
                }
            }
            $ctrl.watchlists = filtered;
        });
    };

    $ctrl.watchlistSelected = function watchlistSelected() {
        if ($ctrl.selectedWatchlist) {
            var copiedWatchList = angular.copy($ctrl.selectedWatchlist);
            copiedWatchList.originalXid = copiedWatchList.xid;
            $ctrl.editWatchlist(copiedWatchList);
            $ctrl.resetForm();
        } else if (!$ctrl.watchlist || !$ctrl.watchlist.isNew) {
            $ctrl.newWatchlist();
        }
    };
    
    $ctrl.editWatchlist = function editWatchlist(watchlist) {
        $ctrl.watchlist = watchlist;
        $state.go('.', {watchListXid: watchlist.isNew ? null : watchlist.xid}, {location: 'replace', notify: false});
        
        $ctrl.staticSelected = [];
        $ctrl.allPoints = [];
        $ctrl.total = defaultTotal;
        $ctrl.queryPromise = null;
        $ctrl.folders = [];
        
        if (watchlist.type === 'static') {
            $ctrl.clearSearch();
            if (!watchlist.isNew) {
                watchlist.getPoints().then(renderStatic);
            } else {
                renderStatic([]);
            }
        } else if (watchlist.type === 'query') {
            $ctrl.parseQuery();
            $ctrl.doPointQuery();
        } else if (watchlist.type === 'hierarchy') {
            if (watchlist.hierarchyFolders) {
                $ctrl.folders = watchlist.hierarchyFolders;
                $ctrl.foldersChanged(); // updates the watchlist query string
            } else {
                var folders = [];
                for (var i = 0; i < watchlist.folderIds.length; i++) {
                    var folderId = parseInt(watchlist.folderIds[i], 10);
                    folders.push({id: folderId});
                }
                $ctrl.folders = folders;
            }
        }
        
        function renderStatic(points) {
            $ctrl.watchlist.points = points;
            
            $ctrl.tableSelection = $ctrl.watchlist.points.slice();
            $ctrl.rerenderTable();
            $ctrl.hierarchySelection = $ctrl.watchlist.points.slice();
            $ctrl.resetSort();
            $ctrl.sortAndLimit();
        }
    };
    
    $ctrl.onPaginateOrSort = function onPaginateOrSort() {
        $ctrl.doPointQuery(true);
    };

    $ctrl.doPointQuery = function doPointQuery(isPaginateOrSort, ignoreIfPending) {
        // the query preview tab is hidden if there are parameters, dont do query
        if ($ctrl.watchlist.params && $ctrl.watchlist.params.length) return;
        
        if ($ctrl.queryPromise && $ctrl.queryPromise.$$state.status === 0) {
            if (ignoreIfPending) {
                return;
            }
        }
        
        if (!isPaginateOrSort) {
            $ctrl.total = defaultTotal;
            $ctrl.allPoints = [];
        }
        
        var queryObj = new query.Query(angular.copy($ctrl.tableQuery.rql));
        if (queryObj.name !== 'and') {
            if (!queryObj.args.length) {
                queryObj = new query.Query();
            } else {
                queryObj = new query.Query({name: 'and', args: [queryObj]});
            }
        }
        queryObj = queryObj.sort($ctrl.tableQuery.order);
        queryObj = queryObj.limit($ctrl.tableQuery.limit, ($ctrl.tableQuery.page - 1) * $ctrl.tableQuery.limit);
        
        $ctrl.queryPromise = Point.query({rqlQuery: queryObj.toString()})
        .$promise.then(function(allPoints) {
            $ctrl.total = allPoints.$total;
            $ctrl.allPoints = allPoints;
        }, function() {
            $ctrl.allPoints = [];
        });
    };

    /**
     * set the points to an empty array and then to the actual points so that each row is destroyed and re-created
     * this ensures that checkboxes are preserved for selected points
     */
    $ctrl.rerenderTable = function rerenderTable() {
        if ($ctrl.queryPromise && $ctrl.queryPromise.$$state.status === 0) {
            return;
        }
        var stored = $ctrl.allPoints;
        $ctrl.allPoints = [];
        $timeout(function() {
            $ctrl.allPoints = stored;
        }, 0);
    };

    $ctrl.parseQuery = function parseQuery() {
        var queryObj = new query.Query($ctrl.watchlist.query);
        if (queryObj.cache && queryObj.cache.sort && queryObj.cache.sort.length) {
            $ctrl.tableQuery.order = queryObj.cache.sort[0];
        }
        for (var i = 0; i < queryObj.args.length; i++) {
            var arg = queryObj.args[i];
            if (arg.name === 'limit' || arg.name === 'sort') {
                queryObj.args.splice(i--, 1);
            }
        }
        $ctrl.tableQuery.rql = queryObj;
    };
    
    $ctrl.doSearch = function doSearch() {
        var props = ['name', 'deviceName', 'dataSourceName', 'xid'];
        var args = [];
        for (var i = 0; i < props.length; i++) {
            args.push(new query.Query({name: 'like', args: [props[i], '*' + $ctrl.tableSearch + '*']}));
        }
        $ctrl.tableQuery.rql = new query.Query({name: 'or', args: args});
        $ctrl.doPointQuery();
    };
    
    $ctrl.clearSearch = function clearSearch() {
        $ctrl.tableSearch = '';
        $ctrl.tableQuery.rql = new query.Query();
        $ctrl.doPointQuery();
    };
    
    $ctrl.queryChanged = function queryChanged() {
        $ctrl.parseQuery();
        if (!$ctrl.watchlist.params.length)
            $ctrl.doPointQuery();
    };

    $ctrl.tableSelectionChanged = function() {
        // do a slice to shallow copy array so ngModel update is triggered in hierarchy view
        $ctrl.watchlist.points = $ctrl.tableSelection.slice();
        $ctrl.hierarchySelection = $ctrl.tableSelection.slice();
        $ctrl.resetSort();
        $ctrl.sortAndLimit();
    };

    $ctrl.hierarchySelectionChanged = function() {
        var pointXidsToGet = [];
        for (var i = 0; i < $ctrl.hierarchySelection.length; i++) {
            pointXidsToGet.push($ctrl.hierarchySelection[i].xid);
        }
        if (pointXidsToGet.length) {
            // fetch full points
            var ptQuery = new query.Query({name: 'in', args: ['xid'].concat(pointXidsToGet)});
            Point.query({rqlQuery: ptQuery.toString()}).$promise.then(updateSelection);
        } else {
            updateSelection();
        }
        
        function updateSelection(points) {
            if (points)
                $ctrl.hierarchySelection = points;
            $ctrl.watchlist.points = $ctrl.hierarchySelection.slice();
            $ctrl.tableSelection = $ctrl.hierarchySelection.slice();
            $ctrl.rerenderTable();
            $ctrl.resetSort();
            $ctrl.sortAndLimit();
        }
    };
    
    $ctrl.foldersChanged = function foldersChanged() {
        var folderIds = [];
        for (var i = 0; i < $ctrl.folders.length; i++) {
            folderIds.push($ctrl.folders[i].id);
        }
        $ctrl.watchlist.folderIds = folderIds;
    };
    
    $ctrl.resetSort = function() {
        delete $ctrl.staticTableQuery.order;
    };
    
    $ctrl.sortAndLimit = function() {
        var order = $ctrl.staticTableQuery.order;
        if (order) {
            var desc = false;
            if (desc = order.indexOf('-') === 0 || order.indexOf('+') === 0) {
                order = order.substring(1);
            }
            $ctrl.watchlist.points.sort(function(a, b) {
                if (a[order] > b[order]) return desc ? -1 : 1;
                if (a[order] < b[order]) return desc ? 1 : -1;
                return 0;
            });
        }
        
        var limit = $ctrl.staticTableQuery.limit;
        var start = $ctrl.staticTableQuery.start = ($ctrl.staticTableQuery.page - 1) * $ctrl.staticTableQuery.limit
        $ctrl.pointsInView = $ctrl.watchlist.points.slice(start, start + limit);
    };
    
    $ctrl.dragAndDrop = function(event, ui) {
        $ctrl.resetSort();
        var from = $ctrl.staticTableQuery.start + ui.item.sortable.index;
        var to = $ctrl.staticTableQuery.start + ui.item.sortable.dropindex;
        
        var item = $ctrl.watchlist.points[from];
        $ctrl.watchlist.points.splice(from, 1);
        $ctrl.watchlist.points.splice(to, 0, item);
    };
    
    $ctrl.removeFromWatchlist = function() {
        var map = {};
        for (var i = 0; i < $ctrl.staticSelected.length; i++) {
            map[$ctrl.staticSelected[i].xid] = true;
        }
        for (i = 0; i < $ctrl.watchlist.points.length; i++) {
            if (map[$ctrl.watchlist.points[i].xid]) {
                $ctrl.watchlist.points.splice(i--, 1);
            }
        }
        $ctrl.staticSelected = [];
        $ctrl.sortAndLimit();
        // do a slice to shallow copy array so ngModel update is triggered in hierarchy view
        $ctrl.tableSelection = $ctrl.watchlist.points.slice();
        $ctrl.rerenderTable();
        $ctrl.hierarchySelection = $ctrl.watchlist.points.slice();
    };
};

return {
    controller: watchListBuilderController,
    templateUrl: require.toUrl('./watchListBuilder.html')
};

}); // define
