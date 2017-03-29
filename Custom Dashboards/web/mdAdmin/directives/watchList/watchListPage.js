/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require', 'rql/query'], function(angular, require, query) {
'use strict';

function watchListPageDirective() {
    return {
        restrict: 'E',
        templateUrl: require.toUrl('./watchListPage.html'),
        scope: {},
        controller: WatchListPageController,
        controllerAs: '$ctrl',
        bindToController: {
            watchList: '<?'
        }
    };
}

WatchListPageController.$inject = ['$mdMedia', 'WatchList', 'Translate', 'localStorageService', '$state', 'PointHierarchy',
    'mdAdminSettings', 'DateBar', '$mdDialog', 'statistics', '$scope', '$mdColorPicker'];
function WatchListPageController($mdMedia, WatchList, Translate, localStorageService, $state, PointHierarchy,
        mdAdminSettings, DateBar, $mdDialog, statistics, $scope, $mdColorPicker) {
    
    this.baseUrl = require.toUrl('.');
    this.watchList = null;
    this.selectWatchList = null;
    this.dataSource = null;
    this.deviceName = null;
    this.hierarchyFolders = [];
    this.settings = mdAdminSettings;
    this.dateBar = DateBar;

    this.selected = [];
    this.selectedStats = [];
    
    var defaultAxisColor = mdAdminSettings.theming.THEMES[mdAdminSettings.activeTheme].isDark ? '#FFFFFF' : '#000000';
    var defaultChartConfig = {
        graphOptions: [],
        selectedAxis: 'left',
        selectedColor: '#C2185B',
        selectedStackType: 'none',
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
    var NO_STATS = '\u2014';

    this.selectFirstWatchList = false;
    this.$mdMedia = $mdMedia;
    this.numberOfRows = $mdMedia('gt-sm') ? 200 : 25;
    this.downloadStatus = {};
    this.chartOptions = {
        selectedAxis: 'left',
        axes: {}
    };

    this.$onInit = function() {
        var localStorage = localStorageService.get('watchListPage') || {};
        var params = $state.params;
        
        if (params.watchListXid || !(params.dataSourceXid || params.deviceName || params.hierarchyFolderId) && localStorage.watchListXid) {
            this.watchListXid = params.watchListXid || localStorage.watchListXid;
            this.listType = 'watchLists';
        } else if (params.dataSourceXid || !(params.deviceName || params.hierarchyFolderId) && localStorage.dataSourceXid) {
            this.dataSourceXid = params.dataSourceXid || localStorage.dataSourceXid;
            this.listType = 'dataSources';
        } else if (params.deviceName || !params.hierarchyFolderId && localStorage.deviceName) {
            this.deviceName = params.deviceName || localStorage.deviceName;
            this.listType = 'deviceNames';
            this.deviceNameChanged();
        } else if (params.hierarchyFolderId || localStorage.hierarchyFolderId) {
            this.listType = 'hierarchy';
            var hierarchyFolderId = params.hierarchyFolderId || localStorage.hierarchyFolderId;
            
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
            this.selectFirstWatchList = $mdMedia('gt-md');
        }
        
        $scope.$watch(function() {
            return {
                //points: this.selected && this.selected.map(function(pt) { return pt.xid }),
                from: this.dateBar.from.valueOf(),
                to: this.dateBar.to.valueOf()
            };
        }.bind(this), this.updateStats.bind(this), true);
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
        this.watchList = null;

        // clear checked points from table/chart
        this.clearSelected();
        
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
    
    this.clearSelected = function () {
        this.selected = [];
        this.selectedStats = [];
        this.chartConfig = {};
        if (this.watchList && this.watchList.data) {
            this.watchList.data.chartConfig = this.chartConfig;
        }
    };
    
    this.rebuildChart = function() {
        // causes the chart to update
        this.watchList = angular.extend(new WatchList(), this.watchList);
    };

    this.watchListChanged = function watchListChanged() {
        var watchListXid = null;

        this.clear('watchList');
        
        this.watchList = this.selectWatchList;
        if (this.watchList) {
            watchListXid = this.watchList.xid;

            if (!this.watchList.data) {
                this.watchList.data = {};
            }
            if (!this.watchList.data.chartConfig) {
                this.watchList.data.chartConfig = {};
            }
            if (this.watchList.data.paramValues) {
                this.watchListParams = this.watchList.data.paramValues;
            }
            
            this.chartConfig = this.watchList.data.chartConfig;

            this.getPoints();
        }

        this.updateState({
            watchListXid: watchListXid
        });
    };

    this.getPoints = function getPoints(parameters) {
        if (parameters) {
            this.watchListParams = parameters;
        }
        this.pointsPromise = this.watchList.getPoints(this.watchListParams).then(null, angular.noop).then(function(points) {
            this.points = points || [];
            
            if (this.watchList.data && this.watchList.data.chartConfig && this.watchList.data.chartConfig.selectedPoints) {
                var selectedPoints = this.watchList.data.chartConfig.selectedPoints;
                this.selected = this.points.filter(function(point) {
                    return selectedPoints[point.name];
                });
                this.updateStats();
            }
        }.bind(this));
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

            var watchList = new WatchList();
            watchList.isNew = true;
            watchList.type = 'query';
            watchList.name = Translate.trSync('dashboards.v3.app.dataSourceX', [this.dataSource.name]);
            watchList.query = dsQuery.toString();
            watchList.data = {
                chartConfig: {}
            };
            this.watchList = watchList;
            this.chartConfig = this.watchList.data.chartConfig;
            this.getPoints();
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

            var watchList = new WatchList();
            watchList.isNew = true;
            watchList.type = 'query';
            watchList.name = Translate.trSync('dashboards.v3.app.deviceNameX', [this.deviceName]);
            watchList.query = dnQuery.toString();
            watchList.data = {
                chartConfig: {}
            };
            this.watchList = watchList;
            this.chartConfig = this.watchList.data.chartConfig;
            this.getPoints();
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
            watchList.data = {
                chartConfig: {}
            };
            this.watchList = watchList;
            this.chartConfig = this.watchList.data.chartConfig;
            this.getPoints();
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
        this.watchList.data.paramValues = this.watchListParams;
        
        if (this.watchList.isNew) {
            $state.go('dashboard.settings.watchListBuilder', {watchList: this.watchList});
        } else {
            this.watchList.$update();
        }
    };
    
    this.selectedPointsChanged = function() {
        var oldSelectedPoints = this.chartConfig.selectedPoints || {};
        var newSelectedPoints = this.chartConfig.selectedPoints = {};
        
        var newPointChartOptions = {};
        if (this.chartOptions.configPoint) {
            if (this.chartOptions.pointColor)
                newPointChartOptions.lineColor = this.chartOptions.pointColor;
            if (this.chartOptions.pointChartType)
                newPointChartOptions.type = this.chartOptions.pointChartType;
            if (this.chartOptions.pointAxis)
                newPointChartOptions.valueAxis = this.chartOptions.pointAxis;
        }
        
        this.selected.forEach(function(point) {
            newSelectedPoints[point.name] = oldSelectedPoints[point.name] || newPointChartOptions;
        });
        
        this.rebuildChart();
        this.updateStats();
    }.bind(this);

    this.updateStats = function() {
        var selectedStats = this.selectedStats = [];
        
        if (!this.selected) {
            return;
        }
        
        var points = this.selected;
        var from = this.dateBar.from;
        var to = this.dateBar.to;
        
        points.forEach(function(point) {
            var ptStats = {
                name: point.name,
                device: point.deviceName,
                xid: point.xid
            };
            selectedStats.push(ptStats);
            
            statistics.getStatisticsForXid(point.xid, {
                from: from,
                to: to,
                rendered: true
            }).then(function(stats) {
                ptStats.average = stats.average ? stats.average.value : NO_STATS;
                ptStats.minimum = stats.minimum ? stats.minimum.value : NO_STATS;
                ptStats.maximum = stats.maximum ? stats.maximum.value : NO_STATS;
                ptStats.sum = stats.sum ? stats.sum.value : NO_STATS;
                ptStats.first = stats.first ? stats.first.value : NO_STATS;
                ptStats.last = stats.last ? stats.last.value : NO_STATS;
                ptStats.count = stats.count;
                
                ptStats.averageValue = parseFloat(stats.average && stats.average.value);
                ptStats.minimumValue = parseFloat(stats.minimum && stats.minimum.value);
                ptStats.maximumValue = parseFloat(stats.maximum && stats.maximum.value);
                ptStats.sumValue = parseFloat(stats.sum && stats.sum.value);
                ptStats.firstValue = parseFloat(stats.first && stats.first.value);
                ptStats.lastValue = parseFloat(stats.last && stats.last.value);
            });
        });
    };

    this.showColorPicker = function($event, object, propertyName, rebuild) {
        if (!object) return;

        $mdColorPicker.show({
            value: object[propertyName] || '#fff',
            defaultValue: '',
            random: false,
            clickOutsideToClose: true,
            hasBackdrop: true,
            skipHide: false,
            preserveScope: false,
            mdColorAlphaChannel: true,
            mdColorSpectrum: true,
            mdColorSliders: false,
            mdColorGenericPalette: true,
            mdColorMaterialPalette: false,
            mdColorHistory: false,
            mdColorDefaultTab: 0,
            $event: $event
        }).then(function(color) {
            object[propertyName] = color;
            if (rebuild) {
                this.rebuildChart();
            }
        }.bind(this));
    };

    this.showDownloadDialog = function showDownloadDialog($event) {
        $mdDialog.show({
            controller: ['DateBar', 'pointValues', 'mdAdminSettings', 'Util', function(DateBar, pointValues, mdAdminSettings, Util) {
                this.dateBar = DateBar;
                this.mdAdminSettings = mdAdminSettings;
                
                this.downloadData = function downloadData(downloadType, all) {
                    var points = all ? this.points : this.selected;
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
                downloadStatus: this.downloadStatus,
                points: this.points
            }
        });
    };
}

return watchListPageDirective;

}); // define