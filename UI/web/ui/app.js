/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([
    'angular',
    'ngMango/ngMangoMaterial',
    'ngMango/ngMangoComponents',
    'require',
    './services/Menu',
    './services/Page',
    './services/DateBar',
    './services/uiSettings',
    './directives/pageView/pageView',
    './directives/liveEditor/livePreview',
    './menuItems',
    'moment-timezone',
    'angular-ui-router',
    'angular-ui-sortable',
    'oclazyload',
    'angular-loading-bar',
    './views/docs/docs-setup'
], function(angular, ngMangoMaterial, ngMangoComponents, require, MenuProvider, Page, DateBar, uiSettings, pageView, livePreview, menuItems, moment) {
'use strict';

var uiApp = angular.module('uiApp', [
    'oc.lazyLoad',
    'ui.router',
    'ui.sortable',
    'angular-loading-bar',
    'ngMangoMaterial',
    'ngMangoComponents',
    'ngMessages'
]);

uiApp.provider('Menu', MenuProvider)
    .factory('Page', Page)
    .factory('DateBar', DateBar)
    .factory('uiSettings', uiSettings)
    .directive('pageView', pageView)
    .directive('livePreview', livePreview)
    .constant('require', require)
    .constant('CUSTOM_USER_MENU_XID', 'mangoUI-menu')
    .constant('CUSTOM_USER_PAGES_XID', 'mangoUI-pages')
    .constant('MANGO_UI_NG_DOCS', NG_DOCS)
    .constant('MA_UI_MENU_ITEMS', menuItems);

uiApp.config([
    'MA_UI_SETTINGS',
    'MANGO_UI_NG_DOCS',
    '$stateProvider',
    '$urlRouterProvider',
    '$ocLazyLoadProvider',
    '$httpProvider',
    '$mdThemingProvider',
    '$injector',
    '$compileProvider',
    'MenuProvider',
    '$locationProvider',
    '$mdAriaProvider',
    'cfpLoadingBarProvider',
    'SystemSettingsProvider',
    'CUSTOM_USER_MENU_XID',
    'CUSTOM_USER_PAGES_XID',
function(MA_UI_SETTINGS, MANGO_UI_NG_DOCS, $stateProvider, $urlRouterProvider, $ocLazyLoadProvider,
        $httpProvider, $mdThemingProvider, $injector, $compileProvider, MenuProvider, $locationProvider, $mdAriaProvider,
        cfpLoadingBarProvider, SystemSettingsProvider, CUSTOM_USER_MENU_XID, CUSTOM_USER_PAGES_XID) {

    // will need initially when we use AngularJS 1.6.x
    //$compileProvider.preAssignBindingsEnabled(true);
    $compileProvider.debugInfoEnabled(false);
    $mdAriaProvider.disableWarnings();

    if (MA_UI_SETTINGS.palettes) {
        for (var paletteName in MA_UI_SETTINGS.palettes) {
            $mdThemingProvider.definePalette(paletteName, angular.copy(MA_UI_SETTINGS.palettes[paletteName]));
        }
    }

    if (MA_UI_SETTINGS.themes) {
        for (var name in MA_UI_SETTINGS.themes) {
            var themeSettings = MA_UI_SETTINGS.themes[name];
            var theme = $mdThemingProvider.theme(name);
            if (themeSettings.primaryPalette) {
                theme.primaryPalette(themeSettings.primaryPalette, themeSettings.primaryPaletteHues);
            }
            if (themeSettings.accentPalette) {
                theme.accentPalette(themeSettings.accentPalette, themeSettings.accentPaletteHues);
            }
            if (themeSettings.warnPalette) {
                theme.warnPalette(themeSettings.warnPalette, themeSettings.warnPaletteHues);
            }
            if (themeSettings.backgroundPalette) {
                theme.backgroundPalette(themeSettings.backgroundPalette, themeSettings.backgroundPaletteHues);
            }
            if (themeSettings.dark) {
                theme.dark();
            }
        }
    }

    // need to store a reference to the theming provider in order to generate themes at runtime
    MA_UI_SETTINGS.themingProvider = $mdThemingProvider;

    var defaultTheme = MA_UI_SETTINGS.defaultTheme || 'mangoDark';
    $mdThemingProvider.setDefaultTheme(defaultTheme);
    $mdThemingProvider.alwaysWatchTheme(true);
    $mdThemingProvider.generateThemesOnDemand(true);
    $mdThemingProvider.enableBrowserColor({
        theme: defaultTheme
    });

    $httpProvider.useApplyAsync(true);

    if ($injector.has('$mdpTimePickerProvider')) {
        var $mdpTimePickerProvider = $injector.get('$mdpTimePickerProvider');
        /*
        $mdpTimePickerProvider.setOKButtonLabel();
        $mdpTimePickerProvider.setCancelButtonLabel();
        */
    }

    $ocLazyLoadProvider.config({
        debug: false,
        events: true
    });

    //$stateProvider.reloadOnSearch = false;
    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise(function($injector, $location) {
        var basePath = '/ui/';
        var uiSettings = $injector.get('uiSettings');
        var User = $injector.get('User');
        var $state = $injector.get('$state');
        var user = User.current;
        
        var path = basePath;
        if ($location.path()) {
            path += $location.path().substring(1);
        }
        
        if (!user) {
            $state.loginRedirectUrl = path;
            return '/login';
        }
        
        if (path === basePath) {
            // mango default URI will contain the homeUrl if it exists, or the mango start page if it doesn't
            // so prefer using it if it exists (only exists when doing login)
            var homeUrl = user.mangoDefaultUri || user.homeUrl;
            if (homeUrl && homeUrl.indexOf(basePath) === 0) {
                return '/' + homeUrl.substring(basePath.length); // strip basePath from start of URL
            }
            return '/home';
        }

        return '/not-found?path=' + encodeURIComponent(path);
    });

    var apiDocsMenuItems = [];
    var docsParent = {
        name: 'ui.docs',
        url: '/docs',
        menuText: 'API Docs',
        menuIcon: 'book',
        menuHidden: true,
        submenu: true,
        weight: 2002,
        resolve: {
            prettyprint: ['rQ', '$ocLazyLoad', function(rQ, $ocLazyLoad) {
                return rQ(['./directives/prettyprint/prettyprint'], function(prettyprint) {
                    angular.module('prettyprint', [])
                        .directive('prettyprint', prettyprint);
                    $ocLazyLoad.inject('prettyprint');
                });
            }]
        }
    };
    apiDocsMenuItems.push(docsParent);

    var DOCS_PAGES = MANGO_UI_NG_DOCS.pages;

    // Loop through and create array of children based on moduleName
    var modules = DOCS_PAGES.map(function(page) {return page.moduleName;})
    .filter(function(item, index, array) {
        return index == array.indexOf(item);
    });

    // Create module menu items & states
    modules.forEach(function(item, index, array) {
        var dashCaseUrl = item.replace(/[A-Z]/g, function(c) { return '-' + c.toLowerCase(); });

        var menuText = item;
        if (item==='ngMango') { menuText = 'Components'; }
        else if (item==='ngMangoFilters') { menuText = 'Filters'; }
        else if (item==='ngMangoServices') { menuText = 'Services'; }

        var menuItem = {
            name: 'ui.docs.' + item,
            url: '/' + dashCaseUrl,
            menuText: menuText
        };

        apiDocsMenuItems.push(menuItem);
    });

    // Create 3rd level directives/services/filters docs pages
    // First remove module items
    var components = DOCS_PAGES.map(function(page) {return page.id;})
    .filter(function(item, index, array) {
        return item.indexOf('.') !== -1;
    });

    // Add each component item
    components.forEach(function(item, index, array) {
        var splitAtDot = item.split('.');
        var dashCaseUrl = splitAtDot[1].replace(/[A-Z]/g, function(c) { return '-' + c.toLowerCase(); });
		if(dashCaseUrl.charAt(0) === '-') { dashCaseUrl = dashCaseUrl.slice(1);}
        var menuText = splitAtDot[1];
        if (splitAtDot[0] === 'ngMango') { menuText = dashCaseUrl;}
        var menuItem = {
            name: 'ui.docs.' + item,
            templateUrl: require.toUrl('./views/docs/' + item + '.html'),
            url: '/' + dashCaseUrl,
            menuText: menuText
        };
        apiDocsMenuItems.push(menuItem);
    });
    
    MenuProvider.registerMenuItems(apiDocsMenuItems);

    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
    
    SystemSettingsProvider.addSection({
        titleTr: 'ui.settings',
        template: require.toUrl('mangoUIModule/settings.html')
    });
}]);

uiApp.run([
    '$rootScope',
    '$state',
    '$timeout',
    '$mdSidenav',
    '$mdMedia',
    'localStorageService',
    '$mdToast',
    'User',
    'uiSettings',
    'Translate',
    '$location',
    '$stateParams',
    'DateBar',
    '$document',
    '$mdDialog',
    'GoogleAnalytics',
    'MA_GOOGLE_ANALYTICS_PROPERTY_ID',
function($rootScope, $state, $timeout, $mdSidenav, $mdMedia, localStorageService,
        $mdToast, User, uiSettings, Translate, $location, $stateParams, DateBar, $document, $mdDialog,
        GoogleAnalytics, MA_GOOGLE_ANALYTICS_PROPERTY_ID) {

    if (MA_GOOGLE_ANALYTICS_PROPERTY_ID) {
        GoogleAnalytics.enable(MA_GOOGLE_ANALYTICS_PROPERTY_ID);
    }

    uiSettings.generateTheme();
    $rootScope.stateParams = $stateParams;
    $rootScope.dateBar = DateBar;
    $rootScope.uiSettings = uiSettings;
    $rootScope.User = User;
    $rootScope.Math = Math;
    $rootScope.$mdMedia = $mdMedia;
    $rootScope.$state = $state;
    
    $rootScope.goToState = function($event, stateName, stateParams) {
        // ignore if it was a middle click, i.e. new tab
        if ($event.which !== 2) {
            $event.preventDefault();
            $state.go(stateName, stateParams);
        }
    };

    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
        event.preventDefault();
        if (error && (error === 'No user' || error.status === 401 || error.status === 403)) {
            $state.loginRedirectUrl = $state.href(toState, toParams);
            $state.go('login');
        } else if (error && error.status === 404 && error.config && error.config.url.indexOf('/rest/v1/translations/public/login') >= 0) {
            $rootScope.noApi = true;
        } else {
            console.log(error);
            if (toState.name !== 'ui.error') {
                $state.go('ui.error');
            } else {
                // should we call alert() or something?
            }
        }
    });

    $rootScope.titleSuffix = 'Mango Dashboards v3';
    $rootScope.setTitleText = function setTitleText() {
        if ($state.$current.menuText) {
            this.titleText = $state.$current.menuText + ' - ' + this.titleSuffix;
        } else if ($state.$current.menuTr) {
            Translate.tr($state.$current.menuTr).then(function(text) {
                this.titleText = text + ' - ' + this.titleSuffix;
            }.bind(this), function() {
                this.titleText = this.titleSuffix;
            }.bind(this));
        } else {
            this.titleText = this.titleSuffix;
        }
    };
    
    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        var crumbs = [];
        var state = $state.$current;
        do {
            if (state.name === 'ui') continue;
            
            if (state.menuTr) {
                crumbs.unshift({stateName: state.name, maTr: state.menuTr});
            } else if (state.menuText) {
                crumbs.unshift({stateName: state.name, text: state.menuText});
            }
        } while ((state = state.parent));
        $rootScope.crumbs = crumbs;
        
        $rootScope.setTitleText();
        
        if (toState !== fromState) {
            var contentDiv = document.querySelector('.main-content');
            if (contentDiv) {
                contentDiv.scrollTop = 0;
            }
        }
        
        DateBar.rollupTypesFilter = {};
    });

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if ($state.includes('ui.settings.uiSettings')) {
            // resets themes to the last saved state when leaving the settings page
            uiSettings.reset();
            uiSettings.generateTheme();
        }
        
        if ($state.includes('ui') && !$rootScope.navLockedOpen) {
            $rootScope.closeMenu();
        }
        if (toState.name === 'logout') {
            event.preventDefault();
            User.logout().$promise.then(null, function() {
                // consume error
            }).then(function() {
                $state.go('login');
            });
        }
    });
    
    // wait for the dashboard view to be loaded then set it to open if the
    // screen is a large one. By default the internal state of the sidenav thinks
    // it is closed even if it is locked open
    $rootScope.$on('$viewContentLoaded', function(event, view) {
        if (view === '@ui') {
            if ($mdMedia('gt-sm')) {
                var uiPrefs = localStorageService.get('uiPreferences');
                if (!uiPrefs || !uiPrefs.menuClosed) {
                    $rootScope.openMenu();
                }
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
        var uiPrefs = localStorageService.get('uiPreferences') || {};
        
        if (gtSm && !uiPrefs.menuClosed && !sideNav.isOpen()) {
            $rootScope.openMenu();
        }
        if (!gtSm && sideNav.isOpen()) {
            $rootScope.closeMenu();
        }
    });
    
    $rootScope.toggleMenu = function() {
        var sideNav = $mdSidenav('left');
        var uiPrefs = localStorageService.get('uiPreferences') || {};
        
        if (sideNav.isOpen()) {
            uiPrefs.menuClosed = true;
            this.closeMenu();
        } else {
            uiPrefs.menuClosed = false;
            this.openMenu();
        }
        
        // we only update the prefs if we are on a page where we can actually open and close the menu
        if ($mdMedia('gt-sm')) {
            localStorageService.set('uiPreferences', uiPrefs);
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

        if (current.status !== 'STARTING_UP' && current.status === previous.status)
            return;

        switch(current.status) {
        case 'API_DOWN':
            message = Translate.trSync('login.ui.app.apiDown');
            break;
        case 'STARTING_UP':
            if (current.status === previous.status && current.info.startupProgress === previous.info.startupProgress &&
                    current.info.startupState === previous.info.startupState) {
                return;
            }
            message = Translate.trSync('login.ui.app.startingUp', [current.info.startupProgress, current.info.startupState]);
            break;
        case 'API_ERROR':
            message = Translate.trSync('login.ui.app.returningErrors');
            break;
        case 'API_UP':
            if (previous.status && previous.status !== 'LOGGED_IN') {
                message = Translate.trSync('login.ui.app.connectivityRestored');
                hideDelay = 5000;
            }

            // do automatic re-login if we are not on the login page
            if (!$state.includes('login') && !current.wasLogout) {
                User.autoLogin().then(null, function() {
                    // close dialogs
                    $mdDialog.cancel();
                    
                    // redirect to the login page if auto-login fails
                    $state.loginRedirectUrl = '/ui' + $location.url();
                    $state.go('login');
                    //window.location = $state.href('login');
                });
            }
            break;
        case 'LOGGED_IN':
            // occurs almost simultaneously with API_UP message, only display if we didn't hit API_UP state
            if (previous.status && previous.status !== 'API_UP') {
                message = Translate.trSync('login.ui.app.connectivityRestored');
                hideDelay = 5000;
            }
            break;
        }

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
    
    // stops window to navigating to a file when dropped on root document
    $document.on('dragover drop', function($event) {
        return false;
    });
}]);

/**
 * From here down is the bootstrap code, all actual angular app code is above
 */

// Get an injector for the ngMangoServices app and use the JsonStore service to retrieve the
// custom user menu items from the REST api prior to bootstrapping the main application.
// This is so the states can be added to the stateProvider in the config block for the
// main application. If the states are added after the main app runs then the user may
// not navigate directly to one of their custom states on startup
var servicesInjector = angular.injector(['ngMangoServices'], true);
var User = servicesInjector.get('User');
var JsonStore = servicesInjector.get('JsonStore');
var $q = servicesInjector.get('$q');
var $http = servicesInjector.get('$http');

var userAndUserSettingsPromise = User.getCurrent().$promise.then(null, function() {
    return User.autoLogin();
}).then(function(user) {
    var userMenuPromise = JsonStore.get({xid: 'mangoUI-menu'}).$promise.then(null, angular.noop);
    return $q.all([user, userMenuPromise]);
}, angular.noop).then(function(data) {
    return {
        user: data && data[0],
        userMenuStore: data && data[1]
    };
});

var uiSettingsPromise = $http({
    method: 'GET',
    url: require.toUrl('./uiSettings.json')
}).then(function(data) {
    return data.data;
}, angular.noop);

var customDashboardSettingsPromise = JsonStore.getPublic({xid: 'mangoUI-settings'}).$promise.then(null, angular.noop);

var angularModulesPromise = $http({
    method: 'GET',
    url: '/rest/v1/modules/angularjs-modules/public'
}).then(function (response) {
    if (!response.data.urls || !response.data.urls.length) return;
    var deferred = $q.defer();
    for (var i = 0; i < response.data.urls.length; i++) {
        response.data.urls[i] = response.data.urls[i].replace(/^\/modules\/(.*?).js$/, 'modules/$1');
    }
    require(response.data.urls, function () {
        deferred.resolve(Array.prototype.slice.apply(arguments));
    }, function() {
        console.log(arguments);
        deferred.reject();
    });
    return deferred.promise;
}, function() {
    console.log(arguments);
    console.log('Error loading AngularJS modules from Mango modules');
});

$q.all([userAndUserSettingsPromise, uiSettingsPromise, customDashboardSettingsPromise, angularModulesPromise]).then(function(data) {
    // destroy the services injector
    servicesInjector.get('$rootScope').$destroy();
    
    var MA_UI_SETTINGS = {};
    var user = data[0].user;
    var userMenuStore = data[0].userMenuStore;
    var defaultSettings = data[1];
    var customSettingsStore = data[2];
    var angularModules = data[3] || [];
    var customMenuItems = [];
    
    if (defaultSettings) {
        MA_UI_SETTINGS.defaultSettings = defaultSettings;
        angular.merge(MA_UI_SETTINGS, defaultSettings);
    }
    if (customSettingsStore) {
        MA_UI_SETTINGS.initialSettings = customSettingsStore.jsonData;
        angular.merge(MA_UI_SETTINGS, customSettingsStore.jsonData);
    }
    if (userMenuStore) {
        customMenuItems = userMenuStore.jsonData.menuItems;
    }
    
    uiApp.constant('MA_UI_SETTINGS', MA_UI_SETTINGS);
    uiApp.constant('MA_UI_CUSTOM_MENU_ITEMS', customMenuItems);
    uiApp.constant('MA_GOOGLE_ANALYTICS_PROPERTY_ID', MA_UI_SETTINGS.googleAnalyticsPropertyId);

    var angularJsModuleNames = ['uiApp'];
    for (var i = 0; i < angularModules.length; i++) {
        var angularModule = angularModules[i];
        angularJsModuleNames.push(angularModule.name);
    }
    
    angular.module('uiBootstrap', angularJsModuleNames).config(['UserProvider', function(UserProvider) {
        // store pre-bootstrap user into the User service
        UserProvider.setUser(user);
    }]);

    angular.element(document).ready(function() {
        angular.bootstrap(document.documentElement, ['uiBootstrap'], {strictDi: true});
    });
});

}); // define
