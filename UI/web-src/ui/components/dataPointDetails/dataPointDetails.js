/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 * @author Jared Wiltshire
 */

import angular from 'angular';
import dataPointDetailsTemplate from './dataPointDetails.html';
import './dataPointDetails.css';

class DataPointDetailsController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$stateParams', '$state', 'localStorageService', 'maPointHierarchy', 'maUiDateBar', 'maUser', 'maPoint', '$scope']; }
    
    constructor($stateParams, $state, localStorageService, PointHierarchy, maUiDateBar, User, Point, $scope) {
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.localStorageService = localStorageService;
        this.PointHierarchy = PointHierarchy;
        this.dateBar = maUiDateBar;
        this.User = User;
        this.Point = Point;
        this.$scope = $scope;
        
        this.chartType = 'smoothedLine';
    }

    $onInit() {
        const $stateParams = this.$stateParams;
        
        if ($stateParams.pointXid) {
            this.getPointByXid($stateParams.pointXid);
        } else if ($stateParams.pointId) {
            this.getPointById($stateParams.pointId);
        } else {
            // Attempt load pointXid from local storage
            const storedPoint = this.localStorageService.get('lastDataPointDetailsItem');
            if (storedPoint && storedPoint.xid) {
                this.getPointByXid(storedPoint.xid);
            }
        }
        
        this.retrievePreferences();

        this.deregister = this.Point.notificationManager.subscribe((event, point) => {
            if (this.dataPoint && this.dataPoint.id === point.id) {
                this.$scope.$apply(() => {
                    if (event.name === 'update') {
                        Object.assign(this.dataPoint, point);
                        this.pointUpdated();
                    } else if (event.name === 'delete') {
                        this.dataPoint = null;
                        this.pointChanged();
                    }
                });
            }
        });
    }

    $onDestroy() {
        this.deregister();
    }
    
    getPointByXid(xid) {
        this.Point.get({xid}).$promise.then(dp => {
            if (this.$stateParams.edit) {
                this.editTarget = dp;
                this.showEditDialog = {};
            }
            this.dataPoint = dp;
            this.pointChanged();
        });
    }
    
    getPointById(id) {
        this.Point.getById({id}).$promise.then(dp => {
            if (this.$stateParams.edit) {
                this.editTarget = dp;
                this.showEditDialog = {};
            }
            this.dataPoint = dp;
            this.pointChanged();
        });
    }

    pointChanged() {
        delete this.eventDetectors;
        delete this.pointValues;
        delete this.realtimePointValues;
        delete this.statsObj;
        
        if (!this.dataPoint) {
            this.$state.go('.', {pointXid: null}, {location: 'replace', notify: false});
            this.localStorageService.set('lastDataPointDetailsItem', {xid: null});
            this.path = [];
            return;
        }

        this.pointUpdated();
    }
    
    pointUpdated() {
        const xid = this.dataPoint.xid;

        this.$state.go('.', {pointXid: xid}, {location: 'replace', notify: false});
        this.localStorageService.set('lastDataPointDetailsItem', {xid});
        
        this.PointHierarchy.pathByXid({xid}).$promise.then(response => {
            this.path = response;
        });
        
        const pointType = this.dataPoint.pointLocator.dataType;
        this.dateBar.rollupTypesFilter = pointType === 'NUMERIC' ? {} : { nonNumeric: true };

        this.chartType = this.dataPoint.amChartsGraphType();
    }

    updatePreferences() {
        const preferences = this.localStorageService.get('uiPreferences') || {};
        preferences.numberOfPointValues = this.numValues;
        preferences.realtimeMode = this.realtimeMode;
        preferences.showCachedData = this.showCachedData;
        this.localStorageService.set('uiPreferences', preferences);
    }
    
    retrievePreferences() {
        const defaults = {
            numberOfPointValues: 100,
            realtimeMode: true,
            showCachedData: false
        };
        const preferences = angular.merge(defaults, this.localStorageService.get('uiPreferences'));
        this.numValues = preferences.numberOfPointValues;
        this.realtimeMode = preferences.realtimeMode;
        this.showCachedData = preferences.showCachedData;
    }
}

export default {
    controller: DataPointDetailsController,
    template: dataPointDetailsTemplate
};

