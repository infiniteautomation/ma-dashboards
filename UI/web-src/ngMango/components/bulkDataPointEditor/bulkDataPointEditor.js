/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import bulkDataPointEditorTemplate from './bulkDataPointEditor.html';

import './bulkDataPointEditor.css';

const selectedProperty = '$selected';
const errorProperty = typeof Symbol === 'function' ? Symbol('error') : '___error___';
const actionProperty = typeof Symbol === 'function' ? Symbol('action') : '___action___';
const localStorageKey = 'bulkDataPointEditPage';

class BulkDataPointEditorController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return [
        'maPoint',
        'maDataSource',
        'maDataPointTags',
        'maDialogHelper',
        'maTranslate',
        '$timeout',
        'MA_ROLLUP_TYPES',
        'MA_CHART_TYPES',
        'localStorageService',
        'maUtil',
        '$q',
        '$scope',
        '$element']; }
    constructor(
            maPoint,
            maDataSource,
            maDataPointTags,
            maDialogHelper,
            maTranslate,
            $timeout,
            MA_ROLLUP_TYPES,
            MA_CHART_TYPES,
            localStorageService,
            maUtil,
            $q,
            $scope,
            $element) {

        this.maPoint = maPoint;
        this.maDataSource = maDataSource;
        this.maDataPointTags = maDataPointTags;
        this.maDialogHelper = maDialogHelper;
        this.maTranslate = maTranslate;
        this.$timeout = $timeout;
        this.MA_ROLLUP_TYPES = MA_ROLLUP_TYPES;
        this.MA_CHART_TYPES = MA_CHART_TYPES;
        this.localStorageService = localStorageService;
        this.maUtil = maUtil;
        this.$q = $q;
        this.$scope = $scope;
        this.$element = $element;

        this.numberOfRows = 15;
        this.pageNumber = 1;
        this.tableOrder = 'name';

        this.columns = [
            {name: 'rowNumber', label: 'ui.app.rowNumber', selectedByDefault: false},
            {name: 'xid', label: 'ui.app.xidShort', selectedByDefault: false},
            {name: 'dataSourceName', label: 'ui.app.dataSource', selectedByDefault: false},
            {name: 'dataType', label: 'dsEdit.pointDataType', selectedByDefault: false},
            {name: 'deviceName', label: 'common.deviceName', selectedByDefault: true},
            {name: 'name', label: 'common.name', selectedByDefault: true},
            {name: 'enabled', label: 'common.enabled', selectedByDefault: true},
            {name: 'readPermission', label: 'pointEdit.props.permission.read', selectedByDefault: true},
            {name: 'setPermission', label: 'pointEdit.props.permission.set', selectedByDefault: true},
            {name: 'unit', label: 'pointEdit.props.unit', selectedByDefault: true},
            {name: 'chartColour', label: 'pointEdit.props.chartColour', selectedByDefault: false},
            {name: 'plotType', label: 'pointEdit.plotType', selectedByDefault: false},
            {name: 'rollup', label: 'common.rollup', selectedByDefault: true},
            {name: 'templateXid', label: 'ui.app.templateXid', selectedByDefault: false, nullable: true},
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
    }
    
    reset() {
        this.selectedPoints = [];
        this.selectAll = false;
        this.selectAllIndeterminate = false;
        this.updateBody = {
            tags: {},
            mergeTags: true
        };
    }
    
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.maDataPointTags.keys().then(keys => {
            keys.forEach(tagKey => this.addTagToAvailable(tagKey));
        });
    }
    
    $onChanges(changes) {
        if (changes.pointsPromiseInput && this.pointsPromiseInput instanceof this.$q) {
            this.pointsPromise = this.pointsPromiseInput.finally(() => delete this.pointsPromise);
        }
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

    addTagColumn(event) {
        this.maDialogHelper.prompt(event, 'ui.app.tagName').then(tagKey => {
            const option = this.addTagToAvailable(tagKey);
            if (option) {
                this.selectTag(option);
                this.manuallySelectedTags.push(option);
                this.prevSelectedTags = this.selectedTags.slice();
            }
        }, angular.noop);
    }
    
    selectTag(option) {
        if (option && !this.selectedTags.includes(option)) {
            this.selectedTags.push(option);
        }
    }
    
    hasEdits() {
        return Object.keys(this.updateBody).length > 2 || Object.keys(this.updateBody.tags).length > 0;
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
        const requests = this.selectedPoints.map(pt => ({xid: pt.xid}));
        
        this.bulkTask = new this.maPoint.bulk({
            action: 'DELETE',
            requests
        });
        
        this.selectedPoints.forEach(pt => {
            delete pt[errorProperty];
        });

        this.bulkTaskPromise = this.bulkTask.start(this.$scope).then(resource => {
            const responses = resource.result.responses;
            const deletedPoints = [];
            
            responses.forEach((response, i) => {
                const point = this.selectedPoints[i];
                if (response.error) {
                    point[errorProperty] = response.error;
                    point[actionProperty] = response.action;
                    this.makePropertyErrorsMap(response.error);
                } else {
                    deletedPoints.push(point);
                }
            });
            
            deletedPoints.forEach(point => {
                const pointsIndex = this.points.indexOf(point);
                if (pointsIndex >= 0) {
                    this.points.splice(pointsIndex, 1);
                }
                
                const selectedPointsIndex = this.selectedPoints.indexOf(point);
                if (selectedPointsIndex >= 0) {
                    this.selectedPoints.splice(selectedPointsIndex, 1);
                }
            });

            this.selectedPointsChanged();

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

        if (typeof this.taskStarted === 'function') {
            this.taskStarted({$promise: this.bulkTaskPromise});
        }
    }
    
    confirmStart(event) {
        if (!this.selectedPoints.length) {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.bulkEditNoPointsSelected'],
                hideDelay: 10000
            });
            return;
        }
        
        if (!this.hasEdits()) {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.bulkEditNoChanges'],
                hideDelay: 10000
            });
            return;
        }

        this.maDialogHelper.confirm(event, ['ui.app.bulkEditConfirmEdit', this.selectedPoints.length]).then(() => {
            this.start();
        }, () => null);
    }

    start() {
        const body = angular.copy(this.updateBody);
        if (!Object.keys(body.tags).length) {
            delete body.tags;
            delete body.mergeTags;
        }

        let tagsOnly = false;
        const requests = this.selectedPoints.map(pt => ({xid: pt.xid}));
        if (body.tags && Object.keys(body).length === 2) {
            tagsOnly = true;
            
            this.bulkTask = new this.maDataPointTags.bulk({
                action: 'MERGE',
                body: body.tags,
                requests
            });
        } else {
            this.bulkTask = new this.maPoint.bulk({
                action: 'UPDATE',
                body,
                requests
            });
        }
        
        this.selectedPoints.forEach(pt => {
            delete pt[errorProperty];
        });

        this.bulkTaskPromise = this.bulkTask.start(this.$scope).then(resource => {
            const responses = resource.result.responses;
            responses.forEach((response, i) => {
                const point = this.selectedPoints[i];
                if (response.body) {
                    if (tagsOnly) {
                        point.tags = response.body;
                    } else {
                        angular.copy(response.body, point);
                    }
                } else if (response.error) {
                    point[errorProperty] = response.error;
                    point[actionProperty] = response.action;
                    this.makePropertyErrorsMap(response.error);
                }
            });
            
            // deselect the points without errors
            for (let i = 0, j = 0; i < this.selectedPoints.length && j < responses.length; j++) {
                const point = this.selectedPoints[i];
                if (!point[errorProperty]) {
                    delete point[selectedProperty];
                    this.selectedPoints.splice(i, 1);
                } else {
                    i++;
                }
            }
            this.selectedPointsChanged();

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

        if (typeof this.taskStarted === 'function') {
            this.taskStarted({$promise: this.bulkTaskPromise});
        }
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
    
    render() {
        const viewValue = this.ngModelCtrl.$viewValue;

        this.reset();
        
        if (Array.isArray(viewValue)) {
            this.points = viewValue.slice();
            this.checkAvailableTags();
        }
        
        // this.ngModelCtrl.$setViewValue(newPoints);
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
    
    getPointError(point) {
        return point && point[errorProperty];
    }
    
    getPointAction(point) {
        return point && point[actionProperty];
    }

    pointSelectedChanged(point) {
        if (point[selectedProperty]) {
            this.selectedPoints.push(point);
        } else {
            delete point[selectedProperty];
            const i = this.selectedPoints.findIndex(p => p.xid === point.xid);
            if (i >= 0) {
                this.selectedPoints.splice(i, 1);
            }
        }
        this.selectedPointsChanged();
    }

    selectedPointsChanged() {
        if (this.selectedPoints.length === this.points.length) {
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
            this.selectedPoints = this.selectAll && this.points ? this.points.slice() : [];
        }
        
        this.selectAllIndeterminate = false;
        
        if (this.points) {
            if (this.selectAll) {
                this.points.forEach(pt => pt[selectedProperty] = true);
            } else {
                this.points.forEach(pt => delete pt[selectedProperty]);
            }
        }
    }

    sortColumn(column) {
        if (column.name === this.tableOrder) {
            this.tableOrder = '-' + column.name;
        } else {
            this.tableOrder = column.name;
        }
    }
    
    resetColumn(column) {
        delete this.updateBody[column.name];
    }
    
    resetTag(tag) {
        delete this.updateBody.tags[tag.name];
    }
    
    removeTag(tag) {
        this.updateBody.tags[tag.name] = null;
    }
    
    nullColumn(column) {
        this.updateBody[column.name] = null;
    }
    
    columnModified(column, point) {
        return point[selectedProperty] && this.updateBody.hasOwnProperty(column.name);
    }
    
    tagModified(tag, point) {
        return point[selectedProperty] && this.updateBody.tags.hasOwnProperty(tag.name);
    }
    
    valueForColumn(column, point) {
        if (this.columnModified(column, point)) {
            return this.updateBody[column.name];
        } else {
            return point[column.name];
        }
    }
    
    valueForTag(tag, point) {
        if (this.tagModified(tag, point)) {
            return this.updateBody.tags[tag.name];
        } else {
            return point.tags && point.tags[tag.name];
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

        return downloadPromise.then(result => {
            delete this.csvCancel;
            this.maUtil.downloadBlob(result, `${this.watchList.name} points.csv`);
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
        this.bulkTaskPromise = this.$q.resolve().then(() => {
            this.bulkTask = new this.maPoint.bulk();
            this.bulkTask.setHttpBody(csvFile);
            
            return this.bulkTask.start(this.$scope, {
                headers: {
                    'Content-Type': 'text/csv'
                }
            });
        }).then(resource => {
            const responses = resource.result.responses;
            responses.forEach((response, i) => {
                const point = new this.maPoint();
                
                if (response.body) {
                    angular.copy(response.body, point);
                } else if (response.error) {
                    point[errorProperty] = response.error;
                    point[actionProperty] = response.action;
                    this.makePropertyErrorsMap(response.error);
                    point.xid = response.xid;
                }
                point.rowNumber = i + 2;
                
                this.points.push(point);
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
        
        if (typeof this.taskStarted === 'function') {
            this.taskStarted({$promise: this.bulkTaskPromise});
        }
    }
    
    makePropertyErrorsMap(error) {
        if (error.result && Array.isArray(error.result.messages)) {
            error.propertyErrors = {};
            error.result.messages.forEach(msg => {
                if (msg.property) {
                    error.propertyErrors[msg.property] = msg.message;
                }
            });
        }
    }

    createDataPoint(event) {
        this.editTarget = this.maDataSource.typesByName[this.dataSource.modelType].createDataPoint();
        this.editTarget.dataSourceXid = this.dataSource.originalId;
    }
    
    editDataPoint(event, item) {
        this.editTarget = item;
    }
    
    copyDataPoint(event, item) {
        this.editTarget = item.copy(true);
    }

    deleteDataPoint(event, item) {
        const notifyName = item.name || item.originalId;
        this.maDialogHelper.confirm(event, ['ui.components.dataPointConfirmDelete', notifyName]).then(() => {
            item.delete().then(() => {
                this.maDialogHelper.toast(['ui.components.dataPointDeleted', notifyName]);
                
                // rely on WebSocket to update the list of points
                //this.queryPoints();
            }, error => {
                this.maDialogHelper.toast(['ui.components.dataPointDeleteError', error.mangoStatusText]);
            });
        }, angular.noop);
    }
    
    editSelectedPoints(event) {
        if (Array.isArray(this.selectedPoints) && this.selectedPoints.length) {
            if (this.selectedPoints.length < 2) {
                this.editTarget = this.selectedPoints[0];
            } else {
                this.editTarget = this.selectedPoints;
            }
        }
    }
}

export default {
    template: bulkDataPointEditorTemplate,
    controller: BulkDataPointEditorController,
    bindings: {
        taskStarted: '&?',
        dataSource: '<?source',
        pointsPromiseInput: '<?pointsPromise'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    transclude: {
        extraControls: '?maExtraControls'
    }
};