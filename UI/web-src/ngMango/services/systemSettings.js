/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */
import angular from 'angular';

SystemSettingsProvider.$inject = [];
function SystemSettingsProvider() {
    const sections = [];
    const systemAlarmLevelSettings = [];
    const auditAlarmLevelSettings = [];

    this.addSection = function(section) {
        sections.push(section);
    };
    
    this.addSections = function(toAdd) {
        Array.prototype.push.apply(sections, toAdd);
    };
    
    this.addSystemAlarmLevelSetting = function(item) {
        systemAlarmLevelSettings.push(item);
    };
    
    this.addSystemAlarmLevelSettings = function(items) {
        Array.prototype.push.apply(systemAlarmLevelSettings, items);
    };
    
    this.addAuditAlarmLevelSetting = function(item) {
        auditAlarmLevelSettings.push(item);
    };
    
    this.addAuditAlarmLevelSettings = function(items) {
        Array.prototype.push.apply(auditAlarmLevelSettings, items);
    };

    this.$get = SystemSettingsFactory.bind(null, sections, systemAlarmLevelSettings, auditAlarmLevelSettings);
    this.$get.$inject = SystemSettingsFactory.$inject;
}

SystemSettingsFactory.$inject = ['$http'];
function SystemSettingsFactory(sections, systemAlarmLevelSettings, auditAlarmLevelSettings, $http) {
    const systemSettingsUrl = '/rest/v1/system-settings';
    const permissionsUrl = '/rest/v2/permissions';
    
    function SystemSettings(key, type, value) {
        this.key = key;
        this.type = type;
        
        if (value != null) {
            this.value = value;
        }
    }
    
    SystemSettings.getSections = function() {
        return sections;
    };
    
    SystemSettings.getSystemAlarmLevelSettings = function() {
        return systemAlarmLevelSettings;
    };
    
    SystemSettings.getAuditAlarmLevelSettings = function() {
        return auditAlarmLevelSettings;
    };
    
    SystemSettings.getValues = function() {
        return $http({
            method: 'GET',
            url: systemSettingsUrl,
            headers: {
                'Accept': 'application/json'
            }
        }).then(function(response) {
            return response.data;
        });
    };
    
    SystemSettings.setValues = function(values) {
        return $http({
            method: 'POST',
            url: systemSettingsUrl,
            headers: {
                'Accept': 'application/json'
            },
            data: values
        }).then(function(response) {
            return response.data;
        });
    };

    SystemSettings.prototype.getValue = function getSystemSetting(type) {
        const $this = this;

        return $http({
            method: 'GET',
            url: systemSettingsUrl + '/' + this.key,
            params: {
                type: type || this.type
            },
            headers: {
                'Accept': 'application/json'
            }
        }).then(function(response) {
            $this.value = response.data;
            return $this.value;
        });
    };
    
    SystemSettings.prototype.setValue = function setSystemSetting(value, type) {
        const $this = this;
        value = angular.toJson(value || this.value);
        return $http({
            method: 'PUT',
            url: systemSettingsUrl + '/' + this.key,
            params: {
                type: type || this.type
            },
            headers: {
                'Accept': 'application/json'
            },
            data: value
        }).then(function(response) {
            $this.value = response.data;
            return $this.value;
        });
    };
    
    SystemSettings.listPermissions = function() {
    	return $http({
            method: 'GET',
            url: permissionsUrl
        }).then(function(response) {
            return response.data;
        });
    };

    return SystemSettings;
}

export default SystemSettingsProvider;


