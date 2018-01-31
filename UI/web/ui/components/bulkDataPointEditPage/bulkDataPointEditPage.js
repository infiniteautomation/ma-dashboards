/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

class BulkDataPointEditPageController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return ['maPoint', '$timeout', '$scope']; }
    constructor(maPoint, $timeout, $scope) {
        this.maPoint = maPoint;
        this.$timeout = $timeout;
        this.$scope = $scope;
        
        this.selectedPoints = [];
        this.numberOfRows = 25;
        this.pageNumber = 1;
        this.tableOrder = 'name';
        this.selectDisabled = false;
        this.selectAll = false;
        this.selectAllIndeterminate = false;
        
        this.selectedPointsChangedBound = (...args) => {
            this.selectedPointsChanged(...args);
        };
    }
    
    $onInit() {
    }
    
    $onChanges(changes) {
    }
    
    start(event) {
        this.results = [];
        
        this.bulkTask = new this.maPoint.bulk({
            action: 'UPDATE',
            body: {
                setPermission: this.setPermission
            },
            requests: this.selectedPoints.map(pt => {
                return {xid: pt.xid};
            })
        });
        
        this.bulkTaskPromise = this.bulkTask.start().then(resource => {
            this.results = resource.result.responses;
            this.results.forEach((result, i) => {
                if (result.body) {
                    angular.copy(result.body, this.points[i]);
                }
            });
        }, error => {
            console.error(error);
        }, resource => {
            if (!resource.result || !resource.result.responses) return;
            
            this.results = resource.result.responses;
            this.results.forEach((result, i) => {
                if (result.body) {
                    angular.copy(result.body, this.points[i]);
                }
            });
        }).finally(() => {
            delete this.bulkTaskPromise;
        });
    }
    
    watchListChanged() {
        if (!this.watchList) return;
        
        this.selectedPoints = [];
        this.selectAll = false;
        this.selectAllIndeterminate = false;

        this.pointsPromise = this.watchList.getPoints().then(points => {
            this.points = points;
        }, () => {
            // TODO toast error
            this.points = [];
        }).finally(() => {
            delete this.pointsPromise;
        });
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
