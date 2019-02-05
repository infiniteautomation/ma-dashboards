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
    static get $inject() { return ['$stateParams', '$state', 'localStorageService', 'maPointHierarchy', 'maUiDateBar', 'maUser']; }
    
    constructor($stateParams, $state, localStorageService, PointHierarchy, maUiDateBar, User) {
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.localStorageService = localStorageService;
        this.PointHierarchy = PointHierarchy;
        this.dateBar = maUiDateBar;
        this.User = User;
        
        this.chartType = 'smoothedLine';
    }

    $onInit() {
        const $stateParams = this.$stateParams;
        
        if ($stateParams.pointXid) {
            this.pointXid = $stateParams.pointXid;
        } else if ($stateParams.pointId) {
            this.pointId = $stateParams.pointId;
        } else {
            // Attempt load pointXid from local storage
            const storedPoint = this.localStorageService.get('lastDataPointDetailsItem');
            if (storedPoint) {
                this.pointXid = storedPoint.xid;
            }
        }
        
        this.retrievePreferences();
    }

    pointChanged(point) {
        delete this.eventDetector;
        if (!point) return;

        if (this.dataPoint && this.dataPoint.id !== point.id) {
            delete this.pointValues;
            delete this.realtimePointValues;
        }
        
        this.dataPoint = point;
        this.pointUpdated();
    }
    
    pointUpdated() {
        const xid = this.dataPoint.xid;

        this.$state.go('.', {pointXid: xid}, {location: 'replace', notify: false});
        
        this.localStorageService.set('lastDataPointDetailsItem', {
            xid: xid
        });
        
        this.PointHierarchy.pathByXid({xid: xid}).$promise.then(function(response) {
            this.path = response;
        }.bind(this));
        
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

