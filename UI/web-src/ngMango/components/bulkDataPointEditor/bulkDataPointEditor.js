/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import bulkDataPointEditorTemplate from './bulkDataPointEditor.html';

import './bulkDataPointEditor.css';

const localStorageKey = 'bulkDataPointEditPage';

const defaultColumns = [
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
    {name: 'lifecycleStateTranslation', label: 'pointEdit.props.lifecycleState', selectedByDefault: false},
    {name: 'plotType', label: 'pointEdit.plotType', selectedByDefault: false},
    {name: 'rollup', label: 'common.rollup', selectedByDefault: false},
    {name: 'integralUnit', label: 'pointEdit.props.integralUnit', selectedByDefault: false},
    {name: 'simplifyType', label: 'pointEdit.props.simplifyType', selectedByDefault: false},
    {name: 'simplifyTolerance', label: 'pointEdit.props.simplifyTolerance', selectedByDefault: false},
    {name: 'simplifyTarget', label: 'pointEdit.props.simplifyTarget', selectedByDefault: false},
    {name: 'value', label: 'ui.app.pointValue', selectedByDefault: true}
];

class BulkDataPointEditorController {
    static get $$ngIsClass() { return true; }

    static get $inject() { return ['maPoint', 'maDataSource', 'maDataPointTags', 'maDialogHelper', 'maTranslate', '$timeout',
            'localStorageService', 'maUtil', '$q', '$scope', '$element', '$filter', '$interval', 'maEventDetector', 'MA_LIFECYCLE_STATES']; }

    constructor(maPoint, maDataSource, maDataPointTags, maDialogHelper, maTranslate, $timeout,
            localStorageService, maUtil, $q, $scope, $element, $filter, $interval, EventDetector, MA_LIFECYCLE_STATES) {

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
        this.$interval = $interval;
        this.EventDetector = EventDetector;
        this.MA_LIFECYCLE_STATES = MA_LIFECYCLE_STATES;

        this.sortFilter = $filter('orderBy');
        this.filterFilter = $filter('filter');

        this.numberOfRows = 15;
        this.availableTagsByKey = {};
        this.availableTags = [];
        this.selectedTags = [];
        this.prevSelectedTags = [];
        this.manuallySelectedTags = [];

        this.loadSettings();
        this.reset();

        this.sortStringChangedBound = (...args) => this.sortStringChanged(...args);
        this.slicePointsBound = (...args) => this.slicePoints(...args);
    }

    $onInit() {
        this.maDataPointTags.keys().then(keys => {
            keys.forEach(tagKey => this.addTagToAvailable(tagKey));
        });

        this.updateQueue = [];
        this.deregister = this.maPoint.notificationManager.subscribe((event, point, attributes) => {
            this.updateQueue.push({
                eventName: event.name,
                point,
                pointId: attributes.itemId
            });
        });

        this.ticks = 0;
        this.prevUpdateQueueSize = 0;
        this.intervalPromise = this.$interval(() => {
            if (!this.updateQueue.length) return;

            this.ticks++;
            if (this.ticks >= 20 || this.updateQueue.length === this.prevUpdateQueueSize) {
                this.ticks = 0;

                let changeMade = false;
                let update;
                while ((update = this.updateQueue.shift()) != null) {
                    if (update.eventName === 'create') {
                        changeMade |= this.pointAdded(update.point);
                    } else if (update.eventName === 'update' || update.eventName === 'stateChange') {
                        changeMade |= this.pointUpdated(update.point);
                    } else if (update.eventName === 'delete') {
                        changeMade |= this.pointDeleted(update.pointId);
                    }
                }

                if (changeMade) {
                    this.$scope.$apply(() => {
                        this.checkAvailableTags();
                        this.filterPoints();
                    });
                }
            }

            this.prevUpdateQueueSize = this.updateQueue.length;
        }, 500, null, false);
    }

    $onDestroy() {
        this.deregister();
        this.$interval.cancel(this.intervalPromise);
    }

