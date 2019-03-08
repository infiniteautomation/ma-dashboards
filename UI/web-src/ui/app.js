/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import '../ngMango/ngMangoMaterial';
import menuProvider from './services/menu';
import pagesFactory from './services/pages';
import dateBarFactory from './services/dateBar';
import uiSettingsProvider from './services/uiSettings';
import loginRedirectorProvider from './services/loginRedirector';
import serverInfoProvider from './services/serverInfo';
import pageView from './directives/pageView/page_view';
import livePreview from './directives/liveEditor/livePreview';
import iframeView from './directives/iframeView/iframeView';
import menuItems from './menuItems';
import 'moment-timezone';
import 'angular-ui-router';
import 'angular-ui-sortable';
import 'angular-loading-bar';
import '../docs/ngMango/js/docs-setup';
import 'md-color-picker';
import * as constants from './constants.js';

import 'angular-loading-bar/build/loading-bar.css';
import 'md-color-picker/dist/mdColorPicker.css';
import './styles/fonts.css';
import './styles/main.css';

const uiApp = angular.module('maUiApp', [
    'ui.router',
    'ui.sortable',
    'angular-loading-bar',
    'ngMangoMaterial',
    'ngMessages',
    'mdColorPicker'
]);

uiApp.provider('maUiMenu', menuProvider)
    .provider('maUiSettings', uiSettingsProvider)
    .factory('maUiPages', pagesFactory)
    .factory('maUiDateBar', dateBarFactory)
    .provider('maUiLoginRedirector', loginRedirectorProvider)
    .provider('maUiServerInfo', serverInfoProvider)
    .directive('maUiPageView', pageView)
    .directive('maUiLivePreview', livePreview)
    .directive('maUiIframeView', iframeView)
    .constant('MA_UI_NG_DOCS', window.NG_DOCS)
    .constant('MA_UI_MENU_ITEMS', menuItems);

Object.keys(constants).forEach(name => {
    uiApp.constant(name, constants[name]);
});

// override constant from ngMango module
uiApp.constant('MA_EVENT_LINK_INFO', {
    DATA_POINT: {
        icon: 'timeline',
        tooltipTranslation: 'ui.app.dpd',
        stateName: 'ui.dataPointDetails',
        stateParams: event => {
            return { pointId: event.eventType.dataPointId };
        }
    },
    DATA_SOURCE: {
        icon: 'device_hub',
        tooltipTranslation: 'header.dataSources',
        stateName: 'ui.settings.dataSources',
        stateParams: event => ({dataSourceId: event.eventType.dataSourceId})
    },
    LICENSE_CHECK: {
        icon: 'extension',
        tooltipTranslation: 'header.modules',
        stateName: 'ui.settings.modules',
        stateParams: event => ({})
    },
    EVENT_HANDLERS_LINK: {
        stateName: 'ui.settings.eventHandlers',
        stateParams: event => ({event})
    }
});

