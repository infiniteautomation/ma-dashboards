/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

ServerFactory.$inject = ['$http', '$q'];
function ServerFactory($http, $q) {
    const serverUrl = '/rest/latest/server';
    
    function Server() {
    }
    
    Server.prototype.restart = function(delay) {
        const params = {};
        if (Number.isFinite(delay) && delay >= 0) {
            params.delay = delay;
        }
        
        return $http({
            method: 'PUT',
            url: serverUrl + '/restart',
            params
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
        let url = serverUrl + '/system-info/';
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

    Server.prototype.sendEmailToMailingList = function (mailingListXid, data) {
        return $http({
            url: `${serverUrl}/email/mailing-list/${mailingListXid}`,
            method: 'POST',
            data: data
        });
    };

    return new Server();
}

export default ServerFactory;


