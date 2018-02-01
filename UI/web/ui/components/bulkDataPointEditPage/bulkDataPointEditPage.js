/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

class BulkDataPointEditPageController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return ['maPoint', '$timeout', '$scope', 'maDataPointTags']; }
    constructor(maPoint, $timeout, $scope, maDataPointTags) {
        this.maPoint = maPoint;
        this.$timeout = $timeout;
        this.$scope = $scope;
        this.maDataPointTags = maDataPointTags;
        
        this.numberOfRows = 25;
        this.pageNumber = 1;
        this.tableOrder = 'name';

        this.columns = [
            {name: 'xid', label: 'XID', sortable: true, disabled: true},
            {name: 'deviceName', label: 'Device', sortable: true, disabled: true},
            {name: 'name', label: 'Name', sortable: true, disabled: true},
            {name: 'readPermission', label: 'Read permission', sortable: true},
            {name: 'setPermission', label: 'Set permission', sortable: true},
            {name: 'unit', label: 'Unit', sortable: true},
            {name: 'chartColor', label: 'Chart color', sortable: true},
            {name: 'plotType', label: 'Plot type', sortable: true},
            {name: 'rollup', label: 'Rollup type', sortable: true},
            {name: 'templateXid', label: 'Template XID', sortable: true}
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
        this.updateBody = null;
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
        
        this.bulkTask = new this.maPoint.bulk({
            action: 'UPDATE',
            body: this.updateBody,
            requests: this.selectedPoints.map(pt => {
                return {xid: pt.xid};
            })
        });
        
        this.bulkTaskPromise = this.bulkTask.start().then(resource => {
            this.results = resource.result.responses;
            this.results.forEach((result, i) => {
                if (result.body) {
                    angular.copy(result.body, this.selectedPoints[i]);
                }
            });
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
        if (this.selectedPointsTimeout) return;
        
        this.selectedPointsTimeout = this.$timeout(() => {
            delete this.selectedPointsTimeout;
            this.$scope.$apply(() => {
                if (this.selectedPoints.length === this.points.length) {
                    this.selectAll = true;
                    this.selectAllIndeterminate = false;
                } else {
                    this.selectAll = false;
                    this.selectAllIndeterminate = !!this.selectedPoints.length;
                }
            });
        }, 100, false);
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
    
    setTag(tag) {
        if (!this.updateBody) this.updateBody = {};
        if (!this.updateBody.tags) this.updateBody.tags = {};
        this.updateBody.tags[tag.name] = this.tagVal;
    }
    
    removeTag(tag) {
        if (!this.updateBody) this.updateBody = {};
        if (!this.updateBody.tags) this.updateBody.tags = {};
        delete this.updateBody.tags[tag.name];
    }
    
    setSetPermission() {
        if (!this.updateBody) this.updateBody = {};
        this.updateBody.setPermission = this.setPermission;
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
