/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([
    'angular',
    './directives/login/login', // load directives from the directives folder
    'ngMango-3.0/ngMangoMaterial', // load ngMango-3.0 angular modules
    'angular-ui-router', // load external angular modules
    'angular-loading-bar'
], function(angular, login) {
'use strict';

// create an angular app with our desired dependencies
var mySinglePageApp = angular.module('mySinglePageApp', [
    'ui.router',
    'angular-loading-bar',
    'ngMangoMaterial',
    'ngMessages'
]);

// add our directives to the app
mySinglePageApp
    .directive('login', login);

mySinglePageApp.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$compileProvider',
    '$locationProvider',
function($stateProvider, $urlRouterProvider, $compileProvider, $locationProvider) {

    // disable angular debug info to speed up app
    $compileProvider.debugInfoEnabled(false);

    // enable html5 mode URLs (i.e. no /#/... urls)
    $locationProvider.html5Mode(true);

    // set the default state
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider.state('dashboard', {
        templateUrl: 'views/dashboard/main.html',
        resolve: {
            auth: ['$rootScope', 'User', function($rootScope, User) {
                // retrieves the current user when we navigate to a dashboard page
                // if an error occurs the $stateChangeError listener redirects to the login page
                $rootScope.user = User.getCurrent();
                return $rootScope.user.$promise;
            }]
        }
    }).state('dashboard.home', {
        url: '/home',
        templateUrl: 'views/dashboard/home.html',
    }).state('dashboard.page1', {
        url: '/page1',
        templateUrl: 'views/dashboard/page1.html',
    }).state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        resolve: {
            loginTranslations: ['Translate', function(Translate) {
                return Translate.loadNamespaces(['login']);
            }]
        }
    });
}]);

mySinglePageApp.run(['$rootScope', '$state', function($rootScope, $state) {
    // redirect to login page if we can't retrieve the current user when changing state
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
        if (error && (error.status === 401 || error.status === 403)) {
            event.preventDefault();
            // store the requested state so we can redirect there after login
            $state.loginRedirect = toState;
            $state.go('login');
        }
    });
}]);

// bootstrap the angular application
angular.element(document).ready(function() {
    angular.bootstrap(document.documentElement, ['mySinglePageApp']);
});

}); // define
