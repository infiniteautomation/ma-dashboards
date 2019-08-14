/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import dataPointSelectorTemplate from './dataPointSelector.html';
import './dataPointSelector.css';

const defaultColumns = [
    {name: 'xid', label: 'ui.app.xidShort'},
    {name: 'dataSourceName', label: 'ui.app.dataSource'},
    {name: 'dataType', label: 'dsEdit.pointDataType', exact: true},
    {name: 'deviceName', label: 'common.deviceName', selectedByDefault: true},
    {name: 'name', label: 'common.name', selectedByDefault: true},
    {name: 'enabled', label: 'common.enabled', boolean: true},
    {name: 'readPermission', label: 'pointEdit.props.permission.read'},
    {name: 'setPermission', label: 'pointEdit.props.permission.set'},
    {name: 'unit', label: 'pointEdit.props.unit'},
    {name: 'chartColour', label: 'pointEdit.props.chartColour'},
    {name: 'plotType', label: 'pointEdit.plotType', exact: true},
    {name: 'rollup', label: 'common.rollup'},
    {name: 'templateXid', label: 'ui.app.templateXid'},
    {name: 'integralUnit', label: 'pointEdit.props.integralUnit'},
    {name: 'pointFolderId', label: 'ui.app.hierarchyFolderId', numeric: true},
    {name: 'simplifyType', label: 'pointEdit.props.simplifyType'},
    {name: 'simplifyTolerance', label: 'pointEdit.props.simplifyTolerance', numeric: true},
    {name: 'simplifyTarget', label: 'pointEdit.props.simplifyTarget', numeric: true},
    {name: 'value', label: 'ui.app.pointValue'}
];

const applyFilter = function(queryBuilder) {
    if (this.filter === '!' || this.filter === '!*') {
        queryBuilder.eq(this.columnName, null);
    } else if (this.filter === '*') {
        queryBuilder.ne(this.columnName, null);
    } else if (this.filter) {
        let filter = this.filter;
        
        const isNot = filter.startsWith('!');
        if (isNot) {
            filter = filter.slice(1);
        }
        const exact = filter.startsWith('=');
        if (exact) {
            filter = filter.slice(1);
        }
        
        if (this.numeric) {
            let numericValue = null;
            try {
                numericValue = Number.parseFloat(filter);
            } catch (e) {}
            queryBuilder[isNot ? 'ne' : 'eq'](this.columnName, numericValue);
        } else if (this.boolean) {
            const booleanValue = ['true','y', '1'].includes(filter.toLowerCase());
            queryBuilder[isNot ? 'ne' : 'eq'](this.columnName, booleanValue);
        } else if (!exact && filter.includes('*')) {
            queryBuilder[isNot ? 'nlike' : 'like'](this.columnName, filter);
        } else if (!exact && !this.exact) {
            queryBuilder[isNot ? 'nlike' : 'like'](this.columnName, `*${filter}*`);
        } else {
            queryBuilder[isNot ? 'ne' : 'eq'](this.columnName, filter);
        }
    }
};

const defaultLocalStorageKey = 'dataPointSelector';