    $onChanges(changes) {
        if (changes.query || changes.dataSource || changes.refresh || changes.watchList || changes.watchListParams || changes.queryingDisabled) {
            if (!this.queryingDisabled) {
                this.getPoints();
            }
        }
        if (changes.editDataPoints) {
            this.editPointsFromAttr();
        }
    }

    loadSettings() {
        this.settings = this.localStorageService.get(localStorageKey) || {};
        if (this.settings.hasOwnProperty('showFilters')) {
            this.showFilters = !!this.settings.showFilters;
        }
    }

    saveSettings() {
        this.localStorageService.set(localStorageKey, this.settings);
    }

    reset() {
        this.points = new Map();
        this.filteredPoints = [];
        this.sortedPoints = [];
        this.slicedPoints = [];
        this.selectedPoints = new Map();
        this.checkboxEvents = new Map();
        this.prevPoint = null;

        if (typeof this.selectedPointsAttr === 'function') {
            this.selectedPointsAttr({$selected: this.selectedPoints});
        }

        this.pageNumber = 1;
        this.sortString = 'deviceName';
        this.sortArray = ['deviceName', 'name'];

        this.selectAll = false;
        this.selectAllIndeterminate = false;

        this.resetColumns();
        this.clearFilters();
    }

    resetColumns() {
        this.columns = defaultColumns.slice();

        if (this.dataSource) {
            const dsType = this.maDataSource.typesByName[this.dataSource.modelType];
            const dataSourceColumns = dsType && dsType.bulkEditorColumns;
            if (Array.isArray(dataSourceColumns)) {
                this.columns.push(...dataSourceColumns);
            }
        }

        this.columns.forEach((column, i) => {
            column.order = i;
            column.property = column.name.split('.');
        });

        const selected = Array.isArray(this.settings.selectedColumns) ? this.settings.selectedColumns : [];
        const deselected = Array.isArray(this.settings.deselectedColumns) ? this.settings.deselectedColumns : [];
        this.selectedColumns = this.columns.filter(c => selected.includes(c.name) || c.selectedByDefault && !deselected.includes(c.name));

        this.showPointValueColumn = !!this.selectedColumns.find(c => c.name === 'value');
    }

    clearFilters() {
        this.filterObject = {};
        this.columns.forEach(column => delete column.filter);
    }

    getPoints() {
        this.reset();
        this.cancelGetPoints();

        if (!this.query && !this.dataSource && !this.watchList) {
            return;
        }

        let p;
        if (this.watchList) {
            p = this.wlPointsPromise = this.watchList.getPoints(this.watchListParams);
            if (this.watchList.type === 'static') {
                delete this.queryObj;
            } else {
                this.queryObj = this.watchList.getQuery(this.watchListParams);
            }
        } else {
            this.queryObj = this.query;
            if (this.dataSource) {
                this.queryObj = this.maPoint.buildQuery()
                    .eq('dataSourceXid', this.dataSource.xid); // TODO this is a unbounded query
            }
            p = this.pointsPromiseQuery = this.queryObj.query();
        }

        const pointsPromise = this.pointsPromise = p.then(points => {
            this.points = points.reduce((map, p) => (map.set(p.id, p), map), new Map());
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
            //delete this.wlPointsPromise;
            //delete this.pointsPromiseQuery;

            // check we are deleting our own promise, not one for a new query
            if (this.pointsPromise === pointsPromise) {
                delete this.pointsPromise;
            }
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
        this.filteredPoints = this.filterFilter(Array.from(this.points.values()), this.filterObject);
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
        this.checkboxEvents.clear();
        this.prevPoint = null;
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
            label: this.maTranslate.trSync('ui.app.tag', [tagKey])
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
        if (!this.selectedPoints.size) {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.bulkEditNoPointsSelected'],
                hideDelay: 10000
            });
            return;
        }

        this.maDialogHelper.confirm(event, ['ui.app.bulkEditConfirmDelete', this.selectedPoints.size]).then(() => {
            this.deleteSelected();
        }, () => null);
    }

