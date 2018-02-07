/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require', 'rql/query', 'tinycolor'], function(angular, require, query, tinycolor) {
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

WatchListPageController.$inject = ['$mdMedia', 'maWatchList', 'maTranslate', 'localStorageService', '$state', 'maPointHierarchy',
    'maUiDateBar', '$mdDialog', 'maStatistics', '$scope', '$mdColorPicker'];
function WatchListPageController($mdMedia, WatchList, Translate, localStorageService, $state, PointHierarchy,
        maUiDateBar, $mdDialog, statistics, $scope, $mdColorPicker) {

    this.baseUrl = function(path) {
    	return require.toUrl('.' + path);
    };
    this.watchList = null;
    this.selectWatchList = null;
    this.dataSource = null;
    this.deviceName = null;
    this.hierarchyFolders = [];
    this.dateBar = maUiDateBar;

    this.selected = [];
    this.selectedStats = [];

    const NO_STATS = '\u2014';

    this.selectFirstWatchList = false;
    this.$mdMedia = $mdMedia;
    this.numberOfRows = $mdMedia('gt-sm') ? 100 : 25;
    this.pageNumber = 1;
    this.tableOrder = '';
    
    this.downloadStatus = {};
    this.chartOptions = {
        selectedAxis: 'left',
        axes: {}
    };
    this.axisOptions = [
        {name: 'left', translation: 'ui.app.left'},
        {name: 'right', translation: 'ui.app.right'},
        {name: 'left-2', translation: 'ui.app.farLeft'},
        {name: 'right-2', translation: 'ui.app.farRight'}
    ];
    
    this.watchListParams = {};

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

        this.dateBar.subscribe((event, changedProperties) => {
            this.updateStats();
        }, $scope);
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
        this.chartConfig = {
    		selectedPoints: []
        };
        if (this.watchList) {
        	if (!this.watchList.data) this.watchList.data = {};
            this.watchList.data.chartConfig = this.chartConfig;
        }
        this.updateSelectedPointMaps();
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
            this.watchList.defaultParamValues(this.watchListParams);
            
            this.chartConfig = this.watchList.data.chartConfig;
            if (this.chartConfig.selectedPoints) {
            	// convert old object with point names as keys to array form
            	if (!angular.isArray(this.chartConfig.selectedPoints)) {
            		var selectedPointConfigs = [];
            		for (var ptName in this.chartConfig.selectedPoints) {
            			var config = this.chartConfig.selectedPoints[ptName];
            			config.name = ptName;
            			selectedPointConfigs.push(config);
            		}
            		this.chartConfig.selectedPoints = selectedPointConfigs;
            	}
            } else {
            	this.chartConfig.selectedPoints = [];
            }

            this.updateSelectedPointMaps();
            this.getPoints();
        }

        this.updateState({
            watchListXid: watchListXid
        });
    };

    this.getPoints = function getPoints() {
        if (this.wlPointsPromise) {
            this.wlPointsPromise.cancel();
        }
        
        this.wlPointsPromise = this.watchList.getPoints(this.watchListParams);
        this.pointsPromise = this.wlPointsPromise.then(null, angular.noop).then(function(points) {
            this.points = points || [];
            
            var pointNameCounts = this.pointNameCounts = {};
            this.points.forEach(function(pt) {
            	var count = pointNameCounts[pt.name];
            	pointNameCounts[pt.name] = (count || 0) + 1;
            });

            this.selected = this.points.filter(function(point) {
            	var pointOptions = this.selectedPointConfigsByXid[point.xid];
            	if (!pointOptions && pointNameCounts[point.name] === 1) {
            		pointOptions = this.selectedPointConfigsByName[point.name];
            	}
            	if (pointOptions) return point;
            }.bind(this));
            this.updateStats();
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
                .limit(1000);

            var watchList = new WatchList();
            watchList.isNew = true;
            watchList.type = 'query';
            watchList.name = Translate.trSync('ui.app.dataSourceX', [this.dataSource.name]);
            watchList.query = dsQuery.toString();
            this.watchList = watchList;
            this.clearSelected();
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
                .limit(1000);

            var watchList = new WatchList();
            watchList.isNew = true;
            watchList.type = 'query';
            watchList.name = Translate.trSync('ui.app.deviceNameX', [this.deviceName]);
            watchList.query = dnQuery.toString();
            this.watchList = watchList;
            this.clearSelected();
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
            watchList.name = Translate.trSync('ui.app.hierarchyFolderX', [this.hierarchyFolders[0].name]);
            watchList.hierarchyFolders = this.hierarchyFolders;
            this.watchList = watchList;
            this.clearSelected();
            this.getPoints();
        }

        this.updateState({
            hierarchyFolderId: hierarchyFolderId
        });
    };

    this.editWatchList = function editWatchList(watchList) {
        $state.go('ui.settings.watchListBuilder', {watchListXid: watchList ? watchList.xid : null});
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
        this.watchList.data.paramValues = angular.copy(this.watchListParams);
        
        if (this.watchList.isNew) {
            $state.go('ui.settings.watchListBuilder', {watchList: this.watchList});
        } else {
            this.watchList.$update();
        }
    };
    
    this.updateSelectedPointMaps = function() {
        this.selectedPointConfigsByName = {};
        this.selectedPointConfigsByXid = {};
        this.chartConfig.selectedPoints.forEach(function(ptConfig) {
        	this.selectedPointConfigsByName[ptConfig.name] = ptConfig;
        	if (ptConfig.xid) {
        		this.selectedPointConfigsByXid[ptConfig.xid] = ptConfig;
        	}
        }.bind(this));
    };
    
    this.selectedPointsChanged = function() {
        var newSelectedPoints = this.chartConfig.selectedPoints = [];
        
        var newPointChartOptions = {};
        if (this.chartOptions.configNextPoint) {
            if (this.chartOptions.pointColor)
                newPointChartOptions.lineColor = this.chartOptions.pointColor;
            if (this.chartOptions.pointChartType)
                newPointChartOptions.type = this.chartOptions.pointChartType;
            if (this.chartOptions.pointAxis)
                newPointChartOptions.valueAxis = this.chartOptions.pointAxis;
        }
        
        this.selected.forEach(function(point) {
        	var config = this.selectedPointConfigsByXid[point.xid] ||
        		(this.pointNameCounts[point.name] === 1 && this.selectedPointConfigsByName[point.name]) ||
        		newPointChartOptions;
        	config.name = point.name;
        	config.xid = point.xid;
        	newSelectedPoints.push(config);
        }.bind(this));
        
        this.updateSelectedPointMaps();

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
    
    this.chooseAxisColor = function($event, axisName) {
        if (!this.chartConfig.valueAxes) {
            this.chartConfig.valueAxes = {};
        }
        if (!this.chartConfig.valueAxes[axisName]) {
            this.chartConfig.valueAxes[axisName] = {};
        }
        this.showColorPicker($event, this.chartConfig.valueAxes[axisName], 'color', true);
    };

    this.showColorPicker = function($event, object, propertyName, rebuild) {
        if (!object) return;
        
        $mdColorPicker.show({
            value: object[propertyName] || tinycolor.random().toHexString(),
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
            controller: ['maUiDateBar', 'maPointValues', 'maUtil', 'MA_ROLLUP_TYPES', 'MA_DATE_TIME_FORMATS', 'maUser',
                    function(maUiDateBar, pointValues, Util, MA_ROLLUP_TYPES, MA_DATE_TIME_FORMATS, maUser) {
                
                this.dateBar = maUiDateBar;
                this.rollupTypes = MA_ROLLUP_TYPES;
                this.rollupType = 'NONE';
                this.timeFormats = MA_DATE_TIME_FORMATS;
                this.timeFormat = this.timeFormats[0].format;
                this.allPoints = !this.selected.length;

                this.timezones = [{
                    translation: 'ui.app.timezone.user',
                    value: maUser.current.getTimezone(),
                    id: 'user'
                }, {
                    translation: 'ui.app.timezone.server',
                    value: maUser.current.systemTimezone,
                    id: 'server'
                }, {
                    translation: 'ui.app.timezone.utc',
                    value: 'UTC',
                    id: 'utc'
                }];
                
                this.timezone = this.timezones[0];
                
                this.downloadData = function downloadData(downloadType) {
                    var points = this.allPoints ? this.points : this.selected;
                    var xids = points.map(function(pt) {
                        return pt.xid;
                    });
                    
                    var functionName = downloadType.indexOf('COMBINED') > 0 ? 'getPointValuesForXidsCombined' : 'getPointValuesForXids';
                    var mimeType = downloadType.indexOf('CSV') === 0 ? 'text/csv' : 'application/json';
                    var extension = downloadType.indexOf('CSV') === 0 ? 'csv' : 'json';
                    var fileName = this.watchList.name + '_' + maUiDateBar.from.toISOString() + '_' + maUiDateBar.to.toISOString() + '.' + extension;

                    this.downloadStatus.error = null;
                    this.downloadStatus.downloading = true;
                    
                    this.downloadStatus.queryPromise = pointValues[functionName](xids, {
                        mimeType: mimeType,
                        responseType: 'blob',
                        from: maUiDateBar.from,
                        to: maUiDateBar.to,
                        rollup: this.rollupType,
                        rollupInterval: maUiDateBar.rollupIntervals,
                        rollupIntervalType: maUiDateBar.rollupIntervalPeriod,
                        limit: -1,
                        timeout: 0,
                        dateTimeFormat: this.timeFormat,
                        timezone: this.timezone.value
                    }).then(function(response) {
                        this.downloadStatus.downloading = false;
                        Util.downloadBlob(response, fileName);
                    }.bind(this), function(response) {
                        this.downloadStatus.error = response.mangoStatusText;
                        this.downloadStatus.downloading = false;
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