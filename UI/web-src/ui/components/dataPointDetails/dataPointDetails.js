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
    static get $inject() { return ['$stateParams', '$state', 'localStorageService', 'maPointHierarchy', 'maUiDateBar', 'maUser', 'maPoint',
        '$scope', 'maEventDetector']; }
    
    constructor($stateParams, $state, localStorageService, PointHierarchy, maUiDateBar, User, Point,
            $scope, EventDetector) {
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.localStorageService = localStorageService;
        this.PointHierarchy = PointHierarchy;
        this.dateBar = maUiDateBar;
        this.User = User;
        this.Point = Point;
        this.$scope = $scope;
        this.EventDetector = EventDetector;
        
        this.chartType = 'smoothedLine';
    }

    $onInit() {
        const $stateParams = this.$stateParams;
        
        if ($stateParams.detectorId) {
            this.getPointByDetectorId($stateParams.detectorId);
        } else if ($stateParams.detectorXid) {
            this.getPointByDetectorXid($stateParams.detectorXid);
        } else if ($stateParams.pointXid) {
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
        return this.Point.get({xid}).$promise.then(dp => {
            if (this.$stateParams.edit) {
                this.editTarget = dp;
                this.showEditDialog = {};
            }
            this.dataPoint = dp;
            this.pointChanged();
        });
    }

    getPointById(id) {
        return this.Point.getById({id}).$promise.then(dp => {
            if (this.$stateParams.edit) {
                this.editTarget = dp;
                this.showEditDialog = {};
            }
            this.dataPoint = dp;
            this.pointChanged();
        });
    }
    
    getPointByDetectorId(id) {
        return this.EventDetector.getById(id).then(detector => {
            this.getPointById(detector.sourceId).then(() => {
                this.openDetectorDialog(detector);
            });
        });
    }
    
    getPointByDetectorXid(xid) {
        return this.EventDetector.get(xid).then(detector => {
            this.getPointById(detector.sourceId).then(() => {
                this.openDetectorDialog(detector);
            });
        });
    }

    pointChanged() {
        delete this.eventDetector;
        delete this.eventDetectors;
        delete this.pointValues;
        delete this.realtimePointValues;
        delete this.statsObj;
        
        if (!this.dataPoint) {
            this.$state.params.pointXid = null;
            this.stateGo();
            this.localStorageService.set('lastDataPointDetailsItem', {xid: null});
            this.path = [];
            return;
        }

        this.pointUpdated();
    }
    
    pointUpdated() {
        const xid = this.dataPoint.xid;

        this.$state.params.pointId = null;
        this.$state.params.pointXid = xid;
        this.stateGo();
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
    
    openDetectorDialog(detector) {
        this.showDetectorDialog = {};
        this.eventDetector = detector || this.eventDetectors[0] || this.EventDetector.forDataPoint(this.dataPoint);
        this.$state.params.detectorId = null;
        this.$state.params.detectorXid = this.eventDetector.getOriginalId() || null;
        this.stateGo();
    }
    
    detectorDialogClosed() {
        delete this.eventDetector;
        this.$state.params.detectorId = null;
        this.$state.params.detectorXid = null;
        this.stateGo();
    }
    
    openEditDialog(target) {
        this.editTarget = target;
        this.$state.params.edit = true;
        this.stateGo();
        this.showEditDialog = {};
    }
    
    editDialogClosed() {
        this.editTarget = null;
        this.$state.params.edit = null;
        this.stateGo();
    }
    
    detectorChanged() {
        this.$state.params.detectorId = null;
        this.$state.params.detectorXid = this.eventDetector && !this.eventDetector.isNew() && this.eventDetector.xid || null;
        this.stateGo();
    }
    
    stateGo() {
        this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
    }
}

export default {
    controller: DataPointDetailsController,
    template: dataPointDetailsTemplate
};

