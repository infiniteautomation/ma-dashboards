/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import BoundedMap from './BoundedMap';

class Column {
    
    constructor(options) {
        Object.assign(this, options);

        this.property = this.name.split('.');
        this.filterable = options.hasOwnProperty('filterable') ? !!options.filterable : true;
        this.sortable = options.hasOwnProperty('sortable') ? !!options.sortable : true;
    }
    
    applyFilter(queryBuilder) {
        if (this.filter === '!' || this.filter === '!*') {
            queryBuilder.eq(this.name, null);
        } else if (this.filter === '*') {
            queryBuilder.ne(this.name, null);
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
                queryBuilder[isNot ? 'ne' : 'eq'](this.name, numericValue);
            } else if (this.boolean) {
                const booleanValue = ['true', 'y', '1'].includes(filter.toLowerCase());
                queryBuilder[isNot ? 'ne' : 'eq'](this.name, booleanValue);
            } else if (!exact && (filter.includes('*') || filter.includes('?'))) {
                if (isNot) {
                    queryBuilder.not().match(this.name, filter).up();
                } else {
                    queryBuilder.match(this.name, filter);
                }
            } else if (!exact && !this.exact) {
                if (isNot) {
                    queryBuilder.not().match(this.name, `*${filter}*`).up();
                } else {
                    queryBuilder.match(this.name, `*${filter}*`);
                }
            } else {
                queryBuilder[isNot ? 'ne' : 'eq'](this.name, filter);
            }
        }
    }
}

class TableController {
    static get $$ngIsClass() { return true; }

    constructor(options) {
        Object.assign(this, options);

        const $injector = this.$injector;
        this.maDialogHelper = $injector.get('maDialogHelper');
        this.$timeout = $injector.get('$timeout');
        this.localStorageService = $injector.get('localStorageService');
        this.maUtil = $injector.get('maUtil');
        this.$q = $injector.get('$q');
        this.$interval = $injector.get('$interval');
        if ($injector.has('$mdTheming')) {
            $injector.get('$mdTheming')(this.$element);
        }

        this.idProperty = this.resourceService.idProperty;
        this.showFilters = true;
        this.showClear = true;
        this.pageSize = 50;
        this.cacheSize = 10;
        this.pages = new BoundedMap(this.cacheSize);
        this.selectedItems = new Map();

        this.loadSettings();
    }

    $onInit() {
        if (this.ngModelCtrl) {
            this.ngModelCtrl.$render = () => this.render();
        }

        this.updateQueue = [];
        this.deregister = this.resourceService.notificationManager.subscribe((event, item) => {
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
        
        // closes the options menu if this user table is encapsulated in a maDropDown and it closes
        this.$scope.$on('maDropDownClose', event => {
            if (this.mdMenuCtrl) {
                this.mdMenuCtrl.close(false, {closeAll: true});
            }
        });
        
        // have to load columns first as they may have saved filters which we need to apply before
        // loading the items
        this.loadColumns().then(() => {
            this.selectColumns();
            this.getItems();
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
            this.selectedItems.set(item[this.idProperty], item);
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
        this.settings = this.localStorageService.get(this.localStorageKey) || {};
        
        if (this.settings.hasOwnProperty('showFilters')) {
            this.showFilters = !!this.settings.showFilters;
        }
        
        if (!this.settings.filters) {
            this.settings.filters = {};
        }

        this.sort = this.settings.sort || this.defaultSort || [];
    }
    
    saveSettings() {
        this.settings.sort = this.sort;

        this.settings.showFilters = this.showFilters;
        this.settings.filters = {};
        this.selectedColumns.forEach(c => {
            if (c.filter != null) {
                this.settings.filters[c.name] = c.filter;
            }
        });
        
        this.localStorageService.set(this.localStorageKey, this.settings);
    }

    loadColumns() {
        return this.$q.resolve().then(() => {
            const filters = this.settings.filters || {};
            this.columns = this.defaultColumns.map((column, i) => {
                return this.createColumn(Object.assign({
                    order: i,
                    filter: filters[column.name] || null
                }, column));
            });
        });
    }
    
    selectColumns() {
        const selected = Array.isArray(this.settings.selectedColumns) ? this.settings.selectedColumns : [];
        const deselected = Array.isArray(this.settings.deselectedColumns) ? this.settings.deselectedColumns : [];
        this.selectedColumns = this.columns.filter(c => selected.includes(c.name) || c.selectedByDefault && !deselected.includes(c.name));
    }
    
    markCacheAsStale() {
        for (let page of this.pages.values()) {
            if (page.queryPromise) {
                this.resourceService.cancelRequest(page.queryPromise);
            }
            page.stale = true;
        }
    }

    clearCache(preserveTotal = true) {
        this.markCacheAsStale();
        
        const total = this.pages.$total;
        this.pages = new BoundedMap(this.cacheSize);
        
        // sorting doesn't change the total
        if (preserveTotal) {
            this.pages.$total = total;
        }
    }

    createQueryBuilder() {
        const queryBuilder = this.resourceService.buildQuery();
        
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
                        this.selectedItems.delete(item[this.idProperty]);
                    } else {
                        this.selectedItems.set(item[this.idProperty], item);
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
        if (firstSort && firstSort.columnName === column.name) {
            if (!firstSort.descending) {
                // second click
                firstSort.descending = true;
            } else {
                // third click
                this.sort.shift();
            }
        } else {
            // first click
            this.sort = this.sort.filter(item => item.columnName !== column.name);
            
            this.sort.unshift({columnName: column.name});
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

        const nonSelected = this.maUtil.setDifference(this.columns, this.selectedColumns);
        this.columnsDeselected(nonSelected);
        this.saveSettings();
    }

    /**
     * Removes non selected columns from the sort and filtering
     */
    columnsDeselected(nonSelected) {
        let queryChanged;

        nonSelected.forEach(c => {
            const index = this.sort.findIndex(s => s.columnName === c.name);
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
                const existing = this.selectedItems.get(update.item[this.idProperty]);
                if (existing) {
                    Object.assign(existing, update.item);
                    setViewValue = true;
                }
            } else if (update.eventName === 'delete') {
                const deleted = this.selectedItems.delete(update.item[this.idProperty]);
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
        return this.maUtil.createBooleanModel(this.selectedColumns, column, 'name');
    }

    cancelSelect() {
        delete this.pages.mouseDown;
    }

    rowClicked(event, item, index) {
        const itemId = item[this.idProperty];
        const deselect = this.selectedItems.has(itemId);
        const lastClick = this.pages.mouseDown;
        this.pages.mouseDown = {item, index, deselect};

        // TODO add allow deselect attribute
        if (!this.selectMultiple) {
            this.selectedItems.clear();
        }
        
        if (deselect) {
            this.selectedItems.delete(itemId);
        } else {
            this.selectedItems.set(itemId, item);
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
    
    createColumn(options) {
        return new Column(options);
    }
}

export default TableController;