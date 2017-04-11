/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'jquery'], function(angular, $) {
'use strict';

/*
 * Provides service for getting list of users and create, update, delete
 */
function UserFactory($resource) {
    var User = $resource('/rest/v1/users/:xid', {
    		xid: '@xid'
    	}, {
        query: {
            method: 'GET',
            isArray: true,
            transformResponse: function(data, fn, code) {
                if (code < 300) {
                    return angular.fromJson(data).items;
                }
                return [];
            },
            withCredentials: true,
            cache: true
        },
        rql: {
        	url: '/rest/v1/users?:query',
            method: 'GET',
            isArray: true,
            transformResponse: function(data, fn, code) {
                if (code < 300) {
                    return angular.fromJson(data).items;
                }
                return [];
            },
            withCredentials: true,
            cache: true
        },
        getById: {
            url: '/rest/v1/users/by-id/:id',
            method: 'GET',
            isArray: false,
            withCredentials: true,
            cache: true
        },
        current: {
            url: '/rest/v1/users/current',
            method: 'GET',
            isArray: false,
            withCredentials: true,
            cache: true
        },
        login: {
            url: '/rest/v1/login/:username',
            method: 'GET',
            headers: {
            	password: function(config) {
            		var password = config.params.password;
            		delete config.params.password;
                    return password;
                },
                logout: function(config) {
            		var logout = config.params.logout;
            		delete config.params.logout;
                    return !!logout;
                }
            },
            isArray: false,
            withCredentials: true,
            cache: false
        }
    });
    
    User.prototype.hasPermission = function(desiredPerms) {
        if (this.admin) return true;
        
        if (typeof desiredPerms === 'string') {
            desiredPerms = desiredPerms.split(',');
        }
        
        var userPerms = this.permissions.split(',');
        for (var i = userPerms.length - 1; i >= 0; i--) {
            var userPerm = userPerms[i].trim();
            if (userPerm) {
                userPerms[i] = userPerm;
            } else {
                userPerms.splice(i, 1);
            }
        }
        
        for (i = 0; i < desiredPerms.length; i++) {
            var desiredPerm = desiredPerms[i].trim();
            if (!desiredPerm) continue;
            if ($.inArray(desiredPerm, userPerms) > -1)
            	return true;
        }
        
        return false;
    };
    
    User.prototype.getTimezone = function() {
        return this.timezone || this.systemTimezone;
    };

    return User;
}

UserFactory.$inject = ['$resource'];
return UserFactory;

}); // define