uiApp.config([
    'MA_UI_NG_DOCS',
    '$urlRouterProvider',
    '$httpProvider',
    '$compileProvider',
    '$locationProvider',
    '$mdAriaProvider',
    'cfpLoadingBarProvider',
    'maUiMenuProvider',
    '$anchorScrollProvider',
function(MA_UI_NG_DOCS, $urlRouterProvider,
        $httpProvider, $compileProvider, $locationProvider, $mdAriaProvider,
        cfpLoadingBarProvider,
        maUiMenuProvider, $anchorScrollProvider) {

    $compileProvider.debugInfoEnabled(false);
    $compileProvider.commentDirectivesEnabled(false);
    $compileProvider.cssClassDirectivesEnabled(false);
    
    $mdAriaProvider.disableWarnings();

    $httpProvider.useApplyAsync(true);
    
    $anchorScrollProvider.disableAutoScrolling();

    /*
    if ($injector.has('$mdpTimePickerProvider')) {
        const $mdpTimePickerProvider = $injector.get('$mdpTimePickerProvider');
        $mdpTimePickerProvider.setOKButtonLabel();
        $mdpTimePickerProvider.setCancelButtonLabel();
    }
    */

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise(($injector, $location) => {
        const maUiLoginRedirector = $injector.get('maUiLoginRedirector');
        return maUiLoginRedirector.handleUnknownPath($location.path());
    });

    const apiDocsMenuItems = [];
    const docsParent = {
        name: 'ui.docs',
        url: '/docs',
        menuTr: 'ui.dox.apiDocs',
        menuIcon: 'book',
        menuHidden: true,
        submenu: true,
        weight: 2002,
        params: {
            sidebar: null
        }
    };
    apiDocsMenuItems.push(docsParent);

    const DOCS_PAGES = MA_UI_NG_DOCS.pages;

    // Loop through and create array of children based on moduleName
    const moduleNames = new Set(DOCS_PAGES.map(page => page.moduleName));

    // Create module menu items & states
    Array.from(moduleNames).forEach(item => {
        const dashCaseUrl = item.replace(/[A-Z]/g, c => '-' + c.toLowerCase());

        let menuProperty = 'menuTr';
        let menuValue;
        
        if (item === 'ngMango') {
            menuValue = 'ui.dox.components';
        } else if (item === 'ngMangoFilters') {
            menuValue = 'ui.dox.filters';
        } else if (item === 'ngMangoServices') {
            menuValue = 'ui.dox.services';
        } else {
            menuValue = item;
            menuProperty = 'menuText';
        }

        apiDocsMenuItems.push({
            name: 'ui.docs.' + item,
            url: '/' + dashCaseUrl,
            [menuProperty]: menuValue
        });
    });

    // Create 3rd level directives/services/filters docs pages
    // First remove module items
    const components = DOCS_PAGES.map(page => page.id)
    .filter(id => id.indexOf('.') >= 0);

    // Add each component item
    components.forEach(item => {
        const matches = /^(.+?)\.(.+?)(?::(.+?))?$/.exec(item);
        if (matches) {
            const moduleName = matches[1];
            const serviceName = matches[2];
            let directiveName;
            if (matches.length > 3)
                directiveName = matches[3];
            
            const name = directiveName || serviceName;
            
            let dashCaseUrl = name.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
            while (dashCaseUrl.charAt(0) === '-') {
                dashCaseUrl = dashCaseUrl.slice(1);
            }

            let templateUrl = moduleName + '.' + serviceName;
            if (directiveName) templateUrl += '.' + directiveName;

            const menuItem = {
                name: 'ui.docs.' + moduleName + '.' + name,
                url: '/' + dashCaseUrl,
                menuText: name,
                resolve: {
                    viewTemplate: () => {
                        return import(/* webpackMode: "lazy-once", webpackChunkName: "ui.docs" */
                                '../docs/ngMango/partials/api/' + templateUrl + '.html');
                    }
                }
            };
            apiDocsMenuItems.push(menuItem);
        }
    });
    
    maUiMenuProvider.registerMenuItems(apiDocsMenuItems);

    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
}]);

