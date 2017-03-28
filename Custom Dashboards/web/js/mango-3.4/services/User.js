/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'moment-timezone'], function(angular, moment) {
'use strict';
/**
* @ngdoc service
* @name maServices.User
*
* @description
* Provides a service for getting list of users from the Mango system, as well as logging users in and out.
* - All methods return <a href="https://docs.angularjs.org/api/ngResource/service/$resource" target="_blank">$resource</a> objects that can call the following methods available to those objects:
*   - `$save`
*   - `$remove`
*   - `$delete`
*   - `$get`
*
* # Usage
*
* <pre prettyprint-mode="javascript">
*  var user = User.login({
    username: $scope.username,
    password: $scope.password
});

User.logout();
* </pre>
*
*/


/**
* @ngdoc method
* @methodOf maServices.User
* @name User#get
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v1/users/:username`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf maServices.User
* @name User#save
*
* @description
* A default action provided by $resource. Makes a http POST call to the rest endpoint `/rest/v1/users/:username`
* @param {object} query Object containing a `username` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf maServices.User
* @name User#remove
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/users/:username`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf maServices.User
* @name User#delete
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/users/:username`
* @param {object} query Object containing a `xid` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf maServices.User
* @name User#rql
*
* @description
* Passed a string containing RQL for the query and returns an array of user objects.
* @param {string} RQL RQL string for the query
* @returns {array} An array of user objects. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf maServices.User
* @name User#getById
*
* @description
* Query the REST endpoint `/rest/v1/users/by-id/:id` with the `GET` method.
* @param {object} query Object containing a `id` property which will be used in the query.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf maServices.User
* @name User#getCurrent
*
* @description
* Query the REST endpoint `/rest/v1/users/current` with the `GET` method to return the currently logged in user.
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf maServices.User
* @name User#login
*
* @description
* Attempts to login in the user by using `GET` method at `/rest/v1/login/:username`
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf maServices.User
* @name User#logout
*
* @description
* Logout the current user by using `GET` method at `/rest/v1/login/:username`
* @returns {object} Returns a user object. Objects will be of the resource class and have resource actions available to them.
*
*/

UserProvider.$inject = [];
function UserProvider() {
    var cachedUser = null;
    this.setUser = setUser;
    this.getUser = getUser;
    
    function setUser(user) {
        cachedUser = user;
        if (user) {
            if (user.locale)
                moment.locale(user.locale);
            moment.tz.setDefault(user.getTimezone());
        } else {
            // reset moment to initial settings?
            // probably not what we want if API goes down temporarily
        }
    }
    
    function getUser() {
        return cachedUser;
    }

    this.$get = UserFactory;
    
    /*
     * Provides service for getting list of users and create, update, delete
     */
    UserFactory.$inject = ['$resource', '$cacheFactory', 'localStorageService', '$q'];
    function UserFactory($resource, $cacheFactory, localStorageService, $q) {
        var User = $resource('/rest/v1/users/:username', {
                username: '@username'
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
            getCurrent: {
                url: '/rest/v1/users/current',
                method: 'GET',
                isArray: false,
                withCredentials: true,
                cache: false,
                interceptor: {
                    response: loginInterceptor
                }
            },
            login: {
                url: '/rest/v1/login',
                method: 'POST',
                isArray: false,
                withCredentials: true,
                cache: false,
                interceptor: {
                    response: loginInterceptor
                }
            },
            switchUser: {
                url: '/rest/v1/login/su/:username',
                method: 'GET',
                isArray: false,
                withCredentials: true,
                cache: false,
                interceptor: {
                    response: loginInterceptor
                }
            },
            logout: {
                url: '/rest/v1/logout',
                method: 'POST',
                isArray: false,
                withCredentials: true,
                cache: false,
                interceptor: {
                    response: logoutInterceptor
                }
            },
            save: {
                method: 'POST',
                url: '/rest/v1/users/'
            },
            update: {
                method: 'PUT'
            }
        });

        Object.defineProperty(User, 'current', {
            get: getUser,
            set: setUser
        });
        
        User.loginInterceptors = [];
        User.logoutInterceptors = [];

        function loginInterceptor(data) {
            User.loginInterceptors.forEach(function(interceptor) {
                interceptor(data);
            });
            User.current = data.resource;
            return data.resource;
        }
        
        function logoutInterceptor(data) {
            User.logoutInterceptors.forEach(function(interceptor) {
                interceptor(data);
            });
            User.current = null;
            return data.resource;
        }

        User.storeCredentials = function storeCredentials(username, password) {
            localStorageService.set('storedCredentials', {
                username: username,
                password: password
            });
        };
        
        User.storedUsername = function autoLogin() {
            var credentials = localStorageService.get('storedCredentials');
            return credentials ? credentials.username : null;
        };
        
        User.autoLogin = function autoLogin() {
            var credentials = localStorageService.get('storedCredentials');
            if (!credentials) return $q.reject('No stored credentials');
            return this.login.call(this, credentials).$promise;
        };
        
        User.clearStoredCredentials = function clearStoredCredentials() {
            localStorageService.remove('storedCredentials');
        };

        User.prototype.hasPermission = function(desiredPerms) {
            if (this.admin) return true;
            if (!this.permissions || !desiredPerms) return false;

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
                if (userPerms.indexOf(desiredPerm) >= 0)
                    return true;
            }

            return false;
        };

        User.prototype.getTimezone = function() {
            return this.timezone || this.systemTimezone;
        };

        User.prototype.saveOrUpdate = function() {
            var method = '$save';
            var args = Array.prototype.slice.apply(arguments);
            if (!this.isNew) {
                method = '$update';
                if (!args.length) {
                    args.push({});
                }
                var params = args[0];
                if (!params.username) {
                    params.username = this.originalUsername || this.username;
                }
            }
            return this[method].apply(this, args);
        };

        return User;
    }
}

return UserProvider;

}); // define
