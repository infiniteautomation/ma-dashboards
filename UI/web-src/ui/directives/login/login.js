/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import loginTemplate from './login.html';

loginFactory.$inject = ['maUser', 'maUtil', '$cookies', '$http', 'maUiLoginRedirector', '$state', 'maUiServerInfo'];
function loginFactory(User, maUtil, $cookies, $http, maUiLoginRedirector, $state, serverInfo) {
    return {
        template: loginTemplate,
        scope: {},
        link: function($scope, $element, attrs) {
            $scope.User = User;
            $scope.errors = {};
            $scope.serverInfo = serverInfo;
            
            $scope.$watchGroup(['username', 'password'], () => {
                delete $scope.errors.invalidLogin;
            });
            
            $scope.doLogin = function() {
                this.loggingIn = true;

                // ensures there is a CSRF protection cookie set before logging in
                const xsrfCookie = $cookies.get($http.defaults.xsrfCookieName);
                if (!xsrfCookie) {
                    $cookies.put($http.defaults.xsrfCookieName, maUtil.uuid(), {path: '/'});
                }
                
                const credentials = {
                    username: this.username,
                    password: this.password
                };
                
                User.login(credentials).$promise.then(user => {
                    return maUiLoginRedirector.redirect(user);
                }, error => {
                    this.loggingIn = false;
                    this.errors.invalidLogin = false;
                    if (error.status === 401) {
                        if (error.data && error.data.mangoStatusName === 'CREDENTIALS_EXPIRED') {
                            $state.go('changePassword', Object.assign({credentialsExpired: true}, credentials));
                        } else {
                            this.errors.invalidLogin = true;
                            this.errors.otherError = false;
                            this.invalidLoginMessage = error.mangoStatusText;
                        }
                    } else {
                        this.errors.otherError = error.mangoStatusText;
                        delete this.invalidLoginMessage;
                    }
                });
            };
        }
    };
}

export default loginFactory;