uiApp.run([
    '$rootScope',
    '$state',
    '$timeout',
    '$mdSidenav',
    '$mdMedia',
    'localStorageService',
    '$mdToast',
    'maUser',
    'maUiSettings',
    'maTranslate',
    '$location',
    '$stateParams',
    'maUiDateBar',
    '$document',
    '$mdDialog',
    'maWebAnalytics',
    '$window',
    'maModules',
    'maMath',
    '$log',
    '$templateCache',
    '$exceptionHandler',
    'maUiLoginRedirector',
    '$anchorScroll',
function($rootScope, $state, $timeout, $mdSidenav, $mdMedia, localStorageService,
        $mdToast, User, uiSettings, Translate, $location, $stateParams, maUiDateBar, $document, $mdDialog,
        webAnalytics, $window, maModules, mathjs, $log, $templateCache, $exceptionHandler, maUiLoginRedirector,
        $anchorScroll) {

    if (uiSettings.googleAnalyticsPropertyId) {
        webAnalytics.enableGoogleAnalytics(uiSettings.googleAnalyticsPropertyId);
    }

    uiSettings.generateTheme();
    $rootScope.stateParams = $stateParams;
    $rootScope.dateBar = maUiDateBar;
    $rootScope.uiSettings = uiSettings;
    $rootScope.User = User;
    $rootScope.Math = Math;
    $rootScope.mathjs = mathjs;
    $rootScope.$mdMedia = $mdMedia;
    $rootScope.$state = $state;
    $rootScope.pageOpts = {};
    $rootScope.$log = $log;

    $rootScope.openHelp = function(helpPageState) {
        if (!helpPageState && $state.params.helpPage) {
            helpPageState = $state.get($state.params.helpPage);
        }
        
        if (!helpPageState) {
            $rootScope.closeHelp();
            return;
        }
        
        $rootScope.pageOpts.newWindowHelpUrl = $state.href(helpPageState);
        
        if (helpPageState.templateUrl) {
            this.pageOpts.helpUrl = helpPageState.templateUrl;
        } else if (helpPageState.template) {
            this.pageOpts.helpUrl = getTemplateUrl(helpPageState, helpPageState.template);
        } else if (helpPageState.resolve && helpPageState.resolve.viewTemplate) {
            // load the view template via the resolve promise
            helpPageState.resolve.viewTemplate().then((viewTemplate) => {
                // resolve promise is a ES6 promise not AngularJS $q promise, call $apply
                $rootScope.$apply(() => {
                    // put the template in the cache and then set the help url
                    this.pageOpts.helpUrl = getTemplateUrl(helpPageState, viewTemplate.default);
                });
            });
        }
        
        function getTemplateUrl(state, template) {
            const templateUrl = `${state.name}.tmpl.html`;
            
            if (!$templateCache.get(templateUrl)) {
                $templateCache.put(templateUrl, template);
            }
            
            delete state.template;
            if (state.resolve) {
                delete state.resolve.viewTemplate;
            }
            
            return (state.templateUrl = templateUrl);
        }
    };
    
    $rootScope.closeHelp = function() {
        $rootScope.pageOpts.helpUrl = null;
    };
    
    $rootScope.scrollHelp = function() {
        const helpMdContent = document.querySelector('.ma-help-sidebar md-content');
        if (helpMdContent) {
            helpMdContent.scrollTop = 0;
            
            // if help pane contains the hash element scroll to it
            const hash = $location.hash();
            if (hash && helpMdContent.querySelector('#' + hash)) {
                $anchorScroll();
            }
        }
    };

    $rootScope.titleSuffix = 'Mango v3';
    $rootScope.setTitleText = function setTitleText() {
        if ($state.$current.menuText) {
            this.titleText = $state.$current.menuText + ' - ' + this.titleSuffix;
        } else if ($state.$current.menuTr) {
            Translate.tr($state.$current.menuTr).then(text => {
                this.titleText = text + ' - ' + this.titleSuffix;
            }, () => {
                this.titleText = this.titleSuffix;
            });
        } else {
            this.titleText = this.titleSuffix;
        }
    };
    
    $rootScope.goToState = function($event, stateName, stateParams) {
        // ignore if it was a middle click, i.e. new tab
        if ($event.which !== 2) {
            $event.preventDefault();
            $state.go(stateName, stateParams);
        }
    };

    $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
        event.preventDefault();
        if (error && (error instanceof User.NoUserError || error.status === 401 || error.status === 403)) {
            maUiLoginRedirector.saveState(toState, toParams);
            $state.go('login');
        } else {
            $exceptionHandler(error, 'Error transitioning to state ' + (toState && toState.name));

            if (toState.name !== 'ui.error') {
                $state.go('ui.error', {toState, toParams, fromState, fromParams, error});
            }
        }
    });

    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
        if (toState.href) {
            event.preventDefault();
            $window.open(toState.href, toState.target || '_self');
            return;
        }
        
        if ($state.includes('ui') && !$rootScope.navLockedOpen) {
            $rootScope.closeMenu();
        }
        
        if (toState.name === 'logout') {
            event.preventDefault();
            // consume error
            User.logout().$promise.then(null, error => null).then(() => {
                $state.go('login');
            });
        }

        if (toState.name === 'ui.settings.system') {
            event.preventDefault();
            $state.go('ui.settings.system.systemInformation', toParams);
        }

        if (toState.name === 'ui.settings.systemStatus') {
            event.preventDefault();
            $state.go('ui.settings.systemStatus.loggingConsole', toParams);
        }

        if (toState.name.indexOf('ui.help.') === 0 || toState.name.indexOf('ui.docs.') === 0) {
            const linkBetweenPages = toState.name.indexOf('ui.help.') === 0 && $state.includes('ui.help') ||
                toState.name.indexOf('ui.docs.') === 0 && $state.includes('ui.docs');

            const openInSidebar = $state.includes('ui') && (toParams.sidebar != null ? toParams.sidebar : !linkBetweenPages);
            if (openInSidebar) {
                // stay on current page and load help page into sidebar
                event.preventDefault();
                $rootScope.openHelp(toState);
            } else {
                $rootScope.closeHelp();
            }
        }
    });
    
    $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
        const crumbs = [];
        let state = $state.$current;
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
        maUiDateBar.rollupTypesFilter = {};
        
        $rootScope.stateNameClass = toState.name.replace(/\./g, '_');

        // if help is already open or the helpOpen param is true the new page's help
        if ($rootScope.pageOpts.helpUrl || toParams.helpOpen) {
            $rootScope.openHelp();
        }
    });

    // when this event is fired the elements appear to be in the DOM but there can be two ui-view components
    // (when reloading) the old one is still being removed and the new one is not compiled yet
    $rootScope.$on('$viewContentLoaded', (event, view) => {
        // store the view name so we can get it below
        event.targetScope.$viewName = view;
    });

    // this event is fired after all the elements are compiled and in the DOM
    $rootScope.$on('$viewContentAnimationEnded', event => {
        // we dont get the view name for this event, get it from where we stored it in $viewName
        const view = event.targetScope.$viewName;

        if (view === '@ui') {
            if ($mdMedia('gt-sm')) {
                const uiPrefs = localStorageService.get('uiPreferences');
                if (!uiPrefs || !uiPrefs.menuClosed) {
                    $rootScope.openMenu();
                }
            }
            
            // ensure the sidenav is in in the DOM (it should be)
            if (document.querySelector('[md-component-id=left]')) {
                // the closeMenu() function already does this but we need this for when the ESC key is pressed
                // which just calls $mdSidenav(..).close();
                $mdSidenav('left').onClose(() => {
                    $rootScope.navLockedOpen = false;
                });
            }

        }
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }

        const hash = $location.hash();
        if (hash) {
            const anchorElement = document.getElementById(hash);
            if (anchorElement) {
                $timeout(() => {
                    $anchorScroll(hash);
                }, 0);
            }
        }
    });

    // automatically open or close the menu when the screen size is changed
    $rootScope.$watch($mdMedia.bind($mdMedia, 'gt-sm'), (gtSm, prev) => {
        if (gtSm === prev) return; // ignore first "change"
        if (!$state.includes('ui')) return; // nothing to do if menu not visible
        
        const sideNav = $mdSidenav('left');
        const uiPrefs = localStorageService.get('uiPreferences') || {};
        
        // window expanded
        if (gtSm && !uiPrefs.menuClosed && !sideNav.isOpen()) {
            $rootScope.openMenu();
        }
        // window made smaller
        if (!gtSm && sideNav.isOpen()) {
            $rootScope.closeMenu();
        }
    });
    
    $rootScope.toggleMenu = function() {
        const sideNav = $mdSidenav('left');
        const uiPrefs = localStorageService.get('uiPreferences') || {};
        
        if (sideNav.isOpen()) {
            uiPrefs.menuClosed = true;
            this.closeMenu();
        } else {
            uiPrefs.menuClosed = false;
            this.openMenu();
        }
        
        // we dont update the preferences when on a small screen as the nav is never locked open or closed
        if ($mdMedia('gt-sm')) {
            localStorageService.set('uiPreferences', uiPrefs);
        }
        angular.element('#menu-button').blur();
    };

    $rootScope.closeMenu = function() {
        $rootScope.navLockedOpen = false;
        if ($state.includes('ui')) {
            $mdSidenav('left').close();
        }
    };

    $rootScope.openMenu = function() {
        if ($mdMedia('gt-sm')) {
            $rootScope.navLockedOpen = true;
        }
        if ($state.includes('ui')) {
            $mdSidenav('left').open();
        }
    };
    
    if (User.current && User.current.admin) {
        maModules.startAvailableUpgradeCheck();
    }
    
    // TODO fix this firing first watchdog event occurs, mangoDefaultUri property is different
    User.notificationManager.subscribeLocal((event, user, first) => {
        if (user && user.admin) {
            if (!maModules.availableUpgradeCheckRunning()) {
                maModules.startAvailableUpgradeCheck();
            }
        } else {
            maModules.cancelAvailableUpgradeCheck();
        }
    }, $rootScope, ['userChanged']);
    
    /**
     * Watchdog timer alert and re-connect/re-login code
     */

    $rootScope.$on('maWatchdog', (event, current, previous) => {
        let message;
        let hideDelay = 0; // dont auto hide message

        switch(current.status) {
        case 'API_DOWN':
            message = Translate.trSync('login.ui.app.apiDown');
            break;
        case 'STARTING_UP':
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
                User.autoLogin().then(null, error => {
                    // close dialogs
                    $mdDialog.cancel();
                    
                    // redirect to the login page if auto-login fails
                    maUiLoginRedirector.saveCurrentState();
                    $state.go('login');
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
            const toast = $mdToast.simple()
                .textContent(message)
                .action(Translate.trSync('login.ui.app.ok'))
                .highlightAction(true)
                .position('bottom center')
                .hideDelay(hideDelay);
            $mdToast.show(toast);
        }
    });
    
    // stops window to navigating to a file when dropped on root document
    $document.on('dragover drop', $event => false);

    $rootScope.appLoading = false;
}]);

export default uiApp;
