/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */
import angular from 'angular';


ModulesFactory.$inject = ['$http', '$q', 'maServer', 'maNotificationManager'];
function ModulesFactory($http, $q, maServer, NotificationManager) {
    const modulesUrl = '/rest/v1/modules';
    
    // Mango API should return in less than 60s
    // Mango HTTP client that talks to the store has a timeout of 30s and retries once 
    const storeTimeout = 30000 * 2 + 10000;
    
    function Modules() {
    }
    
    Modules.notificationManager = new NotificationManager({
        webSocketUrl: '/rest/v1/websocket/modules',
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
        }).then(response => response.data);
    };
    
    Modules.doUpgrade = function(selectedInstalls, selectedUpgrades, backupBeforeDownload, restartAfterDownload) {
    	var data = {
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

    Modules.uploadZipFiles = function(files) {
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
            }).then(response => response.data);
        });
    };
    
    function Module(options) {
    	angular.extend(this, options);
    }
    
    Module.prototype.$delete = function(setDeleted) {
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
    };

    return Modules;
}

export default ModulesFactory;


