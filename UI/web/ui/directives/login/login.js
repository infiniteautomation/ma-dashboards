/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

loginFactory.$inject = ['$state', 'maUser', '$rootScope', '$window'];
function loginFactory($state, User, $rootScope, $window) {
    return {
        templateUrl: require.toUrl('./login.html'),
        scope: {},
        link: function($scope, $element, attrs) {
            $scope.User = User;
            $scope.errors = {};
            
            $scope.$watchGroup(['username', 'password'], function() {
                delete $scope.errors.invalidLogin;
            });
            
            $scope.doLogin = function() {
                var user = User.login({
                    username: $scope.username,
                    password: $scope.password
                });
                user.$promise.then(function(user) {
                    var redirectUrl = '/ui/';
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
                    if (error.status === 401) {
                        $scope.errors.invalidLogin = true;
                        $scope.errors.otherError = false;
                    }
                    else {
                        $scope.errors.invalidLogin = false;
                        $scope.errors.otherError = error.statusText || 'Connection refused';
                    }
                });
            };
        }
    };
}

return loginFactory;

}); // define
