/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';

ModulesFactory.$inject = ['$http', '$q'];
function ModulesFactory($http, $q) {
    var modulesUrl = '/rest/v1/modules';
    
    function Modules() {
    }
    
    Modules.getAll = function() {
        return $http({
            method: 'GET',
            url: modulesUrl + '/list',
            headers: {
                'Accept': 'application/json'
            }
        }).then(function(response) {
            return response.data.map(function(module) {
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
            },
            cache: true
        }).then(function(response) {
            return new Module(response.data);
        });
    };
    
    Modules.checkForUpgrades = function() {
        return $http({
            method: 'GET',
            url: modulesUrl + '/upgrades-available'
        }).then(function(response) {
            return response.data;
        });
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
        }).then(function(response) {
            return response.data;
        });
    };
    
    Modules.restart = function() {
        return $http({
            method: 'PUT',
            url: '/rest/v1/server/restart'
        }).then(function(response) {
            return response.data;
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
        }).then(function(response) {
        	angular.extend(this, response.data);
            return this;
        }.bind(this));
    };

    return Modules;
}

return ModulesFactory;

});
