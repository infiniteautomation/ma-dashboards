/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require', 'rql/query'], function(angular, require, query) {
'use strict';

watchListPageController.$inject = ['$mdMedia', 'WatchList', 'Translate', 'localStorageService', '$state', 'PointHierarchy', 'mdAdminSettings', 'DateBar', '$mdDialog'];
function watchListPageController($mdMedia, WatchList, Translate, localStorageService, $state, PointHierarchy, mdAdminSettings, DateBar, $mdDialog) {
    this.baseUrl = require.toUrl('.');
    this.watchList = null;
    this.selectWatchList = null;
    this.dataSource = null;
    this.deviceName = null;
    this.hierarchyFolders = [];
    this.settings = mdAdminSettings;
    this.dateBar = DateBar;

    var defaultAxisColor = mdAdminSettings.theming.THEMES[mdAdminSettings.activeTheme].isDark ? '#FFFFFF' : '#000000';
    var defaultChartConfig = {
        graphOptions: [],
        selectedAxis: 'left',
        selectedColor: '#C2185B',
        assignColors: false,
        chartType: 'smoothedLine',
        stackType: {
            selected: 'none',
            left: 'none',
            right: 'none',
            'left-2': 'none',
            'right-2': 'none'
        },
        axisColors: { 
            left2AxisColor: defaultAxisColor,
            leftAxisColor: defaultAxisColor,
            right2AxisColor: defaultAxisColor,
            rightAxisColor: defaultAxisColor
        }
    };

    this.selectFirstWatchList = $mdMedia('gt-md');
    this.$mdMedia = $mdMedia;
    this.numberOfRows = $mdMedia('gt-sm') ? 200 : 25;
    
    this.$onInit = function() {
        var localStorage = localStorageService.get('watchListPage') || {};
        
        if ($state.params.watchListXid || localStorage.watchListXid) {
            this.watchListXid = $state.params.watchListXid || localStorage.watchListXid;
            this.listType = 'watchLists';
        } else if ($state.params.dataSourceXid || localStorage.dataSourceXid) {
            this.dataSourceXid = $state.params.dataSourceXid || localStorage.dataSourceXid;
            this.listType = 'dataSources';
        } else if ($state.params.deviceName || localStorage.deviceName) {
            this.deviceName = $state.params.deviceName || localStorage.deviceName;
            this.listType = 'deviceNames';
            this.deviceNameChanged();
        } else if ($state.params.hierarchyFolderId || localStorage.hierarchyFolderId) {
            this.listType = 'hierarchy';
            var hierarchyFolderId = $state.params.hierarchyFolderId || localStorage.hierarchyFolderId;
            
            PointHierarchy.get({id: hierarchyFolderId, points: false}).$promise.then(function(folder) {
                var folders = [];
                PointHierarchy.walkHierarchy(folder, function(folder, parent, index) {
                    folders.push(folder);
                });
                this.hierarchyFolders = folders;
                this.hierarchyChanged();
            }.bind(this));
        } else {
            this.listType = 'watchLists';
        }
    };

    this.updateState = function(state) {
        var localStorageParams = {};
        
        ['watchListXid', 'dataSourceXid', 'deviceName', 'hierarchyFolderId'].forEach(function(key) {
            var value = state[key];
            if (value) {
                localStorageParams[key] = value; 
                $state.params[key] = value; 
            } else {
                $state.params[key] = null;
            }
        });

        localStorageService.set('watchListPage', localStorageParams);
        $state.go('.', $state.params, {location: 'replace', notify: false});
    };

    this.clear = function clear(type) {
        // clear checked points from table/chart
        this.selected = [];
        
        this.watchList = null;

        // clear selections
        if (type !== 'watchList')
            this.selectWatchList = null;
        if (type !== 'dataSource')
            this.dataSource = null;
        if (type !== 'deviceName')
            this.deviceName = null;
        if (type !== 'hierarchy')
            this.hierarchyFolders = [];
    };

    this.watchListChanged = function watchListChanged() {
        var watchListXid = null;

        this.clear('watchList');
        
        this.watchList = this.selectWatchList;
        if (this.watchList) {
            watchListXid = this.watchList.xid;

            // clear checked points from table/chart or Load from watchList
            if (this.watchList.data && this.watchList.data.selectedPoints.length > 0) {
                this.selected = this.watchList.data.selectedPoints;
            }
			
            this.chartConfig = this.watchList.data ? this.watchList.data.chartConfig : defaultChartConfig;
            
            if (this.watchList.data && this.watchList.data.paramValues) {
                this.watchListParams = this.watchList.data.paramValues;
            }

            this.updateWatchListParameters();
        }

        this.updateState({
            watchListXid: watchListXid
        });
    };
    
    this.updateWatchListParameters = function updateWatchListParameters(parameters) {
        if (parameters) {
            this.watchListParams = parameters;
        }
        this.watchList.$getPoints(this.watchListParams);
    };
    
    this.dataSourceChanged = function dataSourceChanged() {
        var dataSourceXid = null;

        this.clear('dataSource');
        
        if (this.dataSource) {
            dataSourceXid = this.dataSource.xid;
            
            var dsQuery = new query.Query()
                .eq('dataSourceXid', this.dataSource.xid)
                .sort('name')
                .limit(200);

            this.chartConfig = defaultChartConfig;

            var watchList = new WatchList();
            watchList.isNew = true;
            watchList.type = 'query';
            watchList.name = Translate.trSync('dashboards.v3.app.dataSourceX', [this.dataSource.name]);
            watchList.query = dsQuery.toString();
            watchList.$getPoints();
            this.watchList = watchList;
        }

        this.updateState({
            dataSourceXid: dataSourceXid
        });
    };
    
    this.deviceNameChanged = function deviceNameChanged() {
        this.clear('deviceName');
        
        if (this.deviceName) {
            var dnQuery = new query.Query()
                .eq('deviceName', this.deviceName)
                .sort('name')
                .limit(200);

            this.chartConfig = defaultChartConfig;
            
            var watchList = new WatchList();
            watchList.isNew = true;
            watchList.type = 'query';
            watchList.name = Translate.trSync('dashboards.v3.app.deviceNameX', [this.deviceName]);
            watchList.query = dnQuery.toString();
            watchList.$getPoints();
            this.watchList = watchList;
        }

        this.updateState({
            deviceName: this.deviceName
        });
    };
    
    this.hierarchyChanged = function hierarchyChanged() {
        var hierarchyFolderId = null;
        
        this.clear('hierarchy');

        if (this.hierarchyFolders && this.hierarchyFolders.length) {
            hierarchyFolderId = this.hierarchyFolders[0].id;
            
            var watchList = new WatchList();
            watchList.isNew = true;
            watchList.type = 'hierarchy';
            watchList.name = Translate.trSync('dashboards.v3.app.hierarchyFolderX', [this.hierarchyFolders[0].name]);
            watchList.hierarchyFolders = this.hierarchyFolders;
            watchList.$getPoints();
            this.watchList = watchList;
            this.chartConfig = defaultChartConfig;
        }

        this.updateState({
            hierarchyFolderId: hierarchyFolderId
        });
    };

    this.editWatchList = function editWatchList(watchList) {
        $state.go('dashboard.settings.watchListBuilder', {watchListXid: watchList ? watchList.xid : null});
    };
    
    this.updateQuery = function updateQuery() {
        var filterText = '*' + this.filter + '*';
        var rqlQuery = new query.Query({name: 'or', args: []});
        rqlQuery.push(new query.Query({name: 'like', args: ['name', filterText]}));
        this.dataSourceQuery = rqlQuery.toString();
        rqlQuery.push(new query.Query({name: 'like', args: ['username', filterText]}));
        this.watchListQuery = rqlQuery.toString();
    };
    
    this.saveSettings = function saveSettings() {
        this.watchList.data = {};
        this.watchList.data.selectedPoints = this.selected;
        this.watchList.data.chartConfig = this.chartConfig;
        this.watchList.data.paramValues = this.watchListParams;
        
        if (this.watchList.isNew) {
            $state.go('dashboard.settings.watchListBuilder', {watchList: this.watchList});
        }
        else {
            this.watchList.$update();
        }
    };
    
    this.downloadStatus = {};
    
    this.showDownloadDialog = function showDownloadDialog($event) {
        $mdDialog.show({
            controller: ['DateBar', 'pointValues', 'mdAdminSettings', 'Util', function(DateBar, pointValues, mdAdminSettings, Util) {
                this.dateBar = DateBar;
                this.mdAdminSettings = mdAdminSettings;
                
                this.downloadData = function downloadData(downloadType, all) {
                    var points = all ? this.watchList.points : this.selected;
                    var xids = points.map(function(pt) {
                        return pt.xid;
                    });
                    
                    var functionName = downloadType.indexOf('COMBINED') > 0 ? 'getPointValuesForXidsCombined' : 'getPointValuesForXids';
                    var mimeType = downloadType.indexOf('CSV') === 0 ? 'text/csv' : 'application/json';
                    var extension = downloadType.indexOf('CSV') === 0 ? 'csv' : 'json';
                    var fileName = this.watchList.name + '_' + DateBar.from.toISOString() + '_' + DateBar.to.toISOString() + '.' + extension;

                    this.downloadStatus.error = null;
                    this.downloadStatus.downloading = true;
                    
                    this.downloadStatus.queryPromise = pointValues[functionName](xids, {
                        mimeType: mimeType,
                        responseType: 'blob',
                        from: DateBar.from,
                        to: DateBar.to,
                        rollup: DateBar.rollupType,
                        rollupInterval: DateBar.rollupIntervals,
                        rollupIntervalType: DateBar.rollupIntervalPeriod
                    }).then(function(response) {
                        this.downloadStatus.downloading = false;
                        Util.downloadBlob(response, fileName);
                    }.bind(this), function(response) {
                        this.downloadStatus.error = response.statusText || response.message || (response.status === -1 ? Translate.trSync('dashboards.v3.app.cancelledOrNoResponse') : response.toString());
                        this.downloadStatus.downloading = false;
                        console.log(response);
                    }.bind(this));
                };
                
                this.cancelDownload = function cancelDownload() {
                    this.downloadStatus.queryPromise.cancel();
                };
                
                this.cancel = function cancel() {
                    $mdDialog.cancel();
                };
            }],
            templateUrl: require.toUrl('./downloadDialog.html'),
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: true,
            fullscreen: $mdMedia('xs') || $mdMedia('sm'),
            bindToController: true,
            controllerAs: '$ctrl',
            locals: {
                watchList: this.watchList,
                selected: this.selected,
                downloadStatus: this.downloadStatus
            }
        });
    };
}

return {
    controller: watchListPageController,
    templateUrl: require.toUrl('./watchListPage.html'),
    bindings: {
        watchList: '<?'
    }
};

}); // define