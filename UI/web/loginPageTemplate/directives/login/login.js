/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

var login = function($state, User, $rootScope, $window) {
    return {
        templateUrl: require.toUrl('./login.html'),
        scope: {},
        link: function($scope, $element, attrs) {
            $scope.currentUser = User.getCurrent();
            $scope.errors = {};
            
            $scope.$watchGroup(['username', 'password'], function() {
                delete $scope.errors.invalidLogin;
            });
            
            $scope.doLogin = function() {
                var user = User.login({
                    username: $scope.username,
                    password: $scope.password,
                    logout: true
                });
                user.$promise.then(function(user) {
                    var redirectUrl = '/';
                    if ($state.loginRedirectUrl) {
                        redirectUrl = $state.loginRedirectUrl;
                    }
                    $window.location = redirectUrl;
                }, function(error) {
                    if (error.status === 406) {
                        $scope.errors.invalidLogin = true;
                        $scope.errors.otherError = false;
                    }
                    else {
                        $scope.errors.invalidLogin = false;
                        $scope.errors.otherError = error.statusText || 'Connection refused';
                    }
                });
            }
        }
    };
};

login.$inject = ['$state', 'User', '$rootScope', '$window'];

return login;

}); // define
