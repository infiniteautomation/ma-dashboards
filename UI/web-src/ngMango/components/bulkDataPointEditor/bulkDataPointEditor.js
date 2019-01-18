/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import bulkDataPointEditorTemplate from './bulkDataPointEditor.html';

import './bulkDataPointEditor.css';

const localStorageKey = 'bulkDataPointEditPage';

class BulkDataPointEditorController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return ['maPoint', 'maDataSource', 'maDataPointTags', 'maDialogHelper', 'maTranslate', '$timeout',
            'localStorageService', 'maUtil', '$q', '$scope', '$element', '$filter']; }
    
    constructor(maPoint, maDataSource, maDataPointTags, maDialogHelper, maTranslate, $timeout,
            localStorageService, maUtil, $q, $scope, $element, $filter) {

        this.maPoint = maPoint;
        this.maDataSource = maDataSource;
        this.maDataPointTags = maDataPointTags;
        this.maDialogHelper = maDialogHelper;
        this.maTranslate = maTranslate;
        this.$timeout = $timeout;
        this.localStorageService = localStorageService;
        this.maUtil = maUtil;
        this.$q = $q;
        this.$scope = $scope;
        this.$element = $element;
        
        this.sortFilter = $filter('orderBy');
        this.filterFilter = $filter('filter');

        this.numberOfRows = 15;

        this.columns = [
            {name: 'xid', label: 'ui.app.xidShort', selectedByDefault: false},
            {name: 'dataSourceName', label: 'ui.app.dataSource', selectedByDefault: false},
            {name: 'dataType', label: 'dsEdit.pointDataType', selectedByDefault: false},
            {name: 'deviceName', label: 'common.deviceName', selectedByDefault: true},
            {name: 'name', label: 'common.name', selectedByDefault: true},
            {name: 'tagsString', label: 'ui.app.tags', selectedByDefault: true, disableSort: false},
            {name: 'enabled', label: 'common.enabled', selectedByDefault: false},
            {name: 'readPermission', label: 'pointEdit.props.permission.read', selectedByDefault: false},
            {name: 'setPermission', label: 'pointEdit.props.permission.set', selectedByDefault: false},
            {name: 'unit', label: 'pointEdit.props.unit', selectedByDefault: false},
            {name: 'chartColour', label: 'pointEdit.props.chartColour', selectedByDefault: false},
            {name: 'plotType', label: 'pointEdit.plotType', selectedByDefault: false},
            {name: 'rollup', label: 'common.rollup', selectedByDefault: false},
            {name: 'templateXid', label: 'ui.app.templateXid', selectedByDefault: false, nullable: false},
            {name: 'integralUnit', label: 'pointEdit.props.integralUnit', selectedByDefault: false},
            {name: 'pointFolderId', label: 'ui.app.hierarchyFolderId', selectedByDefault: false},
            {name: 'simplifyType', label: 'pointEdit.props.simplifyType', selectedByDefault: false},
            {name: 'simplifyTolerance', label: 'pointEdit.props.simplifyTolerance', selectedByDefault: false},
            {name: 'simplifyTarget', label: 'pointEdit.props.simplifyTarget', selectedByDefault: false}
        ];

        this.columns.forEach((c, i) => c.order = i);
        
        const settings = this.localStorageService.get(localStorageKey);
        if (settings && Array.isArray(settings.selectedColumns)) {
            this.selectedColumns = this.columns.filter(c => settings.selectedColumns.includes(c.name));
        } else {
            this.selectedColumns = this.columns.filter(c => c.selectedByDefault);
        }
        
        this.availableTagsByKey = {};
        this.availableTags = [];
        this.selectedTags = [];
        this.prevSelectedTags = [];
        this.manuallySelectedTags = [];

        this.reset();

        this.filterPointsBound = (...args) => this.filterPoints(...args);
        this.sortStringChangedBound = (...args) => this.sortStringChanged(...args);
        this.sortPointsBound = (...args) => this.sortPoints(...args);
        this.slicePointsBound = (...args) => this.slicePoints(...args);
    }
    
    reset() {
        this.points = [];
        this.filteredPoints = [];
        this.sortedPoints = [];
        this.slicedPoints = [];
        this.selectedPoints = [];

        this.pageNumber = 1;
        this.sortString = 'deviceName';
        this.sortArray = ['deviceName', 'name'];
        this.filterObject = {};
        
        this.selectAll = false;
        this.selectAllIndeterminate = false;
    }

    $onInit() {
        this.maDataPointTags.keys().then(keys => {
            keys.forEach(tagKey => this.addTagToAvailable(tagKey));
        });

        this.maPoint.notificationManager.subscribe((event, point) => {
            if (event.name === 'create') {
                this.pointAdded(point);
            } else if (event.name === 'update') {
                this.pointUpdated(point);
            } else if (event.name === 'delete') {
                this.pointDeleted(point);
            }
        }, this.$scope);
    }
    
    $onChanges(changes) {
        if (changes.query || changes.dataSource || changes.refresh || changes.watchList || changes.watchListParams || changes.queryingDisabled) {
            if (!this.queryingDisabled) {
                this.getPoints();
            }
        }
    }

    getPoints() {
        this.reset();
        this.cancelGetPoints();
        
        if (!this.query && !this.dataSource && !this.watchList) {
            return;
        }
        
        let pointsPromise;
        
        if (this.watchList) {
            pointsPromise = this.wlPointsPromise = this.watchList.getPoints(this.watchListParams);
            this.queryObj = this.watchList.getQuery(this.watchListParams);
        } else {
            this.queryObj = this.query;
            if (this.dataSource) {
                this.queryObj = this.maPoint.buildQuery()
                    .eq('dataSourceXid', this.dataSource.xid)
                    .limit(100000); // TODO
            }
            pointsPromise = this.pointsPromiseQuery = this.queryObj.query();
        }

        this.pointsPromise = pointsPromise.then(points => {
            this.points = points;
            this.filterPoints();
            this.checkAvailableTags();
            return this.points;
        }).catch(error => {
            if (error.status === -1 && error.resource && error.resource.cancelled) {
                // request cancelled, ignore error
                return;
            }
            
            const message = error.mangoStatusText || (error + '');
            this.maDialogHelper.errorToast(['ui.app.errorGettingPoints', message]);
        }).finally(() => {
            delete this.wlPointsPromise;
            delete this.pointsPromiseQuery;
            delete this.pointsPromise;
        });
        
        return this.pointsPromise;
    }
    
    cancelGetPoints() {
        if (this.pointsPromiseQuery) {
            this.maPoint.cancelRequest(this.pointsPromiseQuery);
        }
        if (this.wlPointsPromise) {
            this.wlPointsPromise.cancel();
        }
    }
    
    filterPoints() {
        this.filteredPoints = this.filterFilter(this.points, this.filterObject);
        
        this.selectedPoints = this.selectedPoints.filter(pt => {
            if (!this.filteredPoints.includes(pt)) {
                delete pt.$selected;
                return false;
            }
            return true;
        });
        
        this.updateSelectAllStatus();
        
        this.sortPoints();
    }

    sortStringChanged() {
        const newSort = this.sortString;
        const property = newSort.startsWith('-') ? newSort.slice(1) : newSort;
        
        this.sortArray = this.sortArray.filter(sort => {
            const prevProperty = sort.startsWith('-') ? sort.slice(1) : sort;
            return prevProperty !== property;
        });

        this.sortArray.unshift(newSort);
        if (this.sortArray.length > 3) {
            this.sortArray.pop();
        }
        this.sortPoints();
    }
    
    sortPoints() {
        this.sortedPoints = this.sortFilter(this.filteredPoints, this.sortArray);
        this.slicePoints();
    }
    
    slicePoints() {
        const start = (this.pageNumber - 1) * this.numberOfRows;
        this.slicedPoints = this.sortedPoints.slice(start, start + this.numberOfRows);
    }

    addTagToAvailable(tagKey) {
        if (tagKey === 'device' || tagKey === 'name') {
            return;
        }
        
        const existingOption = this.availableTagsByKey[tagKey];
        if (existingOption) {
            return existingOption;
        }
        
        const option = {
            name: tagKey,
            label: this.maTranslate.trSync('ui.app.tag', tagKey)
        };
        
        this.availableTags.push(option);
        this.availableTagsByKey[tagKey] = option;

        return option;
    }
    
    selectTag(option) {
        if (option && !this.selectedTags.includes(option)) {
            this.selectedTags.push(option);
        }
    }
    
    confirmDeleteSelected(event) {
        if (!this.selectedPoints.length) {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.bulkEditNoPointsSelected'],
                hideDelay: 10000
            });
            return;
        }
        
        this.maDialogHelper.confirm(event, ['ui.app.bulkEditConfirmDelete', this.selectedPoints.length]).then(() => {
            this.deleteSelected();
        }, () => null);
    }
    
    deleteSelected() {
        // WS can modify this so make copy so we can retrieve point by index later
        const selected = this.selectedPoints.slice();
        const requests = selected.map(pt => ({xid: pt.xid}));
        
        this.bulkTask = new this.maPoint.bulk({
            action: 'DELETE',
            requests
        });

        this.bulkTaskPromise = this.bulkTask.start(this.$scope).then(resource => {
            const responses = resource.result.responses;

            responses.forEach((response, i) => {
                if (!response.error) {
                    this.pointDeleted(selected[i]);
                }
            });

            this.notifyBulkEditComplete(resource);
            //resource.delete();
        }, error => {
            this.notifyBulkEditError(error);
        }, resource => {
            // progress
        }).finally(() => {
            delete this.bulkTaskPromise;
            delete this.bulkTask;
        });
    }

    notifyBulkEditError(error) {
        this.maDialogHelper.toastOptions({
            textTr: ['ui.app.errorStartingBulkEdit', error.mangoStatusText],
            hideDelay: 10000,
            classes: 'md-warn'
        });
    }
    
    notifyBulkEditComplete(resource) {
        const numErrors = resource.result.responses.reduce((accum, response) => response.error ? accum + 1 : accum, 0);
        
        const toastOptions = {
            textTr: [null, resource.position, resource.maximum, numErrors],
            hideDelay: 10000,
            classes: 'md-warn'
        };

        switch (resource.status) {
        case 'CANCELLED':
            toastOptions.textTr[0] = 'ui.app.bulkEditCancelled';
            break;
        case 'TIMED_OUT':
            toastOptions.textTr[0] = 'ui.app.bulkEditTimedOut';
            break;
        case 'ERROR':
            toastOptions.textTr[0] = 'ui.app.bulkEditError';
            toastOptions.textTr.push(resource.error.localizedMessage);
            break;
        case 'SUCCESS':
            if (!numErrors) {
                toastOptions.textTr = ['ui.app.bulkEditSuccess', resource.position];
                delete toastOptions.classes;
            } else {
                toastOptions.textTr[0] = 'ui.app.bulkEditSuccessWithErrors';
            }
            break;
        }

        this.maDialogHelper.toastOptions(toastOptions);
    }
    
    cancel(event) {
        this.bulkTask.cancel();
    }

    checkAvailableTags() {
        const seenTagKeys = {};
        this.points.forEach(pt => {
            if (pt.tags) {
                Object.keys(pt.tags).forEach(key => {
                    seenTagKeys[key] = true;
                });
            }
        });
        
        this.selectedTags = this.manuallySelectedTags.slice();
        Object.keys(seenTagKeys).forEach(tagKey => {
            const option = this.addTagToAvailable(tagKey);
            this.selectTag(option);
        });
        this.prevSelectedTags = this.selectedTags.slice();
    }

    pointSelectedChanged(point) {
        if (point.$selected) {
            this.selectedPoints.push(point);
        } else {
            delete point.$selected;
            const i = this.selectedPoints.findIndex(p => p.id === point.id);
            if (i >= 0) {
                this.selectedPoints.splice(i, 1);
            }
        }
        this.updateSelectAllStatus();
    }

    updateSelectAllStatus() {
        if (this.selectedPoints.length === this.filteredPoints.length) {
            this.selectAllIndeterminate = false;
            // seems to be a bug changing md-checkbox indeterminate and checked at same time
            const selectAll = this.selectedPoints.length > 0;
            this.$timeout(() => {
                this.selectAll = selectAll;
            }, 0);
        } else {
            this.selectAll = false;
            this.selectAllIndeterminate = this.selectedPoints.length > 0;
        }
    }
    
    selectAllChanged() {
        if (this.selectAllIndeterminate) {
            this.selectAll = false;
            this.selectedPoints = [];
        } else {
            this.selectedPoints = this.selectAll && this.filteredPoints ? this.filteredPoints.slice() : [];
        }
        
        this.selectAllIndeterminate = false;
        
        if (this.filteredPoints) {
            if (this.selectAll) {
                this.filteredPoints.forEach(pt => pt.$selected = true);
            } else {
                this.filteredPoints.forEach(pt => delete pt.$selected);
            }
        }
    }

    selectedColumnsChanged() {
        const settings = this.localStorageService.get(localStorageKey) || {};
        settings.selectedColumns = this.selectedColumns.map(c => c.name);
        this.localStorageService.set(localStorageKey, settings);
    }
    
    selectedTagsChanged() {
        const removed = this.prevSelectedTags.filter(t => !this.selectedTags.includes(t));
        const added = this.selectedTags.filter(t => !this.prevSelectedTags.includes(t));
        
        removed.forEach(option => {
            const index = this.manuallySelectedTags.indexOf(option);
            if (index >= 0) {
                this.manuallySelectedTags.splice(index, 1);
            }
        });
        
        added.forEach(option => {
            if (!this.manuallySelectedTags.includes(option)) {
                this.manuallySelectedTags.push(option);
            }
        });
        
        this.prevSelectedTags = this.selectedTags.slice();
    }
    
    downloadCSV(event) {
        if (this.csvCancel) {
            this.csvCancel.resolve();
        }

        this.csvCancel = this.$q.defer();
        
        const httpOptions = {
            cancel: this.csvCancel.promise,
            headers: {
                Accept: 'text/csv'
            },
            responseType: 'blob',
            timeout: 0
        };
        
        let downloadPromise;
        let filename = 'Query';
        
        if (this.watchList) {
            filename = this.watchList.name;
            if (this.watchList.type === 'static') {
                downloadPromise = this.maPoint.restResource.pointsForWatchList(this.watchList.xid, httpOptions);
            } else {
                const queryObj = this.watchList.getQuery(this.watchListParams);
                if (queryObj == null) {
                    this.maDialogHelper.toastOptions({
                        textTr: ['ui.app.requiredParameter'],
                        hideDelay: 10000
                    });
                    return;
                }
                downloadPromise = this.maPoint.restResource.query(queryObj, httpOptions);
            }
        } else {
            if (this.dataSource) {
                filename = this.dataSource.name;
            }
            downloadPromise = this.maPoint.restResource.query(this.queryObj, httpOptions);
        }

        return downloadPromise.then(result => {
            delete this.csvCancel;
            this.maUtil.downloadBlob(result, `${filename} data points.csv`);
        });
    }

    uploadCSVButtonClicked(event) {
        this.$element.maFind('input[type=file]')
            .val(null)
            .maClick();
    }

    csvFileInputChanged(event) {
        if (!event.target.files.length) return;
        this.startFromCsv(event.target.files[0]);
    }
    
    fileDropped(data) {
        if (this.bulkTaskPromise || this.pointsPromise) return;
        
        const types = data.getDataTransferTypes();
        if (types.includes('Files')) {
            const files = Array.from(data.getDataTransfer()).filter(f => f.name.endsWith('.csv') || f.type === 'text/csv');
            if (files.length) {
                this.startFromCsv(files[0]);
            }
        }
    }
    
    startFromCsv(csvFile) {
        this.csvFile = csvFile;
        this.showPointDialog = {};
    }

    createDataPoint(event) {
        this.editTarget = this.maDataSource.typesByName[this.dataSource.modelType].createDataPoint();
        this.editTarget.dataSourceXid = this.dataSource.originalId;
        this.showPointDialog = {};
    }
    
    editDataPoint(event, item) {
        this.editTarget = item;
        this.showPointDialog = {};
    }
    
    copyDataPoint(event, item) {
        this.editTarget = item.copy(true);
        this.showPointDialog = {};
    }

    deleteDataPoint(event, item) {
        const notifyName = item.name || item.originalId;
        this.maDialogHelper.confirm(event, ['ui.components.dataPointConfirmDelete', notifyName]).then(() => {
            item.delete().then(() => {
                this.maDialogHelper.toast(['ui.components.dataPointDeleted', notifyName]);
                this.pointDeleted(item);
            }, error => {
                this.maDialogHelper.toast(['ui.components.dataPointDeleteError', error.mangoStatusText]);
            });
        }, angular.noop);
    }
    
    editSelectedPoints(event) {
        if (!Array.isArray(this.selectedPoints) || !this.selectedPoints.length) {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.bulkEditNoPointsSelected'],
                hideDelay: 10000
            });
            return;
        }
        
        if (this.selectedPoints.length < 2) {
            this.editTarget = this.selectedPoints[0];
        } else {
            this.editTarget = this.selectedPoints;
        }
        this.showPointDialog = {};
    }
    
    pointMatchesQuery(point) {
        // TODO check the point matches this.queryObj
        if (this.dataSource && point.dataSourceXid === this.dataSource.xid) {
            return true;
        }
    }

    pointAdded(point) {
        if (this.pointMatchesQuery(point)) {
            this.points.push(point);
            this.updateSelectAllStatus();
            
            // WS updates can happen very rapidly, debounce filtering points
            this.filterPointsAfterTimeout();
        }
    }
    
    pointUpdated(point) {
        const found = this.points.find(p => p.id === point.id);
        if (found) {
            const selected = found.$selected;
            angular.copy(point, found);
            if (selected) {
                found.$selected = true;
            }
            
            // WS updates can happen very rapidly, debounce filtering points
            this.filterPointsAfterTimeout();
        }
    }
    
    pointDeleted(point) {
        const selectedIndex = this.selectedPoints.findIndex(p => p.id === point.id);
        if (selectedIndex >= 0) {
            this.selectedPoints.splice(selectedIndex, 1);
        }
        
        const index = this.points.findIndex(p => p.id === point.id);
        if (index >= 0) {
            this.points.splice(index, 1);
            this.updateSelectAllStatus();
            this.slicePoints();
        }
    }
    
    filterPointsAfterTimeout(time = 500) {
        this.filterPointsAfterTimeoutCount++;
        this.$timeout.cancel(this.filterTimeout);
        
        if (this.filterPointsAfterTimeoutCount >= 1000) {
            this.filterPointsAfterTimeoutCount = 0;
            this.filterPoints();
        } else {
            this.filterTimeout = this.$timeout(() => {
                this.filterPointsAfterTimeoutCount = 0;
                this.filterPoints();
            }, time);
        }
    }
    
    filterButtonClicked() {
        this.showFilters = !this.showFilters;
        if (!this.showFilters) {
            this.filterObject = {};
            this.filterChanged();
        }
    }
    
    filterChanged() {
        this.clearEmptyKeys(this.filterObject);
        this.filterPoints();
    }
    
    clearEmptyKeys(obj) {
        Object.keys(obj).forEach(key => {
            const val = obj[key];
            if (typeof val === 'object') {
                this.clearEmptyKeys(val);
                if (Object.keys(val).length === 0) {
                    delete obj[key];
                }
            } else if (!val) {
                delete obj[key];
            }
        });
    }
}

export default {
    template: bulkDataPointEditorTemplate,
    controller: BulkDataPointEditorController,
    bindings: {
        query: '<?',
        dataSource: '<?source',
        watchList: '<?',
        watchListParams: '<?',
        refresh: '<?',
        queryingDisabled: '<?'
    }
};