/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import userTableTemplate from './userTable.html';
import './userTable.css';

const defaultColumns = [
    {name: 'username', label: 'users.username', selectedByDefault: true},
    {name: 'name', label: 'users.name', selectedByDefault: true},
    {name: 'email', label: 'users.email'},
    {name: 'phone', label: 'users.phone'},
    {name: 'organization', label: 'users.organization', selectedByDefault: true}
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
            const booleanValue = ['true', 'y', '1'].includes(filter.toLowerCase());
            queryBuilder[isNot ? 'ne' : 'eq'](this.columnName, booleanValue);
        } else if (!exact && filter.includes('*')) {
            if (isNot) {
                queryBuilder.not().match(this.columnName, filter).up();
            } else {
                queryBuilder.match(this.columnName, filter);
            }
        } else if (!exact && !this.exact) {
            if (isNot) {
                queryBuilder.not().match(this.columnName, `*${filter}*`).up();
            } else {
                queryBuilder.match(this.columnName, `*${filter}*`);
            }
        } else {
            queryBuilder[isNot ? 'ne' : 'eq'](this.columnName, filter);
        }
    }
};

const defaultLocalStorageKey = 'userTable';

class UserTableController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return ['maUser', 'maDialogHelper', '$timeout',
            'localStorageService', 'maUtil', '$q', '$scope', '$interval', '$injector', '$element']; }
    
    constructor(maUser, maDialogHelper, $timeout,
            localStorageService, maUtil, $q, $scope, $interval, $injector, $element) {

        this.maUser = maUser;
        this.maDialogHelper = maDialogHelper;
        this.$timeout = $timeout;
        this.localStorageService = localStorageService;
        this.maUtil = maUtil;
        this.$q = $q;
        this.$scope = $scope;
        this.$interval = $interval;

        this.showFilters = true;
        this.showClear = true;
        this.pageSize = 50;
        this.cacheSize = 10;
        this.pages = new maUtil.BoundedMap(this.cacheSize);
        
        this.selectedItems = new Map();
        
        if ($injector.has('$mdTheming')) {
            $injector.get('$mdTheming')($element);
        }

        this.loadSettings();
        this.resetColumns();
    }

    $onInit() {
        if (this.ngModelCtrl) {
            this.ngModelCtrl.$render = () => this.render();
        }

        this.updateQueue = [];
        this.deregister = this.maUser.notificationManager.subscribe((event, item) => {
            // we queue up the updates and process them in batches to prevent continuous $scope.$apply() when large numbers of
            // items are being edited
            this.updateQueue.push({
                eventName: event.name,
                item
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

        this.getItems();
        
        // closes the options menu if this user table is encapsulated in a maDropDown and it closes
        this.$scope.$on('maDropDownClose', event => {
            if (this.mdMenuCtrl) {
                this.mdMenuCtrl.close(false, {closeAll: true});
            }
        });
    }
    
    $onDestroy() {
        this.deregister();
        this.$interval.cancel(this.intervalPromise);
    }
    
    $onChanges(changes) {
    }
    
    render() {
        let items;
        if (this.selectMultiple) {
            items = Array.isArray(this.ngModelCtrl.$viewValue) ? this.ngModelCtrl.$viewValue : [];
        } else {
            items = this.ngModelCtrl.$viewValue ? [this.ngModelCtrl.$viewValue] : [];
        }

        this.selectedItems.clear();
        items.forEach(item => {
            this.selectedItems.set(item.username, item);
        });
    }
    
    setViewValue() {
        if (this.ngModelCtrl) {
            if (this.selectMultiple) {
                this.ngModelCtrl.$setViewValue(Array.from(this.selectedItems.values()));
            } else {
                const [first] = this.selectedItems.values();
                this.ngModelCtrl.$setViewValue(first || null);
            }
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

        this.sort = this.settings.sort || [{columnName: 'username'}];
    }
    
    saveSettings() {
        this.settings.sort = this.sort;

        this.settings.showFilters = this.showFilters;
        this.settings.filters = {};
        this.selectedColumns.forEach(c => {
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
                applyFilter,
                filterable: column.hasOwnProperty('filterable') ? !!column.filterable : true,
                sortable: column.hasOwnProperty('sortable') ? !!column.sortable : true
            });
        });

        const selected = Array.isArray(this.settings.selectedColumns) ? this.settings.selectedColumns : [];
        const deselected = Array.isArray(this.settings.deselectedColumns) ? this.settings.deselectedColumns : [];
        this.selectedColumns = this.columns.filter(c => selected.includes(c.name) || c.selectedByDefault && !deselected.includes(c.name));
    }
    
    markCacheAsStale() {
        for (let page of this.pages.values()) {
            if (page.queryPromise) {
                this.maUser.cancelRequest(page.queryPromise);
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
        const queryBuilder = this.maUser.buildQuery();
        
        this.selectedColumns.forEach(col => col.applyFilter(queryBuilder));

        const sortArray = this.sort.map(item => item.descending ? `-${item.columnName}` : item.columnName);
        // ensure the order of the results are deterministic by adding sort on id
        queryBuilder.sort(...sortArray, 'id');
        
        return queryBuilder;
    }

    getPage(startIndex = 0, evictCache = true) {
        // keep a reference to pages, don't want to update a new pages map with the results from an old query
        const pages = this.pages;

        // reuse the existing page, preserving its items array for the meantime
        const page = pages.get(startIndex) || {startIndex};
        if (page.items && !page.stale) {
            return this.$q.resolve(page.items);
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
            page.items = result;
            return result;
        }, error => {
            page.error = error;
            
            if (error.status === -1 && error.resource && error.resource.cancelled) {
                // request cancelled, ignore error
                pages.delete(startIndex);
                return;
            }

            const message = error.mangoStatusText || (error + '');
            this.maDialogHelper.errorToast(['ui.app.errorGettingItems', message]);
            
            // dont remove the page from the cache for 1 minute, stops repetitive requests with errors
            this.$timeout(() => {
                pages.delete(startIndex);
            }, 60 * 1000);
            
            return this.$q.reject(error);
        }).finally(() => {
            delete page.queryPromise;
            delete page.promise;
        });
        
        return page.promise;
    }

    getItems(startIndex = 0) {
        const itemsPromise = this.itemsPromise = this.getPage(startIndex);
        
        this.itemsPromise.finally(() => {
            // check we are deleting our own promise, not one for a new query
            if (this.itemsPromise === itemsPromise) {
                delete this.itemsPromise;
            }
        });
    }
    
    selectAll(startIndex = 0, endIndex = undefined, deselect = false) {
        this.getPage(startIndex, false).then(items => {
            
            items.every((item, i) => {
                if (endIndex == null || i < endIndex - startIndex) {
                    if (deselect) {
                        this.selectedItems.delete(item.username);
                    } else {
                        this.selectedItems.set(item.username, item);
                    }
                    return true;
                }
            });

            const nextPageIndex = startIndex + this.pageSize;
            const hasMore = items.$total > nextPageIndex;
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
        this.getItems();
    }

    selectedColumnsChanged() {
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
            this.getItems();
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
            
            this.columns.forEach(c => {
                if (c.filter != null) {
                    c.filter = null;
                    filtersChanged = true;
                }
            });

            if (filtersChanged) {
                this.clearCache();
                this.getItems();
            }
        }
        
        this.saveSettings();
    }
    
    filterChanged() {
        this.saveSettings();
        this.clearCache();
        this.getItems();
    }

    getCellValue(item, property) {
        let result = item;
        for (let i = 0; i < property.length; i++) {
            if (result == null || typeof result !== 'object') {
                return;
            }
            result = result[property[i]];
        }
        return result;
    }
    
    processUpdateQueue() {
        // TODO we currently have no good way to know if the updated item matches our current query
        // just mark all of our pages as being stale and needing a reload
        
        let setViewValue = false;
        
        while (this.updateQueue.length) {
            const update = this.updateQueue.shift();
            
            if (update.eventName === 'create') {
                // ignore
            } else if (update.eventName === 'update') {
                const existing = this.selectedItems.get(update.item.username);
                if (existing) {
                    Object.assign(existing, update.item);
                    setViewValue = true;
                }
            } else if (update.eventName === 'delete') {
                const deleted = this.selectedItems.delete(update.item.username);
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
            this.getItems(startIndex);
        }
        
        if (page && page.items) {
            return page.items[index - startIndex];
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
        this.selectedItems.clear();
        this.setViewValue();
    }
    
    getSelectedColumnsModel(column) {
        return this.maUtil.createBooleanModel(this.selectedColumns, column, a => a.name);
    }

    cancelSelect() {
        delete this.pages.mouseDown;
    }

    rowClicked(event, item, index) {
        const deselect = this.selectedItems.has(item.username);
        const lastClick = this.pages.mouseDown;
        this.pages.mouseDown = {item, index, deselect};

        // TODO add allow deselect attribute
        if (!this.selectMultiple) {
            this.selectedItems.clear();
        }
        
        if (deselect) {
            this.selectedItems.delete(item.username);
        } else {
            this.selectedItems.set(item.username, item);
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
    
    openMenu(event, mdMenuCtrl) {
        this.mdMenuCtrl = mdMenuCtrl;
        this.mdMenuCtrl.open(event);
    }
}

export default {
    template: userTableTemplate,
    controller: UserTableController,
    require: {
        ngModelCtrl: '?ngModel'
    },
    bindings: {
        localStorageKey: '<?',
        selectMultiple: '<?',
        showClear: '<?'
    }
};
