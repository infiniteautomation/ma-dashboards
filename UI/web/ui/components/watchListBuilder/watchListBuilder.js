/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'rql/query'], function(angular, require, query) {
'use strict';

WatchListBuilderController.$inject = ['maPoint', '$mdMedia', 'maWatchList',
    '$state', '$mdDialog', 'maTranslate', '$timeout', '$mdToast', 'maUser', '$q'];
function WatchListBuilderController(Point, $mdMedia, WatchList,
        $state, $mdDialog, Translate, $timeout, $mdToast, User, $q) {
    var $ctrl = this;
    
    $ctrl.baseUrl = function(path) {
    	return require.toUrl('.' + path);
    };
    
    $ctrl.$mdMedia = $mdMedia;
    
    var defaultTotal = $ctrl.total = '\u2026';
    $ctrl.tableSelection = [];
    $ctrl.hierarchySelection = [];
    $ctrl.staticSelected = [];
    $ctrl.allPoints = [];
    $ctrl.tableQuery = {
        limit: 20,
        page: 1,
        order: 'deviceName'
    };
    $ctrl.staticTableQuery = {
        limit: 20,
        page: 1
    };
    $ctrl.queryPreviewTable = {
        limit: 20,
        page: 1
    };
    $ctrl.selectedTab = 0;
    $ctrl.tableUpdateCount = 0;

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
        $ctrl.editWatchlist($ctrl.watchlist);
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
        if (!$ctrl.watchListForm || !$ctrl.watchListForm[name]) return false;
        return $ctrl.watchListForm[name].$invalid && ($ctrl.watchListForm.$submitted || $ctrl.watchListForm[name].$touched);
    };
    
    $ctrl.resetForm = function resetForm() {
        if ($ctrl.watchListForm) {
            $ctrl.watchListForm.$setUntouched();
            $ctrl.watchListForm.$setPristine();
        }
    };
    
    $ctrl.save = function save() {
        var saveMethod = $ctrl.watchlist.isNew ? '$save' : '$updateWithRename';

        // reset all server error messages to allow saving
        angular.forEach($ctrl.watchListForm, function(item, key) {
            if (key.indexOf('$') !== 0) {
                item.$setValidity('server-error', true);
            }
        });
        
        if ($ctrl.watchListForm.$valid) {
            $ctrl.watchlist[saveMethod]().then(function(wl) {
                $ctrl.selectedWatchlist = wl;
                $ctrl.watchlistSelected();
                
                var found = false;
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
                    .textContent(Translate.trSync('ui.app.watchListSaved'))
                    .action(Translate.trSync('common.ok'))
                    .highlightAction(true)
                    .position('bottom center')
                    .hideDelay(2000);
                $mdToast.show(toast);
    
                $ctrl.resetForm();
            }, function(response) {
                // error saving
                var toast = $mdToast.simple()
                    .textContent(Translate.trSync('ui.app.errorSavingWatchlist', response.mangoStatusText))
                    .action(Translate.trSync('common.ok'))
                    .highlightAction(true)
                    .highlightClass('md-warn')
                    .position('bottom center')
                    .hideDelay(5000);
                $mdToast.show(toast);

                $ctrl.selectedTab = 0;
                if (response.data && response.data.validationMessages) {
                    response.data.validationMessages.forEach(function(info) {
                        if ($ctrl.watchListForm[info.property]) {
                            $ctrl.watchListForm[info.property].$setValidity('server-error', false);
                            $ctrl.watchListForm[info.property].serverErrorMessage = info.message;
                        }
                    });
                }
            });
        } else {
            $ctrl.selectedTab = 0;
        }
    };
    
    $ctrl.deleteWatchlist = function deleteWatchlist(event) {
        var confirm = $mdDialog.confirm()
            .title(Translate.trSync('ui.app.areYouSure'))
            .textContent(Translate.trSync('ui.app.confirmDeleteWatchlist'))
            .ariaLabel(Translate.trSync('ui.app.areYouSure'))
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
        if ($state.params.watchListXid) {
            $ctrl.getWatchlist($state.params.watchListXid);
        } else if ($state.params.watchList) {
            // Whole watchlist object sent from watchlist page (save button)
            $ctrl.selectedWatchlist = null;
            var watchlist = $state.params.watchList;
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
                    if ($ctrl.selectedWatchlist && $ctrl.selectedWatchlist.xid === wl.xid) {
                        filtered.push($ctrl.selectedWatchlist);
                    } else {
                        wl.points = [];
                        filtered.push(wl);
                    }
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
        
        $ctrl.clearSearch(false);
        
        if (watchlist.type === 'static') {
            var pointsPromise;
            if (watchlist.isNew) {
                watchlist.points = [];
                pointsPromise = $q.when(watchlist.points);
            } else {
                pointsPromise = watchlist.getPoints();
            }
            $ctrl.watchlistPointsPromise = pointsPromise.then(function() {
                $ctrl.resetSort();
                $ctrl.sortAndLimit();
            });
            $ctrl.doPointQuery();
        } else if (watchlist.type === 'query') {
            if (!watchlist.data) watchlist.data = {};
            if (!watchlist.data.paramValues) watchlist.data.paramValues = {};
            if (!watchlist.query) {
                watchlist.query = 'sort(deviceName,name)&limit(200)';
            }
            $ctrl.queryChanged();
        } else if (watchlist.type === 'hierarchy') {
            // if a user is browsing a hierarchy folder on the watch list page
            // the watchlist will have a hierarchyFolders property, set the folderIds property from this
            if (watchlist.hierarchyFolders) {
                $ctrl.folders = watchlist.hierarchyFolders;
                $ctrl.updateWatchListFolderIds();
            } else {
                if (!watchlist.folderIds)
                    watchlist.folderIds =[];
                
                $ctrl.folders = watchlist.folderIds.map(function(folderId) {
                    return {id: folderId};
                });
            }
        }
        
        
    };
    
    $ctrl.onPaginateOrSort = function onPaginateOrSort() {
        $ctrl.doPointQuery(true);
    };

    $ctrl.doPointQuery = function doPointQuery(isPaginateOrSort) {
        if ($ctrl.queryPromise && typeof $ctrl.queryPromise.cancel === 'function') {
            $ctrl.queryPromise.cancel();
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
        
        var pointQuery = Point.query({rqlQuery: queryObj.toString()});
        pointQuery.$promise.setCancel(pointQuery.$cancelRequest);
        $ctrl.queryPromise = pointQuery.$promise.then(null, function(response) {
            return [];
        });
        
        $q.all([$ctrl.queryPromise, $ctrl.watchlistPointsPromise]).then(function(results) {
            $ctrl.allPoints = results[0];
            $ctrl.total = $ctrl.allPoints.$total || $ctrl.allPoints.length;
            
            $ctrl.updateSelections(true, true);
        });
        
        return $ctrl.queryPromise;
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
    
    $ctrl.clearSearch = function clearSearch(doQuery) {
        $ctrl.tableSearch = '';
        $ctrl.tableQuery.rql = new query.Query();
        if (doQuery || doQuery == null)
            $ctrl.doPointQuery();
    };
    
    $ctrl.queryChanged = function queryChanged() {
        $ctrl.queryPreviewPoints = [];
        $ctrl.queryPreviewTable.total = defaultTotal;
        if ($ctrl.queryPreviewPromise && typeof $ctrl.queryPreviewPromise.cancel === 'function') {
            $ctrl.queryPreviewPromise.cancel();
        }
        $ctrl.queryPreviewPromise = $ctrl.watchlist.getPoints().then(function(watchlistPoints) {
            $ctrl.queryPreviewPoints = watchlistPoints;
            $ctrl.queryPreviewTable.total = watchlistPoints.length;
        }, function() {
            $ctrl.queryPreviewTable.total = 0;
        });
    };

    $ctrl.tableSelectionChanged = function() {
        $ctrl.watchlist.points = $ctrl.tableSelection.slice();
        $ctrl.updateSelections(false, true);
        $ctrl.resetSort();
        $ctrl.sortAndLimit();
    };

    $ctrl.hierarchySelectionChanged = function() {
        var pointXidsToGet = $ctrl.hierarchySelection.map(function(item) {
            return item.xid;
        });
        if (pointXidsToGet.length) {
            // fetch full points
            var ptQuery = new query.Query({name: 'in', args: ['xid'].concat(pointXidsToGet)});
            Point.query({rqlQuery: ptQuery.toString()}).$promise.then(updateSelection);
        } else {
            updateSelection([]);
        }
        
        function updateSelection(points) {
            $ctrl.watchlist.points = points.slice();
            $ctrl.updateSelections(true, false);
            $ctrl.resetSort();
            $ctrl.sortAndLimit();
        }
    };

    $ctrl.updateWatchListFolderIds = function updateWatchListFolderIds() {
        $ctrl.watchlist.folderIds = $ctrl.folders.map(function(folder) {
            return folder.id;
        });
    };
    
    $ctrl.resetSort = function() {
        delete $ctrl.staticTableQuery.order;
    };
    
    $ctrl.sortAndLimit = function() {
        var order = $ctrl.staticTableQuery.order;
        if (order) {
            var desc = false;
            if ((desc = order.indexOf('-') === 0 || order.indexOf('+') === 0)) {
                order = order.substring(1);
            }
            $ctrl.watchlist.points.sort(function(a, b) {
                if (a[order] > b[order]) return desc ? -1 : 1;
                if (a[order] < b[order]) return desc ? 1 : -1;
                return 0;
            });
        }
        
        var limit = $ctrl.staticTableQuery.limit;
        var start = $ctrl.staticTableQuery.start = ($ctrl.staticTableQuery.page - 1) * $ctrl.staticTableQuery.limit;
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
        $ctrl.updateSelections(true, true);
        $ctrl.sortAndLimit();
    };
    
    $ctrl.updateSelections = function(updateTable, updateHierarchy) {
        if (updateTable) {
            // ensures that rows are re-rendered every time we update the table selections
            $ctrl.tableUpdateCount++;
            
            // updates the table selection with a shallow copy of the watch list points
            // so that md-data-table's $watchcollection detects a change for each point
            $ctrl.tableSelection = $ctrl.watchlist.points.map(function(point) {
                return angular.extend(Object.create(Point.prototype), point);
            });
            
            var pointMap = {};
            $ctrl.tableSelection.forEach(function(point) {
                pointMap[point.xid] = point;
            });

            // replace the point in all points with the exact one from the table selection so the table is updated
            // correctly
            $ctrl.allPoints = $ctrl.allPoints.map(function(point, i) {
                return pointMap[point.xid] || point;
            });
        }
        if (updateHierarchy) {
            $ctrl.hierarchySelection = $ctrl.watchlist.points.slice();
        }
    };

    // track points in table by their xid and an incrementing count
    // ensures that rows are re-rendered every time we update the table selections
    $ctrl.pointTrack = function(point) {
        return '' + $ctrl.tableUpdateCount + '_' + point.xid;
    };
}

return {
    controller: WatchListBuilderController,
    templateUrl: require.toUrl('./watchListBuilder.html')
};

}); // define
