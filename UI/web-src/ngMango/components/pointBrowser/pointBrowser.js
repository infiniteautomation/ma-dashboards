/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import pointBrowserTemplate from './pointBrowser.html';
import './pointBrowser.css';

const types = ['watchList', 'deviceName', 'dataSource', 'tags'];

class PointBrowserController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return ['maTranslate', 'maRqlBuilder', 'maWatchList', 'maDataSource', '$timeout']; }
    constructor(maTranslate, maRqlBuilder, maWatchList, maDataSource, $timeout) {
        this.maTranslate = maTranslate;
        this.maRqlBuilder = maRqlBuilder;
        this.maWatchList = maWatchList;
        this.maDataSource = maDataSource;
        this.$timeout = $timeout;

        this.filter = null;
    }

    $onInit() {
        this.ngModelCtrl.$render = () => {
            if (this.ngModelCtrl.$viewValue !== undefined) {
                this.selected = this.ngModelCtrl.$viewValue;
                
                types.forEach(name => {
                    delete this[name];
                });

                if (!this.selected) return;
                
                if (!this.selected.isNew()) {
                    this.listType = 'watchList';
                    this.watchList = this.selected;
                } else if (this.selected.type === 'tags' && this.selected.tags) {
                    this.listType = 'tags';
                    this.convertTags(this.selected.tags);
                } else if (this.selected.type === 'query' && this.selected.deviceName) {
                    this.listType = 'deviceName';
                    this.deviceName = this.selected.deviceName;
                } else if (this.selected.type === 'query' && this.selected.dataSource) {
                    this.listType = 'dataSource';
                    this.dataSource = this.selected.dataSource;
                }
            }
        };
        
        if (this.loadItem) {
            // setting the view value from $onInit doesn't seem to work, only affects the device name
            // watch list type as its the only type that doesn't do http request before setting view value
            this.$timeout(() => {
                this.createWatchListFromItem(this.loadItem);
            }, 0, false);
        } else {
            this.listType = 'watchList';
        }
    }
    
    $onChanges(changes) {
        if (changes.loadItem && !changes.loadItem.isFirstChange() && this.loadItem) {
            this.createWatchListFromItem(this.loadItem);
        }
    }

    filterChanged() {
        this.nameQuery = this.filter ? {name: this.filter} : null;
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    createWatchListFromItem(item) {
        if (item.firstWatchList) {
            this.listType = 'watchList';
            this.maWatchList.objQuery({
                limit: 1,
                sort: 'name'
            }).$promise.then(lists => {
                if (lists.length) {
                    this.watchList = lists[0];
                    this.itemSelected('watchList');
                }
            });
        } else if (item.watchListXid) {
            this.listType = 'watchList';
            this.maWatchList.get({xid: item.watchListXid}).$promise.then(wl => {
                this.watchList = wl;
                this.itemSelected('watchList');
            }, angular.noop);
        } else if (item.dataSourceXid) {
            this.listType = 'dataSource';
            this.maDataSource.get({xid: item.dataSourceXid}).$promise.then(ds => {
                this.dataSource = ds;
                this.itemSelected('dataSource');
            }, angular.noop);
        } else if (item.deviceName) {
            this.deviceName = item.deviceName;
            this.listType = 'deviceName';
            this.itemSelected('deviceName');
        } else if (item.tags) {
            this.convertTags(item.tags);
            this.listType = 'tags';
            this.itemSelected('tags');
        } else {
            this.listType = 'watchList';
        }
    }

    /**
     * Converts the tags object from WL page which can have arrays for tag values
     * @param tags
     */
    convertTags(tags) {
        // item.tags is an object with tag values that may be arrays
        this.tagKeys = Object.keys(tags);

        this.tags = {};
        this.tagKeys.forEach(key => {
            const value = tags[key];
            if (Array.isArray(value)) {
                this.tags[key] = value[0];
            } else {
                this.tags[key] = value;
            }
        });
    }
    
    itemSelected(type) {
        // de-select other types
        types.filter(prop => prop !== type).forEach(name => {
            delete this[name];
        });
        
        switch(type) {
        case 'watchList':
            this.selected = this.watchList;
            break;
        case 'deviceName':
            this.createDeviceNameWatchList();
            break;
        case 'dataSource':
            this.createDataSourceWatchList();
            break;
        case 'tags':
            this.createTagsWatchList();
            break;
        }
        
        this.setViewValue();
    }

    createDeviceNameWatchList() {
        const query = new this.maRqlBuilder()
            .eq('deviceName', this.deviceName)
            .sort('name')
            .toString(); // TODO this is a unbounded query

        this.selected = new this.maWatchList({
            type: 'query',
            name: this.maTranslate.trSync('ui.app.deviceNameX', [this.deviceName]),
            query,
            deviceName: this.deviceName
        });
    }
    
    createDataSourceWatchList() {
        const query = new this.maRqlBuilder()
            .eq('dataSourceXid', this.dataSource.xid)
            .sort('name')
            .toString(); // TODO this is a unbounded query

        this.selected = new this.maWatchList({
            type: 'query',
            name: this.maTranslate.trSync('ui.app.dataSourceX', [this.dataSource.name]),
            query,
            dataSource: this.dataSource
        });
    }
    
    createTagsWatchList() {
        const params = this.tagKeys.map((tagKey, i, keys) => {
            const tagValue = this.tags[tagKey];
            if (tagValue) {
                // calculate restrictions in case the user saves this WL then removes the fixed value
                const restrictions = {};
                for (let j = 0; j < i; j++) {
                    const prevKey = keys[j];
                    const prevValue = this.tags[prevKey];
                    if (prevValue != null) {
                        restrictions[prevKey] = prevValue;
                    }
                }

                return {
                    name: tagKey,
                    type: 'tagValue',
                    options: {
                        multiple: Array.isArray(tagValue),
                        fixedValue: tagValue,
                        restrictions,
                        tagKey
                    }
                };
            }
        }).filter(p => p != null);

        // ensures keys are in order and have undefined value for unset tags
        const tags = {};
        this.tagKeys.forEach(k => {
            tags[k] = this.tags[k] != null ? this.tags[k] : undefined;
        });
        
        this.selected = new this.maWatchList({
            type: 'tags',
            name: this.maTranslate.trSync('ui.app.newTagWatchList'),
            params,
            tags
        });
    }

    queryChanged(promise) {
        this.queryPromise = promise;
        promise.finally(() => delete this.queryPromise);
    }

    tagKeysChanged() {
        if (!this.tags) {
            this.tags = {};
        }
        Object.keys(this.tags).forEach(key => {
            if (!this.tagKeys.includes(key)) {
                delete this.tags[key];
            }
        });

        if (Object.keys(this.tags).length) {
            this.itemSelected('tags');
        }
    }

    tagsChanged() {
        if (Object.keys(this.tags).length) {
            this.itemSelected('tags');
        }
    }
}

export default {
    template: pointBrowserTemplate,
    controller: PointBrowserController,
    bindings: {
        listType: '@?',
        loadItem: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    }
};


