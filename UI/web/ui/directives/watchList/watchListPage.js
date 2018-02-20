/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'rql/query', 'tinycolor'], function(angular, require, query, tinycolor) {
'use strict';

const NO_STATS = '\u2014';

class WatchListPageController {
    static get $$ngIsClass() { return true; }

    static get $inject() {
        return [
            '$mdMedia',
            'localStorageService',
            '$state',
            'maUiDateBar',
            '$mdDialog',
            'maStatistics',
            '$scope',
            '$mdColorPicker'
            ];
    }

    constructor(
            $mdMedia,
            localStorageService,
            $state,
            maUiDateBar,
            $mdDialog,
            maStatistics,
            $scope,
            $mdColorPicker) {

        this.$mdMedia = $mdMedia;
        this.localStorageService = localStorageService;
        this.$state = $state;
        this.dateBar = maUiDateBar;
        this.$mdDialog = $mdDialog;
        this.maStatistics = maStatistics;
        this.$scope = $scope;
        this.$mdColorPicker = $mdColorPicker;

        this.selected = [];
        this.selectedStats = [];
        this.watchListParams = {};

        this.selectFirstWatchList = false;
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

        this.selectedPointsChangedBound = (...args) => this.selectedPointsChanged(...args);
    }

    baseUrl(path) {
        return require.toUrl('.' + path);
    }

    $onInit() {
        const localStorage = this.localStorageService.get('watchListPage') || {};
        const params = this.$state.params;

        if (params.watchListXid || !(params.dataSourceXid || params.deviceName || params.hierarchyFolderId || params.tags) && localStorage.watchListXid) {
            const watchListXid = params.watchListXid || localStorage.watchListXid;
            this.pointBrowserLoadItem = {watchListXid};
        } else if (params.dataSourceXid || !(params.deviceName || params.hierarchyFolderId || params.tags) && localStorage.dataSourceXid) {
            const dataSourceXid = params.dataSourceXid || localStorage.dataSourceXid;
            this.pointBrowserLoadItem = {dataSourceXid};
        } else if (params.deviceName || !(params.hierarchyFolderId || params.tags) && localStorage.deviceName) {
            const deviceName = params.deviceName || localStorage.deviceName;
            this.pointBrowserLoadItem = {deviceName};
        } else if (params.hierarchyFolderId || !params.tags && localStorage.hierarchyFolderId) {
            const hierarchyFolderId = params.hierarchyFolderId || localStorage.hierarchyFolderId;
            this.pointBrowserLoadItem = {hierarchyFolderId};
        } else if (params.tags || localStorage.tags) {
            if (params.tags) {
                this.pointBrowserLoadItem = {tags: this.parseTagsParam(params.tags)};
            } else {
                this.pointBrowserLoadItem = {tags: localStorage.tags};
            }
        } else if (this.$mdMedia('gt-md')) {
            // select first watch list automatically for large displays
            this.pointBrowserLoadItem = {firstWatchList: true};
        }

        this.dateBar.subscribe((event, changedProperties) => {
            this.updateStats();
        }, this.$scope);
    }
    
    parseTagsParam(param) {
        const tags = {};
        const paramArray = Array.isArray(param) ? param : [param];
        
        paramArray.forEach(p => {
            const parts = p.split(':');
            if (parts.length === 2) {
                const tagKey = parts[0];
                const values = parts[1].split(',');
                
                if (!tags[tagKey]) {
                    tags[tagKey] = [];
                }
                tags[tagKey].push(...values);
            }
        });

        return tags;
    }

    formatTagsParam(tags) {
        const param = [];
        
        Object.keys(tags).forEach(tagKey => {
            const tagValue = tags[tagKey];
            const tagValueArray = Array.isArray(tagValue) ? tagValue : [tagValue];
            
            const paramValue = tagValueArray.join(',');
            param.push(`${tagKey}:${paramValue}`);
        });
        
        return param;
    }
    
    updateState(state) {
        const localStorageParams = {};

        ['watchListXid', 'dataSourceXid', 'deviceName', 'hierarchyFolderId', 'tags'].forEach(key => {
            const value = state[key];
            if (value) {
                localStorageParams[key] = value; 
                this.$state.params[key] = value; 
            } else {
                this.$state.params[key] = null;
            }
        });
        
        if (state.tags) {
            this.$state.params.tags = this.formatTagsParam(state.tags); 
        }

        this.localStorageService.set('watchListPage', localStorageParams);
        this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
    }

    clearWatchList() {
        this.watchList = null;
        // clear checked points from table/chart
        this.clearSelected();
    }

    clearSelected() {
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
    }

    rebuildChart() {
        // shallow copy causes the chart to update
        this.watchList = Object.assign(Object.create(this.watchList.constructor.prototype), this.watchList);
    }

    watchListChanged() {
        // clear checked points from table/chart
        this.selected = [];
        this.selectedStats = [];

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
            if (!Array.isArray(this.chartConfig.selectedPoints)) {
                const selectedPointConfigs = [];
                for (let ptName in this.chartConfig.selectedPoints) {
                    const config = this.chartConfig.selectedPoints[ptName];
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

        const stateUpdate = {};
        if (!this.watchList.isNew) {
            stateUpdate.watchListXid = this.watchList.xid;
        } else if (this.watchList.type === 'query' && this.watchList.deviceName) {
            stateUpdate.deviceName = this.watchList.deviceName;
        } else if (this.watchList.type === 'query' && this.watchList.dataSourceXid) {
            stateUpdate.dataSourceXid = this.watchList.dataSourceXid;
        } else if (this.watchList.type === 'hierarchy' && Array.isArray(this.watchList.hierarchyFolders) && this.watchList.hierarchyFolders.length) {
            stateUpdate.hierarchyFolderId = this.watchList.hierarchyFolders[0].id;
        } else if (this.watchList.type === 'tags' && this.watchList.tags) {
            stateUpdate.tags = this.watchList.tags;
        }
        
        this.updateState(stateUpdate);
    }

    getPoints() {
        if (this.wlPointsPromise) {
            this.wlPointsPromise.cancel();
        }

        this.points = [];
        this.wlPointsPromise = this.watchList.getPoints(this.watchListParams);
        this.pointsPromise = this.wlPointsPromise.then(null, angular.noop).then(points => {
            this.points = points || [];

            const pointNameCounts = this.pointNameCounts = {};
            this.points.forEach(pt => {
                const count = pointNameCounts[pt.name];
                pointNameCounts[pt.name] = (count || 0) + 1;
            });

            this.selected = this.points.filter(point => {
                let pointOptions = this.selectedPointConfigsByXid[point.xid];
                if (!pointOptions && pointNameCounts[point.name] === 1) {
                    pointOptions = this.selectedPointConfigsByName[point.name];
                }
                if (pointOptions) return point;
            });
            this.updateStats();
        });
    }

    editWatchList(watchList) {
        this.$state.go('ui.settings.watchListBuilder', {watchListXid: watchList ? watchList.xid : null});
    }

    saveSettings() {
        this.watchList.data.paramValues = angular.copy(this.watchListParams);

        if (this.watchList.isNew) {
            this.$state.go('ui.settings.watchListBuilder', {watchList: this.watchList});
        } else {
            this.watchList.$update();
        }
    }

    updateSelectedPointMaps() {
        this.selectedPointConfigsByName = {};
        this.selectedPointConfigsByXid = {};
        this.chartConfig.selectedPoints.forEach(ptConfig => {
            this.selectedPointConfigsByName[ptConfig.name] = ptConfig;
            if (ptConfig.xid) {
                this.selectedPointConfigsByXid[ptConfig.xid] = ptConfig;
            }
        });
    }

    selectedPointsChanged() {
        const newSelectedPoints = this.chartConfig.selectedPoints = [];

        const newPointChartOptions = {};
        if (this.chartOptions.configNextPoint) {
            if (this.chartOptions.pointColor)
                newPointChartOptions.lineColor = this.chartOptions.pointColor;
            if (this.chartOptions.pointChartType)
                newPointChartOptions.type = this.chartOptions.pointChartType;
            if (this.chartOptions.pointAxis)
                newPointChartOptions.valueAxis = this.chartOptions.pointAxis;
        }

        this.selected.forEach(point => {
            const config = this.selectedPointConfigsByXid[point.xid] ||
            (this.pointNameCounts[point.name] === 1 && this.selectedPointConfigsByName[point.name]) ||
            newPointChartOptions;
            config.name = point.name;
            config.xid = point.xid;
            newSelectedPoints.push(config);
        });

        this.updateSelectedPointMaps();

        this.rebuildChart();
        this.updateStats();
    }

    updateStats() {
        const selectedStats = this.selectedStats = [];

        if (!this.selected) {
            return;
        }

        const points = this.selected;
        const from = this.dateBar.from;
        const to = this.dateBar.to;

        points.forEach(point => {
            const ptStats = {
                    name: point.name,
                    device: point.deviceName,
                    xid: point.xid
            };
            selectedStats.push(ptStats);

            this.maStatistics.getStatisticsForXid(point.xid, {
                from: from,
                to: to,
                rendered: true
            }).then(stats => {
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
    }

    chooseAxisColor($event, axisName) {
        if (!this.chartConfig.valueAxes) {
            this.chartConfig.valueAxes = {};
        }
        if (!this.chartConfig.valueAxes[axisName]) {
            this.chartConfig.valueAxes[axisName] = {};
        }
        this.showColorPicker($event, this.chartConfig.valueAxes[axisName], 'color', true);
    }

    showColorPicker($event, object, propertyName, rebuild) {
        if (!object) return;

        this.$mdColorPicker.show({
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
        }).then(color => {
            object[propertyName] = color;
            if (rebuild) {
                this.rebuildChart();
            }
        });
    }

    showDownloadDialog($event) {
        this.$mdDialog.show({
            controller: ['maUiDateBar', 'maPointValues', 'maUtil', 'MA_ROLLUP_TYPES', 'MA_DATE_TIME_FORMATS', 'maUser', '$mdDialog',
                function(maUiDateBar, pointValues, Util, MA_ROLLUP_TYPES, MA_DATE_TIME_FORMATS, maUser, $mdDialog) {

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
                    const points = this.allPoints ? this.points : this.selected;
                    const xids = points.map(pt => pt.xid);

                    const functionName = downloadType.indexOf('COMBINED') > 0 ? 'getPointValuesForXidsCombined' : 'getPointValuesForXids';
                    const mimeType = downloadType.indexOf('CSV') === 0 ? 'text/csv' : 'application/json';
                    const extension = downloadType.indexOf('CSV') === 0 ? 'csv' : 'json';
                    const fileName = this.watchList.name + '_' + maUiDateBar.from.toISOString() + '_' + maUiDateBar.to.toISOString() + '.' + extension;

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
                    }).then(response => {
                        this.downloadStatus.downloading = false;
                        Util.downloadBlob(response, fileName);
                    }, error => {
                        this.downloadStatus.error = error.mangoStatusText;
                        this.downloadStatus.downloading = false;
                    });
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
            fullscreen: this.$mdMedia('xs') || this.$mdMedia('sm'),
            bindToController: true,
            controllerAs: '$ctrl',
            locals: {
                watchList: this.watchList,
                selected: this.selected,
                downloadStatus: this.downloadStatus,
                points: this.points
            }
        });
    }
}

return function watchListPageDirective() {
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
};

}); // define