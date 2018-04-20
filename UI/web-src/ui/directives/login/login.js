/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import loginTemplate from './login.html';

loginFactory.$inject = ['$state', 'maUser', '$rootScope', '$window', 'maUtil', '$cookies', '$http'];
function loginFactory($state, User, $rootScope, $window, maUtil, $cookies, $http) {
    return {
        template: loginTemplate,
        scope: {},
        link: function($scope, $element, attrs) {
            $scope.User = User;
            $scope.errors = {};
            
            $scope.$watchGroup(['username', 'password'], function() {
                delete $scope.errors.invalidLogin;
            });
            
            $scope.doLogin = function() {
                $scope.loggingIn = true;

                const xsrfCookie = $cookies.get($http.defaults.xsrfCookieName);
                if (!xsrfCookie) {
                    $cookies.put($http.defaults.xsrfCookieName, maUtil.uuid(), {path: '/'});
                }
                
                User.login({
                    username: $scope.username,
                    password: $scope.password
                }).$promise.then(function(user) {
                    let redirectUrl = '/ui/';
                    if ($state.loginRedirectUrl) {
                        redirectUrl = $state.loginRedirectUrl;
                    } else if (user.mangoDefaultUri) {
                        redirectUrl = user.mangoDefaultUri;
                    } else if (user.homeUrl) {
                        // user.mangoDefaultUri should be user.homeUrl if it is set
                        // just in case mangoDefaultUri is empty
                        redirectUrl = user.homeUrl;
                    }
                    $window.location = redirectUrl;
                }, function(error) {
                    $scope.loggingIn = false;
                    $scope.errors.invalidLogin = false;
                    if (error.status === 401) {
                        $scope.errors.invalidLogin = true;
                        $scope.errors.otherError = false;
                    } else {
                        $scope.errors.otherError = error.mangoStatusText;
                    }
                });
            };
        }
    };
}

export default loginFactory;