    deleteSelected() {
        // WS can modify this so make copy so we can retrieve point by index later
        const selected = Array.from(this.selectedPoints.values());
        const requests = selected.map(pt => ({xid: pt.xid}));

        this.bulkTask = new this.maPoint.bulk({
            action: 'DELETE',
            requests
        });

        this.bulkTaskPromise = this.bulkTask.start(this.$scope).then(resource => {
//            const responses = resource.result.responses;
//
//            responses.forEach((response, i) => {
//                if (!response.error) {
//                    this.pointDeleted(selected[i]);
//                }
//            });

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

        for (let pt of this.points.values()) {
            if (pt.tags) {
                for (let key of Object.keys(pt.tags)) {
                    seenTagKeys[key] = true;
                }
            }
        }

        this.selectedTags = this.manuallySelectedTags.slice();
        Object.keys(seenTagKeys).forEach(tagKey => {
            const option = this.addTagToAvailable(tagKey);
            this.selectTag(option);
        });
        this.prevSelectedTags = this.selectedTags.slice();
    }

    updateSelectAllStatus() {
        const selectedFiltered = this.filteredPoints.filter(pt => this.selectedPoints.has(pt.id));

        if (selectedFiltered.length === this.filteredPoints.length) {
            this.selectAllIndeterminate = false;
            // seems to be a bug changing md-checkbox indeterminate and checked at same time
            const selectAll = selectedFiltered.length > 0;
            this.$timeout(() => {
                this.$scope.$apply(() => {
                    this.selectAll = selectAll;
                });
            }, 0, false);
        } else {
            this.selectAll = false;
            this.selectAllIndeterminate = selectedFiltered.length > 0;
        }
    }

    selectAllChanged() {
        if (this.selectAllIndeterminate) {
            this.selectAll = false;
        }
        this.selectAllIndeterminate = false;

        if (this.selectAll) {
            this.filteredPoints.forEach(pt => {
                this.selectedPoints.set(pt.id, pt);
            });
        } else {
            this.filteredPoints.forEach(pt => {
                this.selectedPoints.delete(pt.id);
            });
        }
    }

    selectedColumnsChanged() {
        this.showPointValueColumn = !!this.selectedColumns.find(c => c.name === 'value');

        this.settings.deselectedColumns = this.columns
            .filter(c => c.selectedByDefault && !this.selectedColumns.includes(c))
            .map(c => c.name);

        this.settings.selectedColumns = this.selectedColumns
            .filter(c => !c.selectedByDefault)
            .map(c => c.name);

        this.saveSettings();
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
        const dsType = this.maDataSource.typesByName[this.dataSource.modelType];

        if (!dsType || typeof dsType.createDataPoint !== 'function') {
            this.maDialogHelper.toast(['ui.components.createPointNotSupported', this.dataSource.modelType]);
            return;
        }

        this.editTarget = dsType.createDataPoint();
        this.editTarget.dataSourceXid = this.dataSource.originalId;
        this.editTarget.deviceName = this.dataSource.name;
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
//                this.pointDeleted(item);
            }, error => {
                this.maDialogHelper.toast(['ui.components.dataPointDeleteError', error.mangoStatusText]);
            });
        }, angular.noop);
    }

    editSelectedPoints(event) {
        if (!this.selectedPoints.size) {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.bulkEditNoPointsSelected'],
                hideDelay: 10000
            });
            return;
        }

        const selectedPointsArray = Array.from(this.selectedPoints.values());

        if (selectedPointsArray.length === 1) {
            this.editTarget = selectedPointsArray[0];
        } else {
            this.editTarget = selectedPointsArray;
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
            this.points.set(point.id, point);
            return true;
        }
    }

    pointUpdated(point) {
        const found = this.points.get(point.id);
        if (found) {
            angular.copy(point, found);
            return true;
        }
    }

    pointDeleted(pointId) {
        const inPoints = this.points.delete(pointId);
        const inSelected = this.selectedPoints.delete(pointId);

        if (inPoints || inSelected) {
            return true;
        }
    }

    filterButtonClicked() {
        this.showFilters = !this.showFilters;

        this.settings.showFilters = this.showFilters;
        this.saveSettings();

        if (!this.showFilters) {
            this.clearFilters();
            this.filterChanged();
        }
    }

    filterChanged() {
        this.columns.forEach(column => {
            this.deepSetValue(this.filterObject, column.property, column.filter);
        });

        this.clearEmptyKeys(this.filterObject);
        this.filterPoints();
    }

    deepSetValue(obj, property, value) {
        const lastIndex = property.length - 1;

        for (let i = 0; i < property.length; i++) {
            const propertyName = property[i];

            if (i === lastIndex) {
                obj[propertyName] = value;
            } else if (obj[propertyName] == null) {
                obj = obj[propertyName] = {};
            } else {
                obj = obj[propertyName];
            }
        }
    }

    clearEmptyKeys(obj) {
        Object.keys(obj).forEach(key => {
            const val = obj[key];
            if (val == null) {
                delete obj[key];
            } else if (typeof val === 'object') {
                this.clearEmptyKeys(val);
                if (Object.keys(val).length === 0) {
                    delete obj[key];
                }
            }
        });
    }

    /**
     * Getter / setter for the checkbox model
     */
    pointSelected(point) {
        return (val) => {
            if (val === undefined) {
                return this.selectedPoints.has(point.id);
            }

            const event = this.checkboxEvents.get(point);
            const pointIndex = this.slicedPoints.indexOf(point);
            const prevPointIndex = this.slicedPoints.indexOf(this.prevPoint);

            if (event && event.shiftKey && pointIndex >= 0 && prevPointIndex >= 0 && pointIndex !== prevPointIndex) {
                const minIndex = Math.min(pointIndex, prevPointIndex);
                const maxIndex = Math.max(pointIndex, prevPointIndex);
                this.slicedPoints.slice(minIndex, maxIndex + 1).forEach(pt => {
                    if (val) {
                        this.selectedPoints.set(pt.id, pt);
                    } else {
                        this.selectedPoints.delete(pt.id);
                    }
                });
            } else {
                this.prevPoint = point;
                if (val) {
                    this.selectedPoints.set(point.id, point);
                } else {
                    this.selectedPoints.delete(point.id);
                }
            }

            this.updateSelectAllStatus();
        };
    }

    checkBoxClicked(point, event) {
        this.checkboxEvents.set(point, event);
    }

    getCellValue(point, property) {
        let result = point;
        for (let i = 0; i < property.length; i++) {
            if (typeof result !== 'object') {
                return;
            }
            result = result[property[i]];
        }
        return result;
    }

    gotDetectors(detectors) {
        this.eventDetector = detectors[0] || this.EventDetector.forDataPoint(this.eventDetectorPoint);
    }

    detectorDialogClosed() {
        this.eventDetectorPoint = null;
        this.eventDetector = null;
    }

    confirmPurge(event) {
        if (!this.selectedPoints.size) {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.bulkEditNoPointsSelected'],
                hideDelay: 10000
            });
            return;
        }

        this.showPurgeDialog();
    }

    cancelPurge() {
        this.cancelPurgeObj = {};
        delete this.showPurgeDialogObj;
        delete this.purgePoints;
    }

    showPurgeDialog() {
        this.purgePoints = Array.from(this.selectedPoints.values());
        this.showPurgeDialogObj = {};
    }

    editPointsFromAttr() {
        const pointsToEdit = this.editDataPoints;

        if (!Array.isArray(pointsToEdit) || this.editTarget || this.csvFile) {
            return;
        }

        if (this.dataSource) {
            if (pointsToEdit.some(dp => dp.dataSourceXid !== this.dataSource.xid)) {
                return;
            }
        }

        if (pointsToEdit.length === 1) {
            this.editTarget = pointsToEdit[0];
        } else {
            this.editTarget = pointsToEdit;
        }
        this.showPointDialog = {};
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
        queryingDisabled: '<?',
        selectedPointsAttr: '&?selectedPoints',
        editDataPoints: '<?'
    }
};