/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([
    'angular',
    './directives/menu/dashboardMenu', // load directives from the directives folder
    './directives/menu/menuLink',
    './directives/menu/menuToggle',
    './directives/login/login',
    'ngMango/ngMangoMaterial', // load ngMango angular modules
    'ngMango/ngMangoComponents',
    'angular-ui-router', // load external angular modules
    'angular-loading-bar'
], function(angular, dashboardMenu, menuLink, menuToggle, login, ngMangoMaterial, ngMangoComponents) {
'use strict';

// create an angular app with our desired dependencies
var myAdminApp = angular.module('myAdminApp', [
    'ui.router',
    'angular-loading-bar',
    'ngMangoMaterial',
    'ngMangoComponents',
    'ngMessages'
]);

// add our directives to the app
myAdminApp
    .component('dashboardMenu', dashboardMenu)
    .component('menuLink', menuLink)
    .component('menuToggle', menuToggle)
    .directive('login', login);

// define our menu items, these are added to the $stateProvider in the config block below
myAdminApp.constant('MENU_ITEMS', [
    {
        name: 'dashboard',
        templateUrl: 'views/dashboard/main.html',
        abstract: true,
        menuHidden: true,
        resolve: {
            auth: ['Translate', 'ADMIN_SETTINGS', function(Translate, ADMIN_SETTINGS) {
                // thow an error if no user so the $stateChangeError listener redirects to the login page
                if (!ADMIN_SETTINGS.user) {
                    throw 'No user';
                }
                // load any translation namespaces you want to use in your app up-front
                // so they can be used by the 'tr' filter
                return Translate.loadNamespaces(['dashboards', 'common', 'login']);
            }]
        }
    },
    {
        name: 'login',
        url: '/login',
        templateUrl: 'views/login.html',
        menuHidden: true,
        menuIcon: 'exit_to_app',
        menuTr: 'header.login',
        resolve: {
            loginTranslations: ['Translate', function(Translate) {
                return Translate.loadNamespaces('login');
            }]
        }
    },
    {
        name: 'logout',
        url: '/logout',
        menuHidden: true,
        menuIcon: 'power_settings_new', // material icon name
        menuTr: 'header.logout',
        template: '<div></div>'
    },
    {
        name: 'dashboard.home',
        url: '/home',
        templateUrl: 'views/dashboard/home.html',
        menuTr: 'ui.dox.home',
        menuIcon: 'home'
    },
    {
        name: 'dashboard.apiErrors',
        url: '/api-errors',
        templateUrl: 'views/dashboard/errors.html',
        menuTr: 'ui.dox.apiErrors',
        menuIcon: 'warning',
        menuHidden: true
    },
    {
        name: 'dashboard.section1', // define some nested pages
        url: '/section-1',
        menuText: 'Section 1',
        menuIcon: 'fa-building',
        children: [
            {
                name: 'dashboard.section1.page1',
                templateUrl: 'views/section1/page1.html', // html file to display
                url: '/page-1',
                menuText: 'Page 1'
            },
            {
                name: 'dashboard.section1.page2',
                templateUrl: 'views/section1/page2.html',
                url: '/page-2',
                menuText: 'Page 2'
            }
        ]
    },
    {
        name: 'dashboard.section2',
        url: '/section-2',
        menuText: 'Section 2',
        menuIcon: 'fa-bolt',
        children: [
            {
                name: 'dashboard.section2.page1',
                templateUrl: 'views/section2/page1.html',
                url: '/page-1',
                menuText: 'Page 1'
            },
            {
                name: 'dashboard.section2.page2',
                templateUrl: 'views/section2/page2.html',
                url: '/page-2',
                menuText: 'Page 2'
            }
        ]
    }
]);

myAdminApp.config([
    'MENU_ITEMS',
    '$stateProvider',
    '$urlRouterProvider',
    '$httpProvider',
    '$mdThemingProvider',
    '$compileProvider',
    '$locationProvider',
    '$mdAriaProvider',
function(MENU_ITEMS, $stateProvider, $urlRouterProvider, $httpProvider, $mdThemingProvider, $compileProvider, $locationProvider, $mdAriaProvider) {

    // disable angular debug info to speed up app
    $compileProvider.debugInfoEnabled(false);
    // disable aria warnings
    $mdAriaProvider.disableWarnings();
    
    // configure the angular material colors
    $mdThemingProvider
        .theme('default')
        .primaryPalette('yellow')
        .accentPalette('red');

    // add the error interceptor to show REST errors on the error page
    $httpProvider.interceptors.push('errorInterceptor');
    $httpProvider.useApplyAsync(true);

    // set the default state
    $urlRouterProvider.otherwise('/home');
    
    // enable html5 mode URLs (i.e. no /#/... urls)
    $locationProvider.html5Mode(true);

    // add the menu items to $stateProvider
    var nextId = 1;
    addStates(MENU_ITEMS);

    function addStates(menuItems, parent) {
        angular.forEach(menuItems, function(menuItem, parent) {
            menuItem.id = nextId++;
            if (menuItem.name || menuItem.state) {
                if (menuItem.templateUrl) {
                    delete menuItem.template;
                }
                if (!menuItem.templateUrl && !menuItem.template) {
                    menuItem.template = '<div ui-view></div>';
                    menuItem['abstract'] = true;
                }
                
                if (!menuItem.name) {
                    menuItem.name = menuItem.state;
                }
                
                if (!menuItem.resolve && menuItem.name.indexOf('.') < 0) {
                    menuItem.resolve = {
                        loginTranslations: ['Translate', function(Translate) {
                            return Translate.loadNamespaces('login');
                        }]
                    }
                }
                
                $stateProvider.state(menuItem);
            }
            
            addStates(menuItem.children, menuItem);
        });
    }
}]);

myAdminApp.run([
    'MENU_ITEMS',
    '$rootScope',
    '$state',
    '$timeout',
    '$mdSidenav',
    '$mdMedia',
    '$mdColors',
    '$MD_THEME_CSS',
    'cssInjector',
    '$mdToast',
    'User',
    'ADMIN_SETTINGS',
    'Translate',
function(MENU_ITEMS, $rootScope, $state, $timeout, $mdSidenav, $mdMedia, $mdColors, $MD_THEME_CSS, cssInjector,
        $mdToast, User, ADMIN_SETTINGS, Translate) {

    // add the current user to the root scope
    $rootScope.user = ADMIN_SETTINGS.user;
    // add menu items to the root scope so we can use them in the template
    $rootScope.menuItems = MENU_ITEMS;
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
        if (error && (error === 'No user' || error.status === 401 || error.status === 403)) {
            event.preventDefault();
            $state.loginRedirectUrl = $state.href(toState, toParams);
            $state.go('login');
        } else {
            $state.go('dashboard.home');
        }
    });

    // change the bread-crumbs on the toolbar when we change state
    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        var crumbs = [];
        var state = $state.$current;
        do {
            if (state.menuTr) {
                crumbs.unshift({stateName: state.name, maTr: state.menuTr});
            } else if (state.menuText) {
                crumbs.unshift({stateName: state.name, text: state.menuText});
            }
        } while (state = state.parent);
        $rootScope.crumbs = crumbs;
    });
    
    // close the menu when we change state
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if ($state.includes('dashboard') && !$rootScope.navLockedOpen) {
            $rootScope.closeMenu();
        }
        if (toState.name === 'logout') {
            event.preventDefault();
            User.logout().$promise.then(null, function() {
                // consume error
            }).then(function() {
                $rootScope.user = null;
                ADMIN_SETTINGS.user = null;
                $state.go('login');
            });
        }
    });

    // wait for the dashboard view to be loaded then set it to open if the
    // screen is a large one. By default the internal state of the sidenav thinks
    // it is closed even if it is locked open
    $rootScope.$on('$viewContentLoaded', function(event, view) {
        if (view === '@dashboard') {
            if ($mdMedia('gt-sm')) {
                $rootScope.openMenu();
            }
            
            // the closeMenu() function already does this but we need this for when the ESC key is pressed
            // which just calls $mdSidenav(..).close();
            $mdSidenav('left').onClose(function () {
                $rootScope.navLockedOpen = false;
            });
        }
    });

    // automatically open or close the menu when the screen size is changed
    $rootScope.$watch($mdMedia.bind($mdMedia, 'gt-sm'), function(gtSm, prev) {
        if (gtSm === prev) return; // ignore first "change"
        
        var sideNav = $mdSidenav('left');
        if (gtSm && !sideNav.isOpen()) {
            sideNav.open();
        }
        if (!gtSm && sideNav.isOpen()) {
            sideNav.close();
        }
        $rootScope.navLockedOpen = gtSm;
    });
    
    $rootScope.toggleMenu = function() {
        var sideNav = $mdSidenav('left');
        if (sideNav.isOpen()) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    };

    $rootScope.closeMenu = function() {
        angular.element('#menu-button').blur();
        $rootScope.navLockedOpen = false;
        $mdSidenav('left').close();
    };

    $rootScope.openMenu = function() {
        angular.element('#menu-button').blur();
        if ($mdMedia('gt-sm')) {
            $rootScope.navLockedOpen = true;
        }
        $mdSidenav('left').open();
    };

    /**
     * Watchdog timer alert and re-connect/re-login code
     */

    $rootScope.$on('mangoWatchdog', function(event, current, previous) {
        var message;
        var hideDelay = 0; // dont auto hide message

        if (current.status === previous.status)
            return;
        
        switch(current.status) {
        case 'API_DOWN':
            message = Translate.trSync('login.ui.app.apiDown');
            ADMIN_SETTINGS.user = null;
            break;
        case 'STARTING_UP':
            message = Translate.trSync('login.ui.app.startingUp');
            ADMIN_SETTINGS.user = null;
            break;
        case 'API_ERROR':
            message = Translate.trSync('login.ui.app.returningErrors');
            ADMIN_SETTINGS.user = null;
            break;
        case 'API_UP':
            if (previous.status && previous.status !== 'LOGGED_IN')
                message = Translate.trSync('login.ui.app.connectivityRestored');
            hideDelay = 5000;
            ADMIN_SETTINGS.user = null;

            // do automatic re-login if we are not on the login page
            if (!$state.includes('login')) {
                User.autoLogin().then(function(user) {
                    ADMIN_SETTINGS.user = user;
                    $rootScope.user = user;
                }, function() {
                    // redirect to the login page if auto-login fails
                    window.location = $state.href('login');
                });
            }
            break;
        case 'LOGGED_IN':
            // occurs almost simultaneously with API_UP message, only display if we didn't hit API_UP state
            if (previous.status && previous.status !== 'API_UP')
                message = Translate.trSync('login.ui.app.connectivityRestored');
            if (!ADMIN_SETTINGS.user) {
                // user logged in elsewhere
                User.current().$promise.then(function(user) {
                    ADMIN_SETTINGS.user = user;
                    $rootScope.user = user;
                });
            }
            break;
        }
        $rootScope.user = ADMIN_SETTINGS.user;

        if (message) {
            var toast = $mdToast.simple()
                .textContent(message)
                .action('OK')
                .highlightAction(true)
                .position('bottom center')
                .hideDelay(hideDelay);
            $mdToast.show(toast);
        }
    });


}]);

// get an injector to retrieve the User service
var servicesInjector = angular.injector(['ngMangoServices'], true);
var User = servicesInjector.get('User');

var adminSettings = {};

// get the current user or do auto login
User.current().$promise.then(null, function() {
    return User.autoLogin();
}).then(function(user) {
    adminSettings.user = user;
}).then(null, function() {
    // consume error
}).then(function() {
    servicesInjector.get('$rootScope').$destroy();
    myAdminApp.constant('ADMIN_SETTINGS', adminSettings);
    
    // bootstrap the angular application
    angular.element(document).ready(function() {
        angular.bootstrap(document.documentElement, ['myAdminApp']);
    });
});

}); // define
