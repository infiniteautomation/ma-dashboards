/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

const types = ['watchList', 'deviceName', 'dataSource', 'hierarchy'];

class PointBrowserController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return ['maTranslate', 'maRqlBuilder', 'maWatchList']; }
    constructor(maTranslate, maRqlBuilder, maWatchList) {
        this.maTranslate = maTranslate;
        this.maRqlBuilder = maRqlBuilder;
        this.maWatchList = maWatchList;
        
        this.listType = 'watchList';
        this.filter = null;
    }

    $onInit() {
        this.ngModelCtrl.$render = () => {
            this.listType = 'watchList';
            this.listTypeChanged();
            this.selected = this.ngModelCtrl.$viewValue;
            this.watchList = this.selected;
        };
    }
    
    $onChanges(changes) {
        if (changes.listType) {
            this.listTypeChanged();
        }
    }
    
    listTypeChanged() {
    }
    
    filterChanged() {
        this.nameQuery = this.filter ? {name: this.filter} : null;
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selected);
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
            isNew: true,
            type: 'hierarchy',
            name: this.maTranslate.trSync('ui.app.hierarchyFolderX', [folderName]),
            hierarchyFolders: this.hierarchy
        });
    }
    
    createDeviceNameWatchList() {
        const query = new this.maRqlBuilder()
            .eq('deviceName', this.deviceName)
            .sort('name')
            .limit(1000)
            .toString();

        this.selected = new this.maWatchList({
            isNew: true,
            type: 'query',
            name: this.maTranslate.trSync('ui.app.deviceNameX', [this.deviceName]),
            query
        });
    }
    
    createDataSourceWatchList() {
        const query = new this.maRqlBuilder()
            .eq('dataSourceXid', this.dataSource.xid)
            .sort('name')
            .limit(1000)
            .toString();

        this.selected = new this.maWatchList({
            isNew: true,
            type: 'query',
            name: this.maTranslate.trSync('ui.app.dataSourceX', [this.dataSource.name]),
            query
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
            isNew: true,
            type: 'tags',
            name: this.maTranslate.trSync('ui.app.newTagWatchList'),
            params
        });
    }

    queryChanged(promise) {
        this.queryPromise = promise;
        promise.finally(() => delete this.queryPromise);
    }
}

return {
    templateUrl: require.toUrl('./pointBrowser.html'),
    controller: PointBrowserController,
    bindings: {
        listType: '@?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    }
};

}); // define
