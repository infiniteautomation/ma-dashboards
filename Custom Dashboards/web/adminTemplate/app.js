/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([
    'angular',
    './directives/menu/menuLink', // load directives from the directives folder
    './directives/menu/menuToggle',
    './directives/login/login',
    'mango-3.0/maMaterialDashboards', // load mango-3.0 angular modules
    'mango-3.0/maAppComponents',
    'angular-ui-router', // load external angular modules
    'angular-loading-bar'
], function(angular, menuLink, menuToggle, login, maMaterialDashboards, maAppComponents) {
'use strict';

// create an angular app with our desired dependencies
var myAdminApp = angular.module('myAdminApp', [
    'ui.router',
    'angular-loading-bar',
    'maMaterialDashboards',
    'maAppComponents',
    'ngMessages'
]);

// add our directives to the app
myAdminApp
    .directive('menuLink', menuLink)
    .directive('menuToggle', menuToggle)
    .directive('login', login);

// define our pages, these are added to the $stateProvider in the config block below
myAdminApp.constant('PAGES', [
    {
        state: 'dashboard',
        url: '/dashboard',
        templateUrl: 'views/dashboard/main.html',
        resolve: {
            auth: ['$rootScope', 'User', function($rootScope, User) {
                // retrieves the current user when we navigate to a dashboard page
                // if an error occurs the $stateChangeError listener redirects to the login page
                $rootScope.user = User.current();
                return $rootScope.user.$promise;
            }],
            dashboardTranslations: ['Translate', function(Translate) {
                // load any translation namespaces you want to use in your app up-front
                // so they can be used by the 'tr' filter
                return Translate.loadNamespaces(['dashboards']);
            }]
        }
    },
    {
        state: 'login',
        url: '/login',
        templateUrl: 'views/login.html',
        resolve: {
            loginTranslations: ['Translate', function(Translate) {
                return Translate.loadNamespaces('login');
            }]
        }
    },
    {
        state: 'dashboard.home',
        url: '/home',
        templateUrl: 'views/dashboard/home.html',
        menuTr: 'dashboards.v3.dox.home',
        menuIcon: 'fa fa-home', // font awesome css classes for icon
        menuType: 'link'
    },
    {
        state: 'dashboard.apiErrors',
        url: '/api-errors',
        templateUrl: 'views/dashboard/errors.html',
        menuTr: 'dashboards.v3.dox.apiErrors'
    },
    {
        state: 'dashboard.section1', // define some nested pages
        url: '/section-1',
        menuText: 'Section 1',
        menuIcon: 'fa fa-building',
        menuType: 'toggle',
        children: [
            {
                state: 'dashboard.section1.page1',
                templateUrl: 'views/section1/page1.html', // html file to display
                url: '/page-1',
                menuText: 'Page 1',
                menuType: 'link'
            },
            {
                state: 'dashboard.section1.page2',
                templateUrl: 'views/section1/page2.html',
                url: '/page-2',
                menuText: 'Page 2',
                menuType: 'link'
            }
        ]
    },
    {
        state: 'dashboard.section2',
        url: '/section-2',
        menuText: 'Section 2',
        menuIcon: 'fa fa-bolt',
        menuType: 'toggle',
        children: [
            {
                state: 'dashboard.section2.page1',
                templateUrl: 'views/section2/page1.html',
                url: '/page-1',
                menuText: 'Page 1',
                menuType: 'link'
            },
            {
                state: 'dashboard.section2.page2',
                templateUrl: 'views/section2/page2.html',
                url: '/page-2',
                menuText: 'Page 2',
                menuType: 'link'
            }
        ]
    }
]);

myAdminApp.config([
    'PAGES',
    '$stateProvider',
    '$urlRouterProvider',
    '$httpProvider',
    '$mdThemingProvider',
    '$compileProvider',
function(PAGES, $stateProvider, $urlRouterProvider, $httpProvider, $mdThemingProvider, $compileProvider) {

    // disable angular debug info to speed up app
    $compileProvider.debugInfoEnabled(false);
    
    // configure the angular material colors
    $mdThemingProvider
        .theme('default')
        .primaryPalette('yellow')
        .accentPalette('red');

    // add the error interceptor to show REST errors on the error page
    $httpProvider.interceptors.push('errorInterceptor');

    // set the default state
    $urlRouterProvider.otherwise('/dashboard/home');

    // add the pages to $stateProvider
    addStates(PAGES);

    function addStates(pages, parent) {
        angular.forEach(pages, function(page, area) {
            if (page.state) {
                var state = {
                    url: page.url
                }
                
                if (page.menuTr) {
                    state.menuTr = page.menuTr;
                }
                if (page.menuText) {
                    state.menuText = page.menuText;
                }
                
                if (parent) {
                    state.parentPage = parent;
                }
                
                if (page.templateUrl) {
                    state.templateUrl = page.templateUrl;
                } else {
                    state.template = '<div ui-view></div>';
                    state['abstract'] = true;
                }
                
                if (page.resolve) {
                    state.resolve = page.resolve;
                }
                
                $stateProvider.state(page.state, state);
            }
            
            addStates(page.children, page);
        });
    }
}]);

myAdminApp.run([
    'PAGES',
    '$rootScope',
    '$state',
    '$timeout',
    '$mdSidenav',
    '$mdColors',
    '$MD_THEME_CSS',
    'cssInjector',
function(PAGES, $rootScope, $state, $timeout, $mdSidenav, $mdColors, $MD_THEME_CSS, cssInjector) {
    // add pages to the root scope so we can use them in the template
    $rootScope.pages = PAGES;
    // enables use of Javascript Math functions in the templates
    $rootScope.Math = Math;
    
    // inserts a style tag to style <a> tags with accent color
    if ($MD_THEME_CSS) {
        var acc = $mdColors.getThemeColor('accent-500-1.0');
        var accT = $mdColors.getThemeColor('accent-500-0.2');
        var accD = $mdColors.getThemeColor('accent-700-1.0');
        var styleContent =
            'a:not(.md-button) {color: ' + acc +'; border-bottom-color: ' + accT + ';}\n' +
            'a:not(.md-button):hover, a:not(.md-button):focus {color: ' + accD + '; border-bottom-color: ' + accD + ';}\n';
        
        cssInjector.injectStyle(styleContent, null, '[md-theme-style]');
    }

    // redirect to login page if we can't retrieve the current user when changing state
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
        if (error && (error.status === 401 || error.status === 403)) {
            event.preventDefault();
            $state.loginRedirect = toState;
            $state.go('login');
        }
    });

    // change the bread-crumbs on the toolbar when we change state
    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        var crumbs = [];
        var state = toState;
        do {
            if (state.menuTr) {
                crumbs.unshift({maTr: state.menuTr});
            } else if (state.menuText) {
                crumbs.unshift({text: state.menuText});
            }
        } while (state = state.parentPage);
        $rootScope.crumbs = crumbs;
    });
    
    // close the menu when we change state
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if ($state.includes('dashboard')) {
            $rootScope.closeMenu();
        }
    });

    $rootScope.closeMenu = function() {
        $mdSidenav('left').close();
    }

    $rootScope.openMenu = function() {
        angular.element('#menu-button').blur();
        $mdSidenav('left').open();
    }

}]);

// bootstrap the angular application
angular.element(document).ready(function() {
    angular.bootstrap(document.documentElement, ['myAdminApp']);
});

}); // define
