/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import dataPointSelectorTemplate from './dataPointSelector.html';

import './dataPointSelector.css';

const defaultColumns = [
    {name: 'xid', label: 'ui.app.xidShort', selectedByDefault: false, useLike: true},
    {name: 'dataSourceName', label: 'ui.app.dataSource', selectedByDefault: false, useLike: true},
    {name: 'dataType', label: 'dsEdit.pointDataType', selectedByDefault: false},
    {name: 'deviceName', label: 'common.deviceName', selectedByDefault: true, useLike: true},
    {name: 'name', label: 'common.name', selectedByDefault: true, useLike: true},
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
    {name: 'simplifyTarget', label: 'pointEdit.props.simplifyTarget', selectedByDefault: false},
    {name: 'value', label: 'ui.app.pointValue', selectedByDefault: false}
];

class DataPointSelectorController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return ['maPoint', 'maDataPointTags', 'maDialogHelper', 'maTranslate', '$timeout',
            'localStorageService', 'maUtil', '$q', '$scope', '$interval']; }
    
    constructor(maPoint, maDataPointTags, maDialogHelper, maTranslate, $timeout,
            localStorageService, maUtil, $q, $scope, $interval) {

        this.maPoint = maPoint;
        this.maDataPointTags = maDataPointTags;
        this.maDialogHelper = maDialogHelper;
        this.maTranslate = maTranslate;
        this.$timeout = $timeout;
        this.localStorageService = localStorageService;
        this.maUtil = maUtil;
        this.$q = $q;
        this.$scope = $scope;
        this.$interval = $interval;

        this.sortStringChangedBound = (...args) => this.sortStringChanged(...args);

        this.pageSize = 25;
        this.availableTagsByKey = {};
        this.availableTags = [];
        this.selectedTags = [];
        this.prevSelectedTags = [];
        this.manuallySelectedTags = [];

        this.selectedPoints = new Map();
        this.checkboxEvents = new Map();
        this.models = new WeakMap();

        this.sortString = 'deviceName';
        this.sortArray = ['deviceName', 'name'];

        this.loadSettings();
        this.resetColumns();
    }
    
    getItemAtIndex(index) {
        console.log(`getItemAtIndex(${index})`);
        
        const point = this.points[index];
        if (point) {
            if (typeof point.then !== 'function') {
                return point;
            }
        } else if (this.points.$total == null || index < this.points.$total) {
            this.getPoints('page', index);
        }
        
        return null;
    }
    
    getLength() {
        console.log('getLength()');
        return this.points.$total;
    }

    $onInit() {
        this.maDataPointTags.keys().then(keys => {
            keys.forEach(tagKey => this.addTagToAvailable(tagKey));
        });

        this.updateQueue = [];
        this.deregister = this.maPoint.notificationManager.subscribe((event, point) => {
            this.updateQueue.push({
                eventName: event.name,
                point
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
                    } else if (update.eventName === 'update') {
                        changeMade |= this.pointUpdated(update.point);
                    } else if (update.eventName === 'delete') {
                        changeMade |= this.pointDeleted(update.point);
                    }
                }
                
                if (changeMade) {
                    this.$scope.$apply(() => {
                        // TODO need anything here?
                        //this.checkAvailableTags();
                        //this.filterPoints();
                    });
                }
            }
            
            this.prevUpdateQueueSize = this.updateQueue.length;
        }, 500, null, false);

        this.getPoints('query');
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onDestroy() {
        this.deregister();
        this.$interval.cancel(this.intervalPromise);
    }
    
    $onChanges(changes) {
    }
    
    render() {
        const points = Array.isArray(this.ngModelCtrl.$viewValue) ? this.ngModelCtrl.$viewValue : [];

        this.selectedPoints.clear();
        points.forEach(point => {
            this.selectedPoints.set(point.xid, point);
        });
    }
    
    loadSettings() {
        if (this.localStorageKey) {
            this.settings = this.localStorageService.get(this.localStorageKey) || {};
            if (this.settings.hasOwnProperty('showFilters')) {
                this.showFilters = !!this.settings.showFilters;
            }
        } else {
            this.settings = {};
        }
    }
    
    saveSettings() {
        if (this.localStorageKey) {
            this.localStorageService.set(this.localStorageKey, this.settings);
        }
    }

    resetColumns() {
        this.columns = defaultColumns.map((column, i) => {
            return Object.assign({}, column, {
                order: i,
                property: column.name.split('.')
            });
        });

        const selected = Array.isArray(this.settings.selectedColumns) ? this.settings.selectedColumns : [];
        const deselected = Array.isArray(this.settings.deselectedColumns) ? this.settings.deselectedColumns : [];
        this.selectedColumns = this.columns.filter(c => selected.includes(c.name) || c.selectedByDefault && !deselected.includes(c.name));
        
        this.showPointValueColumn = !!this.selectedColumns.find(c => c.name === 'value');
    }

    clearFilters() {
        this.columns.forEach(column => delete column.filter);
    }

    getPoints(reason, startIndex = 0) {
        if (reason === 'query' || reason === 'sort') {
            this.points = [];
            if (reason === 'query') {
                this.points.$total = null;
            }
        }

        //this.cancelGetPoints();
        // TODO dont want to clear these on a page?
        this.checkboxEvents.clear();
        this.prevPoint = null;

        this.queryObj = this.maPoint.buildQuery();
        
        this.selectedColumns.forEach(col => {
            if (col.filter) {
                if (col.useLike) {
                    this.queryObj.like(col.name, `*${col.filter}*`);
                } else {
                    this.queryObj.eq(col.name, col.filter);
                }
            }
        });
        
        this.selectedTags.forEach(tag => {
            if (tag.filter) {
                this.queryObj.like(`tags.${tag.name}`, `*${tag.filter}*`);
            }
        });

        // query might change, don't want to update the new points array with the results from the old query
        const points = this.points;
        const pageSize = this.pageSize;

        this.queryObj.sort(...this.sortArray)
            .limit(pageSize, startIndex);

        const pointsPromise = this.pointsPromise = this.queryObj.query();
        
        for (let i = 0; i < pageSize; i++) {
            this.points[startIndex + i] = pointsPromise;
        }
        
        pointsPromise.then(result => {
            points.$total = result.$total;
            
            for (let i = 0; i < pageSize; i++) {
                if (this.points[startIndex + i] === pointsPromise) {
                    const point = result[i];
                    if (point) {
                        this.points[startIndex + i] = point;
                    } else {
                        delete this.points[startIndex + i];
                    }
                }
            }
            
            result.forEach((point, i) => {
                points[startIndex + i] = point;
            });
        }).catch(error => {
            for (let i = 0; i < pageSize; i++) {
                if (this.points[startIndex + i] === pointsPromise) {
                    delete this.points[startIndex + i];
                }
            }
            
            if (error.status === -1 && error.resource && error.resource.cancelled) {
                // request cancelled, ignore error
                return;
            }
            
            const message = error.mangoStatusText || (error + '');
            this.maDialogHelper.errorToast(['ui.app.errorGettingPoints', message]);
        }).finally(() => {
            // check we are deleting our own promise, not one for a new query
            if (this.pointsPromise === pointsPromise) {
                delete this.pointsPromise;
            }
        });
    }
    
    cancelGetPoints() {
        if (this.pointsPromise) {
            this.maPoint.cancelRequest(this.pointsPromise);
        }
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

        this.getPoints('sort');
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

    pointMatchesQuery(point) {
        // TODO check the point matches this.queryObj
        return false;
    }

    pointAdded(point) {
        // TODO not possible to add points?
        if (this.pointMatchesQuery(point)) {
            //this.points.set(point.xid, point);
            return true;
        }
    }
    
    pointUpdated(point) {
        const found = this.points.find(p => p.xid === point.xid);
        if (found) {
            angular.copy(point, found);
            return true;
        }
    }
    
    pointDeleted(point) {
        // TODO this might cause issues...
        const inPoints = this.points.findIndex(p => p.xid === point.xid);
        const inSelected = this.selectedPoints.delete(point.xid);

        if (inPoints >= 0) {
            this.points.splice(inPoints, 1);
            return true;
        }
        
        if (inSelected) {
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
        this.getPoints('query');
    }
    
    /**
     * Creates a getter / setter model for the selected checkbox
     */
    createModel(point) {
        return Object.defineProperty({}, 'value', {
            get: () => this.selectedPoints.has(point.xid),
            set: val => {
                const event = this.checkboxEvents.get(point);
                const pointIndex = this.points.indexOf(point);
                const prevPointIndex = this.points.indexOf(this.prevPoint);
                
                if (event && event.shiftKey && pointIndex >= 0 && prevPointIndex >= 0 && pointIndex !== prevPointIndex) {
                    const minIndex = Math.min(pointIndex, prevPointIndex);
                    const maxIndex = Math.max(pointIndex, prevPointIndex);
                    this.points.slice(minIndex, maxIndex + 1).forEach(pt => {
                        if (val) {
                            this.selectedPoints.set(pt.xid, pt);
                        } else {
                            this.selectedPoints.delete(pt.xid);
                        }
                    });
                } else {
                    this.prevPoint = point;
                    if (val) {
                        this.selectedPoints.set(point.xid, point);
                    } else {
                        this.selectedPoints.delete(point.xid);
                    }
                }
            }
        });
    }
    
    getModel(point) {
        if (point == null) return;
        
        let model = this.models.get(point);
        if (!model) {
            model = this.createModel(point);
            this.models.set(point, model);
        }
        return model;
    }
    
    checkBoxClicked(point, event) {
        this.checkboxEvents.set(point, event);
    }

    getCellValue(point, property) {
        let result = point;
        for (let i = 0; i < property.length; i++) {
            if (result == null || typeof result !== 'object') {
                return;
            }
            result = result[property[i]];
        }
        return result;
    }
}

export default {
    template: dataPointSelectorTemplate,
    controller: DataPointSelectorController,
    require: {
        ngModelCtrl: 'ngModel'
    },
    bindings: {
        localStorageKey: '<?'
    }
};