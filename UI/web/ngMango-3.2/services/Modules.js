/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';

ModulesFactory.$inject = ['$http'];
function ModulesFactory($http) {
    var modulesUrl = '/rest/v1/modules';
    
    function Modules() {
    }
    
    Modules.getAll = function() {
        return $http({
            method: 'GET',
            url: modulesUrl + '/list',
            headers: {
                'Accept': 'application/json'
            },
            cache: true
        }).then(function(response) {
            return response.data;
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
            return response.data;
        });
    };

    return Modules;
}

return ModulesFactory;

});