class DataPointSelectorController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return ['maPoint', 'maDataPointTags', 'maDialogHelper', 'maTranslate', '$timeout',
            'localStorageService', 'maUtil', '$q', '$scope', '$interval', '$injector', '$element']; }
    
    constructor(maPoint, maDataPointTags, maDialogHelper, maTranslate, $timeout,
            localStorageService, maUtil, $q, $scope, $interval, $injector, $element) {

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

        this.showFilters = true;
        this.showClear = true;
        this.pageSize = 25;
        this.cacheSize = 10;
        this.pages = new maUtil.BoundedMap(this.cacheSize);
        
        this.tags = new Map();
        this.selectedPoints = new Map();
        
        if ($injector.has('$mdTheming')) {
            $injector.get('$mdTheming')($element);
        }

        this.loadSettings();
        this.resetColumns();
    }

    $onInit() {
        this.ngModelCtrl.$render = () => this.render();

        this.updateQueue = [];
        this.deregister = this.maPoint.notificationManager.subscribe((event, point) => {
            // we queue up the updates and process them in batches to prevent continuous $scope.$apply() when large numbers of
            // points are being edited
            this.updateQueue.push({
                eventName: event.name,
                point
            });
        });

        let intervalTicks = 0;
        let updateQueueLength = 0;
        this.intervalPromise = this.$interval(() => {
            if (this.updateQueue.length) {
                // we only process the queue of updates every 20 ticks of the interval if the queue is being continuously updated
                // or if the queue length does not change between ticks
                if (++intervalTicks >= 20 || this.updateQueue.length === updateQueueLength) {
                    intervalTicks = 0;
                    this.processUpdateQueue();
                }
                updateQueueLength = this.updateQueue.length;
            }
        }, 500, null, false);

        this.maDataPointTags.keys().then(keys => {
            this.updateAvailableTags(keys);
            this.getPoints();
        });
    }
    
    $onDestroy() {
        this.deregister();
        this.$interval.cancel(this.intervalPromise);
    }
    
    $onChanges(changes) {
    }
    
    render() {
        let points;
        if (this.selectMultiple) {
            points = Array.isArray(this.ngModelCtrl.$viewValue) ? this.ngModelCtrl.$viewValue : [];
        } else {
            points = this.ngModelCtrl.$viewValue ? [this.ngModelCtrl.$viewValue] : [];
        }

        this.selectedPoints.clear();
        points.forEach(point => {
            this.selectedPoints.set(point.xid, point);
        });
    }
    
    setViewValue() {
        if (this.selectMultiple) {
            this.ngModelCtrl.$setViewValue(Array.from(this.selectedPoints.values()));
        } else {
            const [first] = this.selectedPoints.values();
            this.ngModelCtrl.$setViewValue(first || null);
        }
    }
    
    loadSettings() {
        this.settings = this.localStorageService.get(this.localStorageKey || defaultLocalStorageKey) || {};
        
        if (this.settings.hasOwnProperty('showFilters')) {
            this.showFilters = !!this.settings.showFilters;
        }
        
        if (!this.settings.filters) {
            this.settings.filters = {};
        }

        this.sort = this.settings.sort || [{columnName: 'deviceName'}, {columnName: 'name'}];
    }
    
    saveSettings() {
        this.settings.sort = this.sort;

        this.settings.showFilters = this.showFilters;
        this.settings.filters = {};
        this.selectedColumns.concat(this.selectedTags).forEach(c => {
            if (c.filter != null) {
                this.settings.filters[c.columnName] = c.filter;
            }
        });
        
        this.localStorageService.set(this.localStorageKey || defaultLocalStorageKey, this.settings);
    }

    resetColumns() {
        const filters = this.settings.filters || {};
        
        this.columns = defaultColumns.map((column, i) => {
            return Object.assign({}, column, {
                order: i,
                property: column.name.split('.'),
                columnName: column.name,
                filter: filters[column.name] || null,
                applyFilter
            });
        });

        const selected = Array.isArray(this.settings.selectedColumns) ? this.settings.selectedColumns : [];
        const deselected = Array.isArray(this.settings.deselectedColumns) ? this.settings.deselectedColumns : [];
        this.selectedColumns = this.columns.filter(c => selected.includes(c.name) || c.selectedByDefault && !deselected.includes(c.name));
        
        this.showPointValueColumn = !!this.selectedColumns.find(c => c.name === 'value');
    }
    
    updateAvailableTags(keys) {
        keys.forEach(k => {
            if (!this.tags.has(k)) {
                const columnName = `tags.${k}`;
                this.tags.set(k, {
                    name: k,
                    columnName,
                    label: 'ui.app.tag',
                    labelArgs: [k],
                    filter: this.settings.filters[columnName] || null,
                    applyFilter
                });
            }
        });

        this.availableTags = Array.from(this.tags.values());
        this.selectedTags = (this.settings.selectedTags || [])
            .map(k => this.tags.get(k))
            .filter(item => item != null);
    }
    
    markCacheAsStale() {
        for (let page of this.pages.values()) {
            if (page.queryPromise) {
                this.maPoint.cancelRequest(page.queryPromise);
            }
            page.stale = true;
        }
    }

    clearCache(preserveTotal = true) {
        this.markCacheAsStale();
        
        const total = this.pages.$total;
        this.pages = new this.maUtil.BoundedMap(this.cacheSize);
        
        // sorting doesn't change the total
        if (preserveTotal) {
            this.pages.$total = total;
        }
    }

    createQueryBuilder() {
        const queryBuilder = this.maPoint.buildQuery();
        
        this.selectedColumns.forEach(col => col.applyFilter(queryBuilder));
        this.selectedTags.forEach(tag => tag.applyFilter(queryBuilder));

        const sortArray = this.sort.map(item => item.descending ? `-${item.columnName}` : item.columnName);
        if (sortArray.length) {
            queryBuilder.sort(...sortArray, 'id');
        }
        
        return queryBuilder;
    }

    getPage(startIndex = 0, evictCache = true) {
        // keep a reference to pages, don't want to update a new pages map with the results from an old query
        const pages = this.pages;

        // reuse the existing page, preserving its points array for the meantime
        const page = pages.get(startIndex) || {startIndex};
        if (page.points && !page.stale) {
            return this.$q.resolve(page.points);
        } else if (page.promise) {
            return page.promise;
        }
        pages.set(startIndex, page, evictCache);

        const queryBuilder = this.createQueryBuilder();
        queryBuilder.limit(this.pageSize, startIndex);
        
        page.queryPromise = queryBuilder.query();
        
        page.promise = page.queryPromise.then(result => {
            pages.$total = result.$total;
            delete page.stale;
            page.points = result;
            return result;
        }, error => {
            pages.delete(startIndex);
            
            if (error.status === -1 && error.resource && error.resource.cancelled) {
                // request cancelled, ignore error
                return;
            }
            
            const message = error.mangoStatusText || (error + '');
            this.maDialogHelper.errorToast(['ui.app.errorGettingPoints', message]);
            
            return this.$q.reject(error);
        }).finally(() => {
            delete page.queryPromise;
            delete page.promise;
        });
        
        return page.promise;
    }

    getPoints(startIndex = 0) {
        const pointsPromise = this.pointsPromise = this.getPage(startIndex);
        
        this.pointsPromise.finally(() => {
            // check we are deleting our own promise, not one for a new query
            if (this.pointsPromise === pointsPromise) {
                delete this.pointsPromise;
            }
        });
    }
    
    selectAll(startIndex = 0, endIndex = undefined, deselect = false) {
        this.getPage(startIndex, false).then(points => {
            
            points.every((point, i) => {
                if (endIndex == null || i < endIndex - startIndex) {
                    if (deselect) {
                        this.selectedPoints.delete(point.xid);
                    } else {
                        this.selectedPoints.set(point.xid, point);
                    }
                    return true;
                }
            });

            const nextPageIndex = startIndex + this.pageSize;
            const hasMore = points.$total > nextPageIndex;
            const wantMore = endIndex == null || endIndex > nextPageIndex;
            
            if (wantMore && hasMore) {
                this.selectAll(nextPageIndex, endIndex, deselect);
            } else {
                this.setViewValue();
            }
        });
    }
    
    deselectAll(startIndex = 0, endIndex = undefined) {
        return this.selectAll(startIndex, endIndex, true);
    }

    sortBy(column) {
        // sort order goes from
        // a) ascending
        // b) descending
        // c) no sort
        
        const firstSort = this.sort[0];
        if (firstSort && firstSort.columnName === column.columnName) {
            if (!firstSort.descending) {
                // second click
                firstSort.descending = true;
            } else {
                // third click
                this.sort.shift();
            }
        } else {
            // first click
            this.sort = this.sort.filter(item => item.columnName !== column.columnName);
            
            this.sort.unshift({columnName: column.columnName});
            if (this.sort.length > 3) {
                this.sort.pop();
            }
        }

        this.saveSettings();
        this.clearCache();
        this.getPoints();
    }

    selectedColumnsChanged() {
        this.showPointValueColumn = !!this.selectedColumns.find(c => c.name === 'value');
        
        this.settings.deselectedColumns = this.columns
            .filter(c => c.selectedByDefault && !this.selectedColumns.includes(c))
            .map(c => c.name);
        
        this.settings.selectedColumns = this.selectedColumns
            .filter(c => !c.selectedByDefault)
            .map(c => c.name);

        const nonSelected = this.setDifference(this.columns, this.selectedColumns);
        this.columnsDeselected(nonSelected);
        this.saveSettings();
    }
    
    selectedTagsChanged() {
        this.settings.selectedTags = this.selectedTags.map(t => t.name);

        const nonSelected = this.setDifference(this.availableTags, this.selectedTags);
        this.columnsDeselected(nonSelected);
        this.saveSettings();
    }
    
    /**
     * Removes non selected columns from the sort and filtering
     */
    columnsDeselected(nonSelected) {
        let queryChanged;

        nonSelected.forEach(c => {
            const index = this.sort.findIndex(s => s.columnName === c.columnName);
            if (index >= 0) {
                this.sort.splice(index, 1);
                queryChanged = true;
            }
            if (c.filter != null) {
                c.filter = null;
                queryChanged = true;
            }
        });
        
        if (queryChanged) {
            this.clearCache();
            this.getPoints();
        }
    }
    
    setDifference(a, b) {
        const diff = new Set(a);
        for (let o of b) {
            diff.delete(o);
        }
        return diff;
    }

    showFiltersChanged() {
        if (!this.showFilters) {
            let filtersChanged = false;
            
            this.columns.concat(this.availableTags).forEach(c => {
                if (c.filter != null) {
                    c.filter = null;
                    filtersChanged = true;
                }
            });

            if (filtersChanged) {
                this.clearCache();
                this.getPoints();
            }
        }
        
        this.saveSettings();
    }
    
    filterChanged() {
        this.saveSettings();
        this.clearCache();
        this.getPoints();
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
    
    processUpdateQueue() {
        // TODO we currently have no good way to know if the updated point matches our current query
        // just mark all of our pages as being stale and needing a reload
        
        let setViewValue = false;
        
        while (this.updateQueue.length) {
            const update = this.updateQueue.shift();
            
            if (update.eventName === 'create') {
                // ignore
            } else if (update.eventName === 'update') {
                const existing = this.selectedPoints.get(update.point.xid);
                if (existing) {
                    Object.assign(existing, update.point);
                    setViewValue = true;
                }
            } else if (update.eventName === 'delete') {
                const deleted = this.selectedPoints.delete(update.point.xid);
                if (deleted) {
                    setViewValue = true;
                }
            }
        }
        this.$scope.$apply(() => {
            if (setViewValue) {
                this.setViewValue();
            }
            this.markCacheAsStale();
        });
    }

    /**
     * md-virtual-repeat with md-on-demand interface
     */
    getItemAtIndex(index) {
        const startIndex = index - index % this.pageSize;
        const page = this.pages.get(startIndex);
        
        if (!page || page.stale) {
            this.getPoints(startIndex);
        }
        
        if (page && page.points) {
            return page.points[index - startIndex];
        } else {
            return null;
        }
    }
    
    /**
     * md-virtual-repeat with md-on-demand interface
     */
    getLength() {
        return this.pages.$total;
    }

    clearSelection() {
        this.selectedPoints.clear();
        this.setViewValue();
    }
    
    getSelectedColumnsModel(column) {
        return this.maUtil.createBooleanModel(this.selectedColumns, column, a => a.name);
    }
    
    getSelectedTagsModel(tag) {
        return this.maUtil.createBooleanModel(this.selectedTags, tag, a => a.name);
    }

    cancelSelect() {
        delete this.pages.mouseDown;
    }

    rowClicked(event, point, index) {
        const deselect = this.selectedPoints.has(point.xid);
        const lastClick = this.pages.mouseDown;
        this.pages.mouseDown = {point, index, deselect};

        // TODO add allow deselect attribute
        if (!this.selectMultiple) {
            this.selectedPoints.clear();
        }
        
        if (deselect) {
            this.selectedPoints.delete(point.xid);
        } else {
            this.selectedPoints.set(point.xid, point);
        }

        if (this.selectMultiple && event.shiftKey && lastClick) {
            const fromIndex = Math.min(index, lastClick.index);
            const toIndex = Math.max(index, lastClick.index);

            if (toIndex > fromIndex) {
                this.selectAll(fromIndex, toIndex + 1, deselect);
                return; // dont setViewValue() yet
            }
        }
        
        this.setViewValue();
    }
}

export default {
    template: dataPointSelectorTemplate,
    controller: DataPointSelectorController,
    require: {
        ngModelCtrl: 'ngModel'
    },
    bindings: {
        localStorageKey: '<?',
        selectMultiple: '<?',
        showClear: '<?'
    }
};