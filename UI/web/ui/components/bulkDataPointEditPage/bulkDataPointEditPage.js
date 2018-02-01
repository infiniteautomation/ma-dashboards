/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

class BulkDataPointEditPageController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return ['maPoint', 'maDataPointTags']; }
    constructor(maPoint, maDataPointTags) {
        this.maPoint = maPoint;
        this.maDataPointTags = maDataPointTags;
        
        this.numberOfRows = 25;
        this.pageNumber = 1;
        this.tableOrder = 'name';

        this.columns = [
            {name: 'deviceName', label: 'Device'},
            {name: 'name', label: 'Name'},
            {name: 'readPermission', label: 'Read permission'},
            {name: 'setPermission', label: 'Set permission'},
            {name: 'unit', label: 'Unit'},
            {name: 'chartColour', label: 'Chart color'},
            {name: 'plotType', label: 'Plot type'},
            {name: 'rollup', label: 'Rollup type'},
            {name: 'templateXid', label: 'Template XID'}
        ];
        this.selectedColumns = this.columns.slice();
        this.availableTagsByKey = {};
        this.availableTags = [];
        this.selectedTags = [];

        this.selectedPointsChangedBound = (...args) => {
            this.selectedPointsChanged(...args);
        };
        
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
        this.maDataPointTags.keys().then(keys => {
            keys.forEach(tagKey => this.addTagToAvailable(tagKey));
        });
    }
    
    $onChanges(changes) {
    }
    
    addTagToAvailable(tagKey) {
        if (tagKey === 'device' || tagKey === 'name' || this.availableTagsByKey[tagKey]) return;
        
        const option = {
            name: tagKey,
            label: `Tag '${tagKey}'`
        };
        
        this.availableTags.push(option);
        this.availableTagsByKey[tagKey] = option;
        
        return option;
    }
    
    start(event) {
        this.results = [];
        
        const body = angular.copy(this.updateBody);
        if (!Object.keys(body.tags).length) {
            delete body.tags;
            delete body.mergeTags;
        }
        
        this.bulkTask = new this.maPoint.bulk({
            action: 'UPDATE',
            body,
            requests: this.selectedPoints.map(pt => ({xid: pt.xid}))
        });
        
        this.bulkTaskPromise = this.bulkTask.start().then(resource => {
            this.results = resource.result.responses;
            this.results.forEach((result, i) => {
                if (result.body) {
                    angular.copy(result.body, this.selectedPoints[i]);
                }
            });
            this.reset();
            //resource.delete();
        }, error => {
            console.error(error);
        }, resource => {
            if (!resource.result || !resource.result.responses) return;
            
            this.results = resource.result.responses;
            this.results.forEach((result, i) => {
                if (result.body) {
                    angular.copy(result.body, this.selectedPoints[i]);
                }
            });
        }).finally(() => {
            delete this.bulkTaskPromise;
        });
    }

    watchListChanged() {
        if (!this.watchList) return;
        this.reset();
        this.pointsPromise = this.watchList.getPoints().then(points => {
            this.points = points;
            
            const seenTagKeys = {};
            this.points.forEach(pt => {
                Object.keys(pt.tags).forEach(key => {
                    seenTagKeys[key] = true;
                });
            });
            
            this.selectedTags = Object.keys(seenTagKeys).map(tagKey => {
                return this.availableTagsByKey[tagKey];
            });
            
        }, () => {
            // TODO toast error
            this.points = [];
        }).finally(() => {
            delete this.pointsPromise;
        });
    }
    
    addTagColumn() {
        const tagKey = this.tagColumnToAdd;
        delete this.tagColumnToAdd;

        const newOption = this.addTagToAvailable(tagKey);
        if (!newOption) {
            return;
        }
        this.selectedTags.push(newOption);
    }
    
    selectedPointsChanged() {
        if (this.selectedPoints.length === this.points.length) {
            this.selectAll = true;
            this.selectAllIndeterminate = false;
        } else {
            this.selectAll = false;
            this.selectAllIndeterminate = !!this.selectedPoints.length;
        }
    }
    
    selectAllChanged() {
        if (this.selectAllIndeterminate) {
            this.selectAll = false;
            this.selectedPoints = [];
        } else {
            this.selectedPoints = this.selectAll ? this.points.slice() : [];
        }
        
        this.selectAllIndeterminate = false;
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
    
    columnModified(column, point) {
        return this.selectedPoints.includes(point) && this.updateBody.hasOwnProperty(column.name);
    }
    
    tagModified(tag, point) {
        return this.selectedPoints.includes(point) && this.updateBody.tags.hasOwnProperty(tag.name);
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
            return point.tags[tag.name];
        }
    }
}

return {
    templateUrl: require.toUrl('./bulkDataPointEditPage.html'),
    controller: BulkDataPointEditPageController,
    bindings: {
    },
    require: {
    }
};

}); // define
