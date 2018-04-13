/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */
import angular from 'angular';


ImportExportFactory.$inject = ['$http', '$q', '$timeout', 'maUtil'];
function ImportExportFactory($http, $q, $timeout, Util) {
    var importExportUrl = '/rest/v2/json-emport';
    
    function ImportStatus(location) {
        this.location = location;
    }
    
    ImportStatus.prototype.getStatus = function() {
        return $http({
            method: 'GET',
            url: this.location,
            headers: {
                'Accept': 'application/json'
            },
            cache: false
        }).then(function(response) {
            angular.extend(this, response.data);
            return this;
        }.bind(this));
    };
    
    ImportStatus.prototype.cancel = function() {
        return $http({
            method: 'PUT',
            data: {cancel: true},
            url: this.location,
            headers: {
                'Accept': 'application/json'
            },
            cache: false
        }).then(function(response) {
            angular.extend(this, response.data);
            return this;
        }.bind(this));
    };
    
    function ImportExport() {
    }
    
    ImportExport.list = function() {
        return $http({
            method: 'GET',
            url: importExportUrl + '/list',
            headers: {
                'Accept': 'application/json'
            },
            cache: true
        }).then(function(response) {
            return response.data;
        });
    };
    
    ImportExport.exportSections = function(sections, options) {
        try {
            if (!options) options = {};
            if (!Array.isArray(sections)) throw new Error('Requires sections parameter');

            var canceler = $q.defer();
            var cancelOrTimeout = Util.cancelOrTimeout(canceler.promise, options.timeout);

            return $http.get(importExportUrl, {
                timeout: cancelOrTimeout,
                params: {
                    exportElements: sections
                },
                headers: {
                    'Accept': 'application/json'
                },
                cache: false,
                responseType: options.responseType
            }).then(function(response) {
                return response.data;
            }).setCancel(canceler.resolve);
        } catch (error) {
            return $q.reject(error);
        }
    };

    ImportExport.importData = function(data, options) {
        try {
            if (!options) options = {};
            
            var canceler = $q.defer();
            var cancelOrTimeout = Util.cancelOrTimeout(canceler.promise, options.timeout);
        
            return $http({
                method: 'POST',
                url: importExportUrl,
                timeout: cancelOrTimeout,
                data: data,
                headers: {
                    'Accept': 'application/json'
                },
                cache: false,
                responseType: options.responseType
            }).then(function(response) {
                return new ImportStatus(response.headers('Location'));
            }).setCancel(canceler.resolve);
        } catch (error) {
            return $q.reject(error);
        }
    };

    return ImportExport;
}

export default ImportExportFactory;


