/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

ServerFactory.$inject = ['$http', '$q'];
function ServerFactory($http, $q) {
    var serverUrl = '/rest/v2/server';
    
    function Server() {
    }
    
    Server.prototype.restart = function() {
        return $http({
            method: 'PUT',
            url: serverUrl + '/restart'
        }).then(function(response) {
            return response.data;
        });
    };

    Server.prototype.sendTestEmail = function(toEmail, usernameInEmail) {
        return $http({
            url: serverUrl + '/email/test',
            params: {
                username: usernameInEmail,
                email: toEmail
            },
            method: 'PUT'
        });
    };
    
    Server.prototype.getSystemInfo = function(key) {
    	var url = serverUrl + '/system-info/';
    	if (key) {
    		url += encodeURIComponent(key);
    	}
    	
    	return $http({
            method: 'GET',
            url: url
        }).then(function(response) {
            return response.data;
        });
    };

    return new Server();
}

return ServerFactory;

}); // define
