/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';


DateBarFactory.$inject = ['localStorageService', 'MA_ROLLUP_TYPES', '$filter', '$rootScope', '$timeout'];
function DateBarFactory(localStorageService, MA_ROLLUP_TYPES, $filter, $rootScope, $timeout) {
    const localStorageKey = 'dateBarSettings';
    const changeEventName = 'dateBarChange';
    
    const defaults = {
        preset: 'LAST_1_DAYS',
        rollupType: 'POINT_DEFAULT',
        rollupIntervals: 10,
        rollupIntervalPeriod: 'MINUTES',
        autoRollup: true,
        updateIntervals: 10,
        updateIntervalPeriod: 'MINUTES',
        autoUpdate: true,
        expanded: false,
        rollupTypesFilter: {},
        simplifyTolerance: 1
    };

    class DateBar {
        constructor() {
            this.cache = {};
            this.changedProperties = [];
            this.eventScope = $rootScope.$new(true);
            
            this.load();
        }
        
        load() {
            this.data = localStorageService.get(localStorageKey) || angular.copy(defaults);
            return this;
        }
        
        save(changedProperty) {
            this.changedProperties.push(changedProperty);
            
            if (!this.timeoutPromise) {
                this.timeoutPromise = $timeout(() => {
                    localStorageService.set(localStorageKey, this.data);
                    this.notify(changeEventName, this.changedProperties);
                    
                    this.changedProperties = [];
                    delete this.timeoutPromise;
                }, 100, false);
            }
            
            return this;
        }

        set preset(value) {
            this.data.preset = value;
            this.save('preset');
        }

        set rollupType(value) {
            this.data.rollupType = value;
            this.save('rollupType');
        }

        set rollupIntervals(value) {
            this.data.rollupIntervals = value;
            this.save('rollupIntervals');
        }

        set rollupIntervalPeriod(value) {
            this.data.rollupIntervalPeriod = value;
            this.save('rollupIntervalPeriod');
        }

        set autoRollup(value) {
            this.data.autoRollup = value;
            this.save('autoRollup');
        }

        set updateIntervals(value) {
            this.data.updateIntervals = value;
            this.save('updateIntervals');
        }

        set updateIntervalPeriod(value) {
            this.data.updateIntervalPeriod = value;
            this.save('updateIntervalPeriod');
        }

        set autoUpdate(value) {
            this.data.autoUpdate = value;
            this.save('autoUpdate');
        }

        set expanded(value) {
            this.data.expanded = value;
            this.save('expanded');
        }

        set rollupTypesFilter(value) {
            this.data.rollupTypesFilter = value;

            const currentRollupOk = $filter('filter')(MA_ROLLUP_TYPES, value).some(function(rollupType) {
                return rollupType.type === this.data.rollupType;
            }.bind(this));
            
            if (!currentRollupOk) {
                this.data.rollupType = 'POINT_DEFAULT';
            }

            this.save('rollupTypesFilter');
        }

        set from(value) {
            this.cache.from = value;
            this.data.from = value.valueOf();
            this.save('from');
        }

        set to(value) {
            this.cache.to = value;
            this.data.to = value.valueOf();
            this.save('to');
        }

        set simplifyTolerance(value) {
            this.data.simplifyTolerance = value;
            this.save('simplifyTolerance');
        }

        get preset() {
            return this.data.preset;
        }

        get rollupType() {
            return this.data.rollupType;
        }

        get rollupIntervals() {
            return this.data.rollupIntervals;
        }

        get rollupIntervalPeriod() {
            return this.data.rollupIntervalPeriod;
        }

        get autoRollup() {
            return this.data.autoRollup;
        }

        get updateIntervals() {
            return this.data.updateIntervals;
        }

        get updateIntervalPeriod() {
            return this.data.updateIntervalPeriod;
        }

        get autoUpdate() {
            return this.data.autoUpdate;
        }

        get expanded() {
            return this.data.expanded;
        }

        get rollupTypesFilter() {
            return this.data.rollupTypesFilter;
        }

        get from() {
            if (!this.cache.from) {
                if (!this.data.from) return;
                this.cache.from = new Date(this.data.from);
            }
            return this.cache.from;
        }

        get to() {
            if (!this.cache.to) {
                if (!this.data.to) return;
                this.cache.to = new Date(this.data.to);
            }
            return this.cache.to;
        }

        get simplifyTolerance() {
            return this.data.simplifyTolerance;
        }
        
        subscribe(handler, $scope, eventName = changeEventName) {
            let wrappedHandler = handler;
            if ($scope) {
                wrappedHandler = (...args) => {
                    $scope.$applyAsync(() => {
                        handler(...args);
                    });
                };
            }

            const deregisterListener = this.eventScope.$on(eventName, wrappedHandler);
            const deregisterDestroy = $scope && $scope.$on('$destroy', deregisterListener);
            
            const manualDeregister = () => {
                if (deregisterDestroy) {
                    deregisterDestroy();
                }
                deregisterListener();
            };
            
            return manualDeregister;
        }
        
        notify(eventName, ...args) {
            this.eventScope.$broadcast(eventName, ...args);
        }
    }

    return new DateBar();
}
export default DateBarFactory;


