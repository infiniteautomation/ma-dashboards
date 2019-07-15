/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import dataPointSelectorTemplate from './dataPointSelector.html';
import './dataPointSelector.css';

/*
 * TODO
fixed column widths / weight per column? make configurable and store in settings
store filters in settings
store tags in settings
re-instate the shift click
select rows rather than use checkboxes
touch behavior / check mobile layout
click and drag to select multiple?
button to select all / clear selection
refresh button
check WS update behavior
Single select mode
combined menu for selecting columns and tags
*/

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

        this.pages = new Map();
        this.pageSize = 25;
        this.cachedPages = 10;
        
        this.tags = new Map();

        this.selectedPoints = new Map();
        this.models = new WeakMap();

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
            this.getPoints('query');
        });
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
    
    reloadPages() {
        for (let page of this.pages.values()) {
            this.maPoint.cancelRequest(page.promise);
            page.reload = true;
        }
    }

    clearPagesCache(preserveTotal = true, reloadOnly = false) {
        for (let page of this.pages.values()) {
            this.maPoint.cancelRequest(page.promise);
        }
        
        const total = this.pages.$total;
        this.pages = new Map();

        // sorting doesn't change the total
        if (preserveTotal) {
            this.pages.$total = total;
        }
    }
    
    getPoints(reason, startIndex = 0) {
        // tags and columns must be available.
        if (!this.selectedColumns || !this.selectedTags) {
            return;
        }
        
        if (reason === 'query' || reason === 'sort') {
            this.clearPagesCache(reason !== 'query');
        }

        this.queryObj = this.maPoint.buildQuery();
        
        this.selectedColumns.forEach(col => col.applyFilter(this.queryObj));
        this.selectedTags.forEach(tag => tag.applyFilter(this.queryObj));

        // query might change, don't want to update the pages with the results from the old query
        const pages = this.pages;

        const sortArray = this.sort.map(item => item.descending ? `-${item.columnName}` : item.columnName);
        if (sortArray.length) {
            this.queryObj.sort(...sortArray);
        }
        this.queryObj.limit(this.pageSize, startIndex);

        const pointsPromise = this.pointsPromise = this.queryObj.query();

        // reuse the existing page, preserving its points array for the meantime
        const page = pages.get(startIndex) || {startIndex};
        delete page.reload;
        page.promise = pointsPromise;
        
        pages.set(startIndex, page);
        if (pages.size > this.cachedPages) {
            const [firstKey] = this.pages.keys();
            this.pages.delete(firstKey);
        }

        pointsPromise.then(result => {
            pages.$total = result.$total;
            page.points = result;
        }).catch(error => {
            pages.delete(startIndex);
            
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
        this.getPoints('sort');
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
        let queryType;

        nonSelected.forEach(c => {
            const index = this.sort.findIndex(s => s.columnName === c.columnName);
            if (index >= 0) {
                this.sort.splice(index, 1);
                queryType = 'sort';
            }
            if (c.filter != null) {
                c.filter = null;
                queryType = 'query';
            }
        });
        
        if (queryType) {
            this.getPoints(queryType);
        }
    }
    
    setDifference(a, b) {
        const diff = new Set(a);
        for (let o of b) {
            diff.delete(o);
        }
        return diff;
    }

    filterButtonClicked() {
        this.showFilters = !this.showFilters;

        if (!this.showFilters) {
            let filtersChanged = false;
            
            this.columns.concat(this.availableTags).forEach(c => {
                if (c.filter != null) {
                    c.filter = null;
                    filtersChanged = true;
                }
            });

            if (filtersChanged) {
                this.getPoints('query');
            }
        }
        
        this.saveSettings();
    }
    
    filterChanged() {
        this.saveSettings();
        this.getPoints('query');
    }
    
    /**
     * Creates a getter / setter model for the selected checkbox
     */
    createModel(point) {
        return Object.defineProperty({}, 'value', {
            get: () => this.selectedPoints.has(point.xid),
            set: val => {
                if (val) {
                    this.selectedPoints.set(point.xid, point);
                } else {
                    this.selectedPoints.delete(point.xid);
                }
            }
        });
    }
    
    getModel(point, index) {
        if (point == null) return;
        
        let model = this.models.get(point);
        if (!model) {
            model = this.createModel(point);
            this.models.set(point, model);
        }
        return model;
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
        let changeMade = false;

        /*
        while (this.updateQueue.length) {
            const update = this.updateQueue.shift();
            if (update.eventName === 'create') {
                changeMade |= this.pointAdded(update.point);
            } else if (update.eventName === 'update') {
                changeMade |= this.pointUpdated(update.point);
            } else if (update.eventName === 'delete') {
                changeMade |= this.pointDeleted(update.point);
            }
        }
        */

        // TODO we currently have no good way to know if the updated point matches our current query
        // just mark all of our pages as needing a reload
        changeMade = true;
        this.updateQueue.length = 0;
        
        if (changeMade) {
            this.$scope.$apply(() => {
                this.reloadPages();
            });
        }
    }

    /**
     * md-virtual-repeat with md-on-demand interface
     */
    getItemAtIndex(index) {
        const startIndex = index - index % this.pageSize;
        const page = this.pages.get(startIndex);
        
        if (!page || page.reload) {
            this.getPoints('page', startIndex);
        }
        
        if (page.points) {
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