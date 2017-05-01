/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';

SystemSettingsProvider.$inject = [];
function SystemSettingsProvider() {
    var sections = [];

    this.addSection = function(section) {
        sections.push(section);
    };
    
    this.addSections = function(toAdd) {
        Array.prototype.push.apply(sections, toAdd);
    };

    this.$get = SystemSettingsFactory.bind(null, sections);
    this.$get.$inject = SystemSettingsFactory.$inject;
}

SystemSettingsFactory.$inject = ['$http'];
function SystemSettingsFactory(sections, $http) {
    var systemSettingsUrl = '/rest/v1/system-settings';
    
    function SystemSettings(key, type) {
        this.key = key;
        this.type = type;
    }
    
    SystemSettings.getSections = function() {
        return sections;
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
        var $this = this;
        return $http({
            method: 'PUT',
            url: systemSettingsUrl,
            headers: {
                'Accept': 'application/json'
            },
            data: value
        }).then(function(response) {
            return response.data;
        });
    };

    SystemSettings.prototype.getValue = function getSystemSetting(type) {
        var $this = this;

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
        var $this = this;
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

    return SystemSettings;
}

return SystemSettingsProvider;

});
