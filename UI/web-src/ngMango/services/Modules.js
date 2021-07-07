/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */
import angular from 'angular';

ModulesFactory.$inject = ['$http', '$q', 'maServer', 'maNotificationManager', 'maSystemStatus', '$rootScope',
    '$interval', '$timeout', 'MA_TIMEOUTS'];
function ModulesFactory($http, $q, maServer, NotificationManager, maSystemStatus, $rootScope,
                        $interval, $timeout, MA_TIMEOUTS) {
    const modulesUrl = '/rest/latest/modules';
    const availableUpgradesMonitorId = 'com.serotonin.m2m2.rt.maint.UpgradeCheck.COUNT';
    let availableUpgrades = null;
    let availableUpgradesIntervalPromise = null;
    let availableUpgradesTimeoutPromise = null;
    
    const setAvailableUpgrades = function (upgrades) {
        if (upgrades !== availableUpgrades) {
            $rootScope.$broadcast('maAvailableUpgrades', {
                current: upgrades,
                previous: availableUpgrades
            });
        }
        
        availableUpgrades = upgrades;
    };

    class Module {
        constructor(options) {
            angular.extend(this, options);
        }
        
        $delete(setDeleted) {
            return $http({
                method: 'PUT',
                url: modulesUrl + '/deletion-state/' + encodeURIComponent(this.name),
                params: {
                    'delete': setDeleted == null ? true : !!setDeleted
                }
            }).then(response => {
                angular.extend(this, response.data);
                return this;
            });
        }
    }

    // Mango API should return in less than 60s
    // Mango HTTP client that talks to the store has a timeout of 30s and retries once 
    const storeTimeout = 30000 * 2 + 10000;
    
    const Modules = {};
    
    Modules.notificationManager = new NotificationManager({
        webSocketUrl: '/rest/latest/websocket/modules',
        transformObject: (object) => {
            return new Module(object);
        }
    });
    
    Modules.getAll = function() {
        return $http({
            method: 'GET',
            url: modulesUrl + '/list',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            return response.data.map(module => {
                return new Module(module);
            });
        });
    };

    Modules.getCore = function() {
        return $http({
            method: 'GET',
            url: modulesUrl + '/core',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            return new Module(response.data);
        });
    };
    
    Modules.getUpdateLicensePayload = function() {
        return $http({
            method: 'GET',
            url: modulesUrl + '/update-license-payload'
        }).then(response => response.data);
    };
    
    Modules.downloadLicense = function(username, password) {
        return $http({
            method: 'PUT',
            url: modulesUrl + '/download-license',
            data: {
                username: username,
                password: password
            },
            timeout: storeTimeout
        });
    };
    
    Modules.checkForUpgrades = function() {
        return $http({
            method: 'GET',
            url: modulesUrl + '/upgrades-available',
            timeout: storeTimeout
        }).then(response => {
            setAvailableUpgrades(response.data.upgrades.length);
            return response.data;
        });
    };
    
    Modules.doUpgrade = function(selectedInstalls, selectedUpgrades, backupBeforeDownload, restartAfterDownload) {
        const data = {
            newInstalls: selectedInstalls,
            upgrades: selectedUpgrades
        };
        
        return $http({
            method: 'POST',
            data: data,
            url: modulesUrl + '/upgrade',
            params: {
                backup: backupBeforeDownload,
                restart: restartAfterDownload
            }
        }).then(response => response.data);
    };
    
    Modules.restart = function() {
        return maServer.restart();
    };
    
    Modules.zipMimeTypes = ['application/zip', 'application/x-zip-compressed'];

    Modules.uploadZipFiles = function(files, restart = false, timeout = MA_TIMEOUTS.moduleUpload) {
        return $q.resolve().then(() => {
            const formData = new FormData();
            
            Array.from(files)
                .filter(file => this.zipMimeTypes.includes(file.type) || file.name.endsWith('.zip'))
                .forEach(file => formData.append('files[]', file));

            return $http({
                method: 'POST',
                url: modulesUrl + '/upload-upgrades',
                data: formData,
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                },
                params: {
                    restart
                },
                timeout
            }).then(response => response.data);
        });
    };
    
    Modules.availableUpgrades = function() {
        return availableUpgrades;
    };
    
    Modules.checkAvailableUpgrades = function() {
        return maSystemStatus.getInternalMetric(availableUpgradesMonitorId).then(response => {
            setAvailableUpgrades(response.data.value);
            return response.data.value;
        });
    };
    
    Modules.availableUpgradeCheckRunning = function() {
        return !!availableUpgradesIntervalPromise;
    };
    
    Modules.startAvailableUpgradeCheck = function(checkInterval = 60 * 60 * 1000, initialCheckDelay = 10000) {
        this.cancelAvailableUpgradeCheck();
        
        availableUpgradesTimeoutPromise = $timeout(() => {
            this.checkAvailableUpgrades().then(null, error => null);
        }, initialCheckDelay, false);
        
        availableUpgradesIntervalPromise = $interval(() => {
            this.checkAvailableUpgrades().then(null, error => null);
        }, checkInterval, 0, false);
    };
    
    Modules.cancelAvailableUpgradeCheck = function() {
        if (availableUpgradesTimeoutPromise != null) {
            $timeout.cancel(availableUpgradesTimeoutPromise);
            availableUpgradesTimeoutPromise = null;
        }
        if (availableUpgradesIntervalPromise != null) {
            $interval.cancel(availableUpgradesIntervalPromise);
            availableUpgradesIntervalPromise = null;
        }
    };

    return Object.freeze(Modules);
}

export default ModulesFactory;
