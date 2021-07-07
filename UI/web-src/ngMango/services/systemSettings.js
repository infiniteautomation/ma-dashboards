/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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

    this.$get = SystemSettingsFactory;

    SystemSettingsFactory.$inject = ['$http'];
    function SystemSettingsFactory($http) {
        const systemSettingsUrl = '/rest/latest/system-settings';
        
        class SystemSettings {
            constructor(key, type, value) {
                this.key = key;
                this.type = type;
                
                if (value != null) {
                    this.value = value;
                }
            }
            
            static getSections() {
                return sections;
            }
            
            static getSystemAlarmLevelSettings() {
                return systemAlarmLevelSettings;
            }
            
            static getAuditAlarmLevelSettings() {
                return auditAlarmLevelSettings;
            }
            
            static getValues() {
                return $http({
                    method: 'GET',
                    url: systemSettingsUrl,
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then((response) => {
                    return response.data;
                });
            }
            
            static setValues(values) {
                return $http({
                    method: 'POST',
                    url: systemSettingsUrl,
                    headers: {
                        'Accept': 'application/json'
                    },
                    data: values
                }).then((response) => {
                    return response.data;
                });
            }

            getValue(type) {
                return $http({
                    method: 'GET',
                    url: systemSettingsUrl + '/' + encodeURIComponent(this.key),
                    params: {
                        type: type || this.type
                    },
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then((response) => {
                    this.value = response.data;
                    return this.value;
                });
            }
            
            setValue(value, type) {
                value = angular.toJson(value || this.value);
                return $http({
                    method: 'PUT',
                    url: systemSettingsUrl + '/' + encodeURIComponent(this.key),
                    params: {
                        type: type || this.type
                    },
                    headers: {
                        'Accept': 'application/json'
                    },
                    data: value
                }).then((response) => {
                    this.value = response.data;
                    return this.value;
                });
            }
        }

        return SystemSettings;
    }
}

export default SystemSettingsProvider;
