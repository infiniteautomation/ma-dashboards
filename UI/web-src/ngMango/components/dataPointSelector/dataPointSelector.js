/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import dataPointSelectorTemplate from './dataPointSelector.html';

import './dataPointSelector.css';

const defaultColumns = [
    {name: 'xid', label: 'ui.app.xidShort', selectedByDefault: false},
    {name: 'dataSourceName', label: 'ui.app.dataSource', selectedByDefault: false},
    {name: 'dataType', label: 'dsEdit.pointDataType', selectedByDefault: false},
    {name: 'deviceName', label: 'common.deviceName', selectedByDefault: true},
    {name: 'name', label: 'common.name', selectedByDefault: true},
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
    {name: 'value', label: 'ui.app.pointValue', selectedByDefault: true}
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
        this.getPointsBound = (...args) => this.getPoints(...args);

        this.numberOfRows = 15;
        this.availableTagsByKey = {};
        this.availableTags = [];
        this.selectedTags = [];
        this.prevSelectedTags = [];
        this.manuallySelectedTags = [];

        this.points = new Map();
        this.pointsArray = [];
        
        this.selectedPoints = new Map();
        this.checkboxEvents = new Map();

        this.pageNumber = 1;
        this.sortString = 'deviceName';
        this.sortArray = ['deviceName', 'name'];
        
        this.selectAll = false;
        this.selectAllIndeterminate = false;

        this.loadSettings();
        this.resetColumns();
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
                        this.checkAvailableTags();
                        this.filterPoints();
                    });
                }
            }
            
            this.prevUpdateQueueSize = this.updateQueue.length;
        }, 500, null, false);
        
        this.getPoints();
        
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
        
        this.updateSelectAllStatus();
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

    getPoints() {
        this.cancelGetPoints();
        this.checkboxEvents.clear();
        this.prevPoint = null;

        this.queryObj = this.maPoint.buildQuery();
        
        this.selectedColumns.forEach(col => {
            if (col.filter) {
                this.queryObj.like(col.name, `*${col.filter}*`);
            }
        });
        
        this.selectedTags.forEach(tag => {
            if (tag.filter) {
                this.queryObj.like(`tags.${tag.name}`, `*${tag.filter}*`);
            }
        });
        
        this.queryObj.sort(...this.sortArray)
            .limit(this.numberOfRows, (this.pageNumber - 1) * this.numberOfRows);

        const p = this.pointsPromiseQuery = this.queryObj.query();

        const pointsPromise = this.pointsPromise = p.then(points => {
            this.points = points.reduce((map, p) => (map.set(p.xid, p), map), new Map());
            this.pointsArray = Array.from(this.points.values());
            this.totalPoints = points.$total;
            this.updateSelectAllStatus();
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
        
        this.getPoints();
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

    updateSelectAllStatus() {
        const selectedFiltered = this.pointsArray.filter(pt => this.selectedPoints.has(pt.xid));
        
        if (selectedFiltered.length === this.pointsArray.length) {
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
            this.pointsArray.forEach(pt => {
                this.selectedPoints.set(pt.xid, pt);
            });
        } else {
            this.pointsArray.forEach(pt => {
                this.selectedPoints.delete(pt.xid);
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

    pointMatchesQuery(point) {
        // TODO check the point matches this.queryObj
        return false;
    }

    pointAdded(point) {
        if (this.pointMatchesQuery(point)) {
            this.points.set(point.xid, point);
            return true;
        }
    }
    
    pointUpdated(point) {
        const found = this.points.get(point.xid);
        if (found) {
            angular.copy(point, found);
            return true;
        }
    }
    
    pointDeleted(point) {
        const inPoints = this.points.delete(point.xid);
        const inSelected = this.selectedPoints.delete(point.xid);

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
        this.getPoints();
    }
    
    /**
     * Getter / setter for the checkbox model
     */
    pointSelected(point) {
        return (val) => {
            if (val === undefined) {
                return this.selectedPoints.has(point.xid);
            }
            
            const event = this.checkboxEvents.get(point);
            const pointIndex = this.pointsArray.indexOf(point);
            const prevPointIndex = this.pointsArray.indexOf(this.prevPoint);
            
            if (event && event.shiftKey && pointIndex >= 0 && prevPointIndex >= 0 && pointIndex !== prevPointIndex) {
                const minIndex = Math.min(pointIndex, prevPointIndex);
                const maxIndex = Math.max(pointIndex, prevPointIndex);
                this.pointsArray.slice(minIndex, maxIndex + 1).forEach(pt => {
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