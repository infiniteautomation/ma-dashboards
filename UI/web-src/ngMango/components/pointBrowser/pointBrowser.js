/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import pointBrowserTemplate from './pointBrowser.html';

const types = ['watchList', 'deviceName', 'dataSource', 'hierarchy', 'tags'];

class PointBrowserController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return ['maTranslate', 'maRqlBuilder', 'maWatchList', 'maDataSource', 'maPointHierarchy', '$timeout']; }
    constructor(maTranslate, maRqlBuilder, maWatchList, maDataSource, maPointHierarchy, $timeout) {
        this.maTranslate = maTranslate;
        this.maRqlBuilder = maRqlBuilder;
        this.maWatchList = maWatchList;
        this.maDataSource = maDataSource;
        this.maPointHierarchy = maPointHierarchy;
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
                    this.tags = this.selected.tags;
                } else if (this.selected.type === 'hierarchy' && this.selected.hierarchyFolders) {
                    this.listType = 'hierarchy';
                    this.hierarchy = this.selected.hierarchyFolders;
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
            this.tags = item.tags;
            this.listType = 'tags';
            this.itemSelected('tags');
        } else if (item.hierarchyFolderId) {
            this.listType = 'hierarchy';
            this.maPointHierarchy.get({id: item.hierarchyFolderId, points: false}).$promise.then(folder => {
                const folders = [];
                this.maPointHierarchy.walkHierarchy(folder, function(folder, parent, index) {
                    folders.push(folder);
                });
                this.hierarchy = folders;
                this.itemSelected('hierarchy');
            });
        } else {
            this.listType = 'watchList';
        }
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
        case 'hierarchy':
            this.createHierarchyWatchList();
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
    
    createHierarchyWatchList() {
        const folderName = this.hierarchy.length ? this.hierarchy[0].name : '';
        
        this.selected = new this.maWatchList({
            type: 'hierarchy',
            name: this.maTranslate.trSync('ui.app.hierarchyFolderX', [folderName]),
            hierarchyFolders: this.hierarchy
        });
    }
    
    createDeviceNameWatchList() {
        const query = new this.maRqlBuilder()
            .eq('deviceName', this.deviceName)
            .sort('name')
            .limit(10000)
            .toString();

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
            .limit(10000)
            .toString();

        this.selected = new this.maWatchList({
            type: 'query',
            name: this.maTranslate.trSync('ui.app.dataSourceX', [this.dataSource.name]),
            query,
            dataSource: this.dataSource
        });
    }
    
    createTagsWatchList() {
        const params = Object.keys(this.tags).map(tagKey => {
            const tagValues = this.tags[tagKey];
            if (Array.isArray(tagValues) && tagValues.length) {
                return {
                    name: tagKey,
                    type: 'tagValue',
                    options: {
                        multiple: true,
                        fixedValue: tagValues,
                        restrictions: {},
                        tagKey
                    }
                };
            }
        }).filter(p => p != null);
        
        this.selected = new this.maWatchList({
            type: 'tags',
            name: this.maTranslate.trSync('ui.app.newTagWatchList'),
            params,
            tags: this.tags
        });
    }

    queryChanged(promise) {
        this.queryPromise = promise;
        promise.finally(() => delete this.queryPromise);
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


