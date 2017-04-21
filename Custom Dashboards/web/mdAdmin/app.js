/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([
    'angular',
    'mango-3.5/maMaterialDashboards',
    'mango-3.5/maAppComponents',
    'require',
    './services/Page',
    './directives/pageView/pageView',
    './directives/liveEditor/livePreview',
    'moment-timezone',
    'angular-ui-router',
    'oclazyload',
    'angular-loading-bar',
    './views/docs/docs-setup'
], function(angular, maMaterialDashboards, maAppComponents, require, Page, pageView, livePreview, moment) {
'use strict';

var mdAdminApp = angular.module('mdAdminApp', [
    'oc.lazyLoad',
    'ui.router',
    'angular-loading-bar',
    'maMaterialDashboards',
    'maAppComponents',
    'ngMessages'
]);

loadLoginTranslations.$inject = ['Translate', 'MD_ADMIN_SETTINGS'];
function loadLoginTranslations(Translate, MD_ADMIN_SETTINGS) {
    return Translate.loadNamespaces('login').then(function(data) {
        moment.locale((MD_ADMIN_SETTINGS.user && MD_ADMIN_SETTINGS.user.locale) || data.locale || window.navigator.languages || window.navigator.language);
        moment.tz.setDefault(MD_ADMIN_SETTINGS.user ? MD_ADMIN_SETTINGS.user.getTimezone() : moment.tz.guess());
    });
}

mdAdminApp.factory('Page', Page)
    .directive('pageView', pageView)
    .directive('livePreview', livePreview)
    .constant('require', require)
    .constant('CUSTOM_USER_MENU_XID', 'custom-user-menu')
    .constant('CUSTOM_USER_PAGES_XID', 'custom-user-pages')
    .constant('DASHBOARDS_NG_DOCS', NG_DOCS);

mdAdminApp.provider('mangoState', ['$stateProvider', function mangoStateProvider($stateProvider) {
    this.addStates = function(menuItems, parent) {
        angular.forEach(menuItems, function(menuItem, parent) {
            if (menuItem.name || menuItem.state) {
                //menuItem.parent = parent;
                if (menuItem.linkToPage) {
                    delete menuItem.templateUrl;
                    menuItem.template = '<page-view xid="' + menuItem.pageXid + '"></page-view>';
                }
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
                        loginTranslations: loadLoginTranslations
                    }
                }

                try {
                    $stateProvider.state(menuItem);
                } catch (error) {
                    // state already exists
                }
            }

            this.addStates(menuItem.children, menuItem);
        }.bind(this));
    };

    // runtime dependencies for the service can be injected here, at the provider.$get() function.
    this.$get = [function() {
        return {
            addState: function(name, state) {
                $stateProvider.state(name, state);
            },
            addStates: this.addStates
        }
    }.bind(this)];
}]);

mdAdminApp.constant('MENU_ITEMS', [
    {
        name: 'dashboard',
        templateUrl: 'views/dashboard/main.html',
        abstract: true,
        menuHidden: true,
        resolve: {
            auth: ['Translate', 'MD_ADMIN_SETTINGS', function(Translate, MD_ADMIN_SETTINGS) {
                if (!MD_ADMIN_SETTINGS.user) {
                    throw 'No user';
                }
                return Translate.loadNamespaces(['dashboards', 'common']);
            }],
            loginTranslations: loadLoginTranslations,
            loadMyDirectives: ['rQ', '$ocLazyLoad', function(rQ, $ocLazyLoad) {
                return rQ(['./services/Menu',
                           './services/MenuEditor',
                           './directives/menu/jsonStoreMenu',
                           './directives/menu/dashboardMenu',
                           './directives/menu/menuLink',
                           './directives/menu/menuToggle',
                           './directives/menuEditor/menuEditor',
                           './directives/pageEditor/pageEditor',
                           './directives/liveEditor/liveEditor',
                           './directives/liveEditor/dualPaneEditor',
                           './directives/iframeView/iframeView',
                           './directives/stateParams/stateParams',
                           './directives/autoLoginSettings/autoLoginSettings'
                ], function(Menu, MenuEditor, jsonStoreMenu, dashboardMenu, menuLink, menuToggle,
                        menuEditor, pageEditor, liveEditor, dualPaneEditor, iframeView, stateParams, autoLoginSettings) {
                    angular.module('dashboard', ['ui.ace'])
                        .factory('Menu', Menu)
                        .factory('MenuEditor', MenuEditor)
                        .component('jsonStoreMenu', jsonStoreMenu)
                        .component('dashboardMenu', dashboardMenu)
                        .component('menuLink', menuLink)
                        .component('menuToggle', menuToggle)
                        .directive('menuEditor', menuEditor)
                        .directive('pageEditor', pageEditor)
                        .directive('liveEditor', liveEditor)
                        .directive('dualPaneEditor', dualPaneEditor)
                        .directive('iframeView', iframeView)
                        .directive('stateParams', stateParams)
                        .component('autoLoginSettings', autoLoginSettings);
                    $ocLazyLoad.inject('dashboard');
                });
            }]
        }
    },
    {
        name: 'dashboard.notFound',
        url: '/not-found?path',
        templateUrl: 'views/dashboard/notFound.html',
        menuHidden: true,
        menuTr: 'dashboards.v3.app.pageNotFound'
    },
    {
        name: 'login',
        url: '/login',
        templateUrl: 'views/login.html',
        menuHidden: true,
        menuIcon: 'exit_to_app',
        menuTr: 'header.login',
        resolve: {
            deps: ['rQ', '$ocLazyLoad', function(rQ, $ocLazyLoad) {
                return rQ(['./directives/login/login'], function(login) {
                    angular.module('login', [])
                        .directive('login', login);
                    $ocLazyLoad.inject('login');
                });
            }],
            loginTranslations: loadLoginTranslations
        }
    },
    {
        name: 'logout',
        url: '/logout',
        menuHidden: true,
        menuIcon: 'power_settings_new',
        menuTr: 'header.logout',
        template: '<div></div>'
    },
    {
        name: 'dashboard.home',
        url: '/home',
        templateUrl: 'views/dashboard/home.html',
        menuTr: 'dashboards.v3.dox.home',
        menuIcon: 'home'
    },
    {
        name: 'dashboard.mango3',
        menuTr: 'ui.menuItemText',
        menuIcon: 'insert_emoticon',
        template: '<div></div>'
    },
    {
        name: 'dashboard.pageMigration',
        url: '/page-migration',
        templateUrl: 'views/dashboard/pageMigration.html',
        menuText: 'Page migration',
        menuIcon: 'arrow_forward'
    },
    {
        name: 'dashboard.demoPage1',
        url: '/demo-page-1',
        linkToPage: true,
        pageXid: 'demo-page-1',
        menuText: 'Demo Page 1',
        menuIcon: 'favorite'
    },
    {
        name: 'dashboard.demoFolder',
        url: '/demo-folder',
        menuText: 'Demo Folder',
        menuIcon: 'folder',
        children: [
            {
                name: 'dashboard.demoFolder.demoPage2',
                url: '/demo-page-2',
                linkToPage: true,
                pageXid: 'demo-page-2',
                menuText: 'Demo Page 2',
                menuIcon: 'cake'
            }
        ]
    },
    {
        name: 'dashboard.apiErrors',
        url: '/api-errors',
        templateUrl: 'views/dashboard/errors.html',
        menuTr: 'dashboards.v3.dox.apiErrors',
        menuIcon: 'warning',
        menuHidden: true
    },
    {
        url: '/view-page/{pageXid}',
        name: 'dashboard.viewPage',
        template: '<page-view xid="{{pageXid}}"></page-view>',
        menuTr: 'dashboards.v3.app.viewPage',
        menuHidden: true,
        controller: ['$scope', '$stateParams', function ($scope, $stateParams) {
            $scope.pageXid = $stateParams.pageXid;
        }]
    },
    {
        url: '/settings',
        name: 'dashboard.settings',
        menuIcon: 'build',
        menuTr: 'dashboards.v3.app.adminTools',
        children: [
            {
                url: '/edit-pages/{pageXid}',
                name: 'dashboard.settings.editPages',
                templateUrl: 'views/dashboard/editPages.html',
                menuTr: 'dashboards.v3.app.editPages',
                menuIcon: 'dashboard',
                permission: 'edit-pages',
                params: {
                    markup: null,
                    templateUrl: null
                }
            },
            {
                url: '/edit-menu',
                name: 'dashboard.settings.editMenu',
                templateUrl: 'views/dashboard/editMenu.html',
                menuTr: 'dashboards.v3.app.editMenu',
                menuIcon: 'toc',
                permission: 'edit-menus'
            },
            {
                url: '/auto-login-settings',
                name: 'dashboard.settings.autoLoginSettings',
                templateUrl: 'views/dashboard/autoLoginSettings.html',
                menuTr: 'dashboards.v3.app.autoLoginSettings',
                menuIcon: 'face',
                permission: 'superadmin'
            }
        ]
    },
    {
        name: 'dashboard.examples',
        url: '/examples',
        menuTr: 'dashboards.v3.dox.examples',
        menuIcon: 'info',
        submenu: true,
        children: [
            {
                url: '/play-area',
                name: 'dashboard.examples.playArea',
                templateUrl: 'views/examples/playArea.html',
                menuTr: 'dashboards.v3.dox.playArea',
                menuIcon: 'fa-magic',
                params: {
                    markup: null
                }
            },
            {
                name: 'dashboard.examples.playAreaBig',
                templateUrl: 'views/examples/playAreaBig.html',
                url: '/play-area-big',
                menuTr: 'dashboards.v3.dox.playAreaBig',
                menuHidden: true,
                menuIcon: 'fa-magic'
            },
            {
                name: 'dashboard.examples.basics',
                url: '/basics',
                menuTr: 'dashboards.v3.dox.basics',
                menuIcon: 'fa-info-circle',
                children: [
                    {
                        name: 'dashboard.examples.basics.pagesAndMenu',
                        templateUrl: 'views/examples/pagesAndMenu.html',
                        url: '/pages-and-menu',
                        menuTr: 'dashboards.v3.dox.pagesAndMenu'
                    },
                    {
                        name: 'dashboard.examples.basics.createDashboard',
                        templateUrl: 'views/examples/createDashboard.html',
                        url: '/create-dashboard',
                        menuTr: 'dashboards.v3.dox.createDashboard'
                    },
                    {
                        name: 'dashboard.examples.basics.angular',
                        templateUrl: 'views/examples/angular.html',
                        url: '/angular',
                        menuTr: 'dashboards.v3.dox.angular'
                    },
                    {
                        name: 'dashboard.examples.basics.pointList',
                        templateUrl: 'views/examples/pointList.html',
                        url: '/point-list',
                        menuTr: 'dashboards.v3.dox.pointList'
                    },
                    {
                        name: 'dashboard.examples.basics.getPointByXid',
                        templateUrl: 'views/examples/getPointByXid.html',
                        url: '/get-point-by-xid',
                        menuTr: 'dashboards.v3.dox.getPointByXid'
                    },
                    {
                        name: 'dashboard.examples.basics.dataSourceAndDeviceList',
                        templateUrl: 'views/examples/dataSourceAndDeviceList.html',
                        url: '/data-source-and-device-list',
                        menuTr: 'dashboards.v3.dox.dataSourceAndDeviceList'
                    },
                    {
                        name: 'dashboard.examples.basics.liveValues',
                        templateUrl: 'views/examples/liveValues.html',
                        url: '/live-values',
                        menuTr: 'dashboards.v3.dox.liveValues'
                    },
                    {
                        name: 'dashboard.examples.basics.filters',
                        templateUrl: 'views/examples/filters.html',
                        url: '/filters',
                        menuTr: 'dashboards.v3.dox.filters'
                    },
                    {
                        name: 'dashboard.examples.basics.datePresets',
                        templateUrl: 'views/examples/datePresets.html',
                        url: '/date-presets',
                        menuTr: 'dashboards.v3.dox.datePresets'
                    },
                    {
                        name: 'dashboard.examples.basics.styleViaValue',
                        templateUrl: 'views/examples/styleViaValue.html',
                        url: '/style-via-value',
                        menuTr: 'dashboards.v3.dox.styleViaValue'
                    },
                    {
                        name: 'dashboard.examples.basics.pointValues',
                        templateUrl: 'views/examples/pointValues.html',
                        url: '/point-values',
                        menuTr: 'dashboards.v3.dox.pointValues'
                    },
                    {
                        name: 'dashboard.examples.basics.latestPointValues',
                        templateUrl: 'views/examples/latestPointValues.html',
                        url: '/latest-point-values',
                        menuTr: 'dashboards.v3.dox.latestPointValues'
                    },
                    {
                        name: 'dashboard.examples.basics.clocksAndTimezones',
                        templateUrl: 'views/examples/clocksAndTimezones.html',
                        url: '/clocks-and-timezones',
                        menuTr: 'dashboards.v3.dox.clocksAndTimezones'
                    }
                ]
            },
            {
                name: 'dashboard.examples.singleValueDisplays',
                url: '/single-value-displays',
                menuTr: 'dashboards.v3.dox.singleValueDisplays',
                menuIcon: 'fa-tachometer',
                children: [
                    {
                        name: 'dashboard.examples.singleValueDisplays.gauges',
                        templateUrl: 'views/examples/gauges.html',
                        url: '/gauges',
                        menuTr: 'dashboards.v3.dox.gauges'
                    },
                    {
                        name: 'dashboard.examples.singleValueDisplays.switchImage',
                        templateUrl: 'views/examples/switchImage.html',
                        url: '/switch-image',
                        menuTr: 'dashboards.v3.dox.switchImage'
                    },
                    {
                        name: 'dashboard.examples.singleValueDisplays.bars',
                        templateUrl: 'views/examples/bars.html',
                        url: '/bars',
                        menuTr: 'dashboards.v3.dox.bars'
                    },
                    {
                        name: 'dashboard.examples.singleValueDisplays.tanks',
                        templateUrl: 'views/examples/tanks.html',
                        url: '/tanks',
                        menuTr: 'dashboards.v3.dox.tanks'
                    }
                ]
            },
            {
                name: 'dashboard.examples.charts',
                url: '/charts',
                menuTr: 'dashboards.v3.dox.charts',
                menuIcon: 'fa-area-chart',
                children: [
                    {
                        name: 'dashboard.examples.charts.lineChart',
                        templateUrl: 'views/examples/lineChart.html',
                        url: '/line-chart',
                        menuTr: 'dashboards.v3.dox.lineChart'
                    },
                    {
                        name: 'dashboard.examples.charts.barChart',
                        templateUrl: 'views/examples/barChart.html',
                        url: '/bar-chart',
                        menuTr: 'dashboards.v3.dox.barChart'
                    },
                    {
                        name: 'dashboard.examples.charts.advancedChart',
                        templateUrl: 'views/examples/advancedChart.html',
                        url: '/advanced-chart',
                        menuTr: 'dashboards.v3.dox.advancedChart'
                    },
                    {
                        name: 'dashboard.examples.charts.stateChart',
                        templateUrl: 'views/examples/stateChart.html',
                        url: '/state-chart',
                        menuTr: 'dashboards.v3.dox.stateChart'
                    },
                    {
                        name: 'dashboard.examples.charts.liveUpdatingChart',
                        templateUrl: 'views/examples/liveUpdatingChart.html',
                        url: '/live-updating-chart',
                        menuTr: 'dashboards.v3.dox.liveUpdatingChart'
                    },
                    {
                        name: 'dashboard.examples.charts.pieChart',
                        templateUrl: 'views/examples/pieChart.html',
                        url: '/pie-chart',
                        menuTr: 'dashboards.v3.dox.pieChart'
                    },
                    {
                        name: 'dashboard.examples.charts.dailyComparison',
                        templateUrl: 'views/examples/dailyComparisonChart.html',
                        url: '/daily-comparison',
                        menuTr: 'dashboards.v3.dox.dailyComparisonChart'
                    }
                ]
            },
            {
                name: 'dashboard.examples.settingPointValues',
                url: '/setting-point-values',
                menuTr: 'dashboards.v3.dox.settingPoint',
                menuIcon: 'fa-pencil-square-o',
                children: [
                    {
                        name: 'dashboard.examples.settingPointValues.setPoint',
                        templateUrl: 'views/examples/setPoint.html',
                        url: '/set-point',
                        menuTr: 'dashboards.v3.dox.settingPoint'
                    },
                    {
                        name: 'dashboard.examples.settingPointValues.toggle',
                        templateUrl: 'views/examples/toggle.html',
                        url: '/toggle',
                        menuTr: 'dashboards.v3.dox.toggle'
                    },
                    {
                        name: 'dashboard.examples.settingPointValues.sliders',
                        templateUrl: 'views/examples/sliders.html',
                        url: '/sliders',
                        menuTr: 'dashboards.v3.dox.sliders'
                    },
                    {
                        name: 'dashboard.examples.settingPointValues.multistateRadio',
                        templateUrl: 'views/examples/multistateRadio.html',
                        url: '/multistate-radio-buttons',
                        menuTr: 'dashboards.v3.dox.multistateRadio'
                    }
                ]
            },
            {
                name: 'dashboard.examples.statistics',
                url: '/statistics',
                menuTr: 'dashboards.v3.dox.statistics',
                menuIcon: 'fa-table',
                children: [
                    {
                        name: 'dashboard.examples.statistics.getStatistics',
                        templateUrl: 'views/examples/getStatistics.html',
                        url: '/get-statistics',
                        menuTr: 'dashboards.v3.dox.getStatistics'
                    },
                    {
                        name: 'dashboard.examples.statistics.statisticsTable',
                        templateUrl: 'views/examples/statisticsTable.html',
                        url: '/statistics-table',
                        menuTr: 'dashboards.v3.dox.statisticsTable'
                    },
                    {
                        name: 'dashboard.examples.statistics.statePieChart',
                        templateUrl: 'views/examples/statePieChart.html',
                        url: '/state-pie-chart',
                        menuTr: 'dashboards.v3.dox.statePieChart'
                    }
                ]
            },
            {
                name: 'dashboard.examples.pointArrays',
                url: '/point-arrays',
                menuTr: 'dashboards.v3.dox.pointArrayTemplating',
                menuIcon: 'fa-list',
                children: [
                    {
                        name: 'dashboard.examples.pointArrays.buildPointArray',
                        templateUrl: 'views/examples/buildPointArray.html',
                        url: '/build-point-array',
                        menuTr: 'dashboards.v3.dox.buildPointArray'
                    },
                    {
                        name: 'dashboard.examples.pointArrays.pointArrayTable',
                        templateUrl: 'views/examples/pointArrayTable.html',
                        url: '/point-array-table',
                        menuTr: 'dashboards.v3.dox.pointArrayTable'
                    },
                    {
                        name: 'dashboard.examples.pointArrays.pointArrayLineChart',
                        templateUrl: 'views/examples/pointArrayLineChart.html',
                        url: '/point-array-line-chart',
                        menuTr: 'dashboards.v3.dox.pointArrayLineChart'
                    },
                    {
                        name: 'dashboard.examples.pointArrays.templating',
                        templateUrl: 'views/examples/templating.html',
                        url: '/templating',
                        menuTr: 'dashboards.v3.dox.templating'
                    },
                    {
                        name: 'dashboard.examples.pointArrays.dataPointTable',
                        templateUrl: 'views/examples/dataPointTable.html',
                        url: '/data-point-table',
                        menuTr: 'dashboards.v3.dox.dataPointTable'
                    }
                ]
            },
            {
                name: 'dashboard.examples.pointHierarchy',
                url: '/point-hierarchy',
                menuTr: 'dashboards.v3.dox.pointHierarchy',
                menuIcon: 'fa-sitemap',
                children: [
                    {
                        name: 'dashboard.examples.pointHierarchy.displayTree',
                        templateUrl: 'views/examples/displayTree.html',
                        url: '/display-tree',
                        menuTr: 'dashboards.v3.dox.displayTree'
                    },
                    {
                        name: 'dashboard.examples.pointHierarchy.pointHierarchyLineChart',
                        templateUrl: 'views/examples/pointHierarchyLineChart.html',
                        url: '/line-chart',
                        menuTr: 'dashboards.v3.dox.pointHierarchyLineChart'
                    }
                ]
            },
            {
                name: 'dashboard.examples.templates',
                url: '/templates',
                menuTr: 'dashboards.v3.dox.templates',
                menuIcon: 'fa-file-o',
                children: [
                    {
                        name: 'dashboard.examples.templates.angularMaterial',
                        templateUrl: 'views/examples/angularMaterial.html',
                        url: '/angular-material',
                        menuText: 'Angular Material'
                    },
                    {
                        name: 'dashboard.examples.templates.bootstrap',
                        templateUrl: 'views/examples/bootstrap.html',
                        url: '/bootstrap',
                        menuText: 'Bootstrap 3'
                    },
                    {
                        name: 'dashboard.examples.templates.autoLogin',
                        templateUrl: 'views/examples/autoLogin.html',
                        url: '/auto-login',
                        menuTr: 'dashboards.v3.dox.autoLogin'
                    },
                    {
                        name: 'dashboard.examples.templates.extendApp',
                        templateUrl: 'views/examples/extendApp.html',
                        url: '/extend-app',
                        menuTr: 'dashboards.v3.dox.extendApp'
                    },
                    {
                        name: 'dashboard.examples.templates.loginPage',
                        templateUrl: 'views/examples/loginPageTemplate.html',
                        url: '/login-page',
                        menuTr: 'dashboards.v3.dox.loginPageTemplate'
                    },
                    {
                        name: 'dashboard.examples.templates.adminTemplate',
                        templateUrl: 'views/examples/adminTemplate.html',
                        url: '/admin-template',
                        menuTr: 'dashboards.v3.dox.adminTemplate'
                    },
                    {
                        name: 'dashboard.examples.templates.adaptiveLayouts',
                        templateUrl: 'views/examples/adaptiveLayouts.html',
                        url: '/adaptive-layouts',
                        menuText: 'Adaptive Layouts'
                    }
                ]
            },
            {
                name: 'dashboard.examples.utilities',
                url: '/utilities',
                menuTr: 'dashboards.v3.dox.utilities',
                menuIcon: 'fa-wrench',
                children: [
                    {
                        name: 'dashboard.examples.utilities.translation',
                        templateUrl: 'views/examples/translation.html',
                        url: '/translation',
                        menuTr: 'dashboards.v3.dox.translation'
                    },
                    {
                        name: 'dashboard.examples.utilities.jsonStore',
                        templateUrl: 'views/examples/jsonStore.html',
                        url: '/json-store',
                        menuTr: 'dashboards.v3.dox.jsonStore'
                    },
                    {
                        name: 'dashboard.examples.utilities.watchdog',
                        templateUrl: 'views/examples/watchdog.html',
                        url: '/watchdog',
                        menuTr: 'dashboards.v3.dox.watchdog'
                    },
                    {
                        name: 'dashboard.examples.utilities.eventsTable',
                        templateUrl: 'views/examples/eventsTable.html',
                        url: '/events-table',
                        menuTr: 'dashboards.v3.dox.eventsTable'
                    }
                ]
            }
        ]
    },

]);

mdAdminApp.constant('DEFAULT_PAGES', [
    {
        xid: 'demo-page-1',
        name: 'Demo Page 1',
        editPermission: 'edit-pages',
        readPermission: 'user',
        markup: '<h1>Demo page 1</h1>\n<p>You can edit this page by clicking the pencil at the top right of the page.</p>'
    },
    {
        xid: 'demo-page-2',
        name: 'Demo Page 2',
        editPermission: 'edit-pages',
        readPermission: 'user',
        markup: '<h1>Demo page 2</h1>\n<p>You can edit this page by clicking the pencil at the top right of the page.</p>'
    }
]);

mdAdminApp.config([
    'MENU_ITEMS',
    'MD_ADMIN_SETTINGS',
    'DASHBOARDS_NG_DOCS',
    '$stateProvider',
    '$urlRouterProvider',
    '$ocLazyLoadProvider',
    '$httpProvider',
    '$mdThemingProvider',
    '$injector',
    '$compileProvider',
    'mangoStateProvider',
    '$locationProvider',
    '$mdAriaProvider',
    'errorInterceptorProvider',
function(MENU_ITEMS, MD_ADMIN_SETTINGS, DASHBOARDS_NG_DOCS, $stateProvider, $urlRouterProvider, $ocLazyLoadProvider,
        $httpProvider, $mdThemingProvider, $injector, $compileProvider, mangoStateProvider, $locationProvider, $mdAriaProvider, errorInterceptorProvider) {

    $compileProvider.debugInfoEnabled(false);
    $mdAriaProvider.disableWarnings();
    
    errorInterceptorProvider.ignore = function(rejection) {
        var ignoreUrls = ['/rest/v1/json-data/custom-user-menu',
                          '/rest/v1/json-data/custom-user-pages',
                          '/rest/v1/json-data/demo-page-1',
                          '/rest/v1/json-data/demo-page-2',
                          '/rest/v1/json-data/play-area-'];

        var url = rejection.config.url;
        
        if (url.indexOf('/rest/v1/users/current') >= 0) {
            if (rejection.config.method === 'OPTIONS')
                return true;
        }
        
        if (rejection.status === 404 && rejection.config.method === 'GET') {
            for (var i = 0; i < ignoreUrls.length; i++) {
                if (url.indexOf(ignoreUrls[i]) >= 0)
                    return true;
            }
        }
        return false;
    };

    $mdThemingProvider.definePalette('mango-orange', {
        '50': '#ffffff',
        '100': '#ffdfbd',
        '200': '#ffc485',
        '300': '#ffa23d',
        '400': '#ff941f',
        '500': '#ff8500',
        '600': '#e07500',
        '700': '#c26500',
        '800': '#a35500',
        '900': '#854500',
        'A100': '#ffba6f',
        'A200': '#ff921c',
        'A400': '#ff8500',
        'A700': '#da7200',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': '50 100 200 300 A100'
    });

    $mdThemingProvider.definePalette('mango-blue', {
        '50': '#f9fdff',
        '100': '#ade8ff',
        '200': '#75d9ff',
        '300': '#2dc5ff',
        '400': '#0fbdff',
        '500': '#00adef',
        '600': '#0097d0',
        '700': '#0081b2',
        '800': '#006b93',
        '900': '#005475',
        'A100': '#6dcaed',
        'A200': '#24bbf5',
        'A400': '#00adef',
        'A700': '#006389',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': '50 100 200 300 A100'
    });

    $mdThemingProvider
        .theme('mangoDefault')
        .primaryPalette('mango-blue', {
            'default': '500',
            'hue-1': '300',
            'hue-2': '800',
            'hue-3': '100'
        })
        .accentPalette('mango-orange', {
            'default': 'A400',
            'hue-1': 'A100',
            'hue-2': 'A200',
            'hue-3': 'A700'
        });

    $mdThemingProvider
        .theme('mangoInverse')
        .primaryPalette('mango-orange', {
            'default': '500',
            'hue-1': '300',
            'hue-2': '800',
            'hue-3': '100'
        })
        .accentPalette('mango-blue', {
            'default': 'A400',
            'hue-1': 'A100',
            'hue-2': 'A200',
            'hue-3': 'A700'
        });

    $mdThemingProvider.setDefaultTheme('mangoDefault');

    $httpProvider.interceptors.push('errorInterceptor');

    if ($injector.has('$mdpTimePickerProvider')) {
        var $mdpTimePickerProvider = $injector.get('$mdpTimePickerProvider');
        /*
        $mdpTimePickerProvider.setOKButtonLabel();
        $mdpTimePickerProvider.setCancelButtonLabel();
        */
    }

    $ocLazyLoadProvider.config({
        debug: false,
        events: true,
    });

    //$stateProvider.reloadOnSearch = false;
    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise(function($injector, $location) {
        var MD_ADMIN_SETTING = $injector.get('MD_ADMIN_SETTINGS');
        var $state = $injector.get('$state');
        var user = MD_ADMIN_SETTINGS.user;
        
        var path = '/dashboards/';
        if ($location.path()) {
            path += $location.path().substring(1);
        }
        
        if (!user) {
            $state.loginRedirectUrl = path;
            return '/login';
        }
        
        if (path === '/dashboards/') {
            var homeUrl = user.homeUrl;
            if (homeUrl && homeUrl.indexOf('/dashboards') === 0) {
                return homeUrl.substring(11); // strip dashboards from start of url
            }
            if (MD_ADMIN_SETTINGS.defaultUrl) {
                return MD_ADMIN_SETTINGS.defaultUrl;
            }
            return '/home';
        }

        return '/not-found?path=' + encodeURIComponent(path);
    });

    var docsParent = {
        name: 'dashboard.docs',
        url: '/docs',
        menuText: 'API Docs',
        menuIcon: 'book',
        submenu: true,
        children: [],
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
    MENU_ITEMS.push(docsParent);

    var DOCS_PAGES = DASHBOARDS_NG_DOCS.pages;
    var moduleItem = {};

    // Loop through and create array of children based on moduleName
    var modules = DOCS_PAGES.map(function(page) {return page.moduleName})
    .filter(function(item, index, array) {
        return index == array.indexOf(item);
    });

    // Create module menu items & states
    modules.forEach(function(item, index, array) {
        var dashCaseUrl = item.replace(/[A-Z]/g, function(c) { return '-' + c.toLowerCase(); });

        var menuText = item;
        if (item==='maDashboards') { menuText = 'Directives' }
        else if (item==='maFilters') { menuText = 'Filters' }
        else if (item==='maServices') { menuText = 'Services' }

        var menuItem = {
            name: 'dashboard.docs.' + item,
            url: '/' + dashCaseUrl,
            menuText: menuText,
            children: []
        };

        moduleItem[item] = menuItem;

        docsParent.children.push(menuItem);
    });

    // Create 3rd level directives/services/filters docs pages
    // First remove module items
    var components = DOCS_PAGES.map(function(page) {return page.id})
    .filter(function(item, index, array) {
        return item.indexOf('.') !== -1;
    });

    // Add each component item
    components.forEach(function(item, index, array) {
        var splitAtDot = item.split('.');
        var dashCaseUrl = splitAtDot[1].replace(/[A-Z]/g, function(c) { return '-' + c.toLowerCase(); });
		if(dashCaseUrl.charAt(0) === '-') { dashCaseUrl = dashCaseUrl.slice(1)}
        var menuText = splitAtDot[1];
        if (splitAtDot[0] === 'maDashboards') { menuText = dashCaseUrl}
        var menuItem = {
            name: 'dashboard.docs.' + item,
            templateUrl: require.toUrl('./views/docs/' + item + '.html'),
            url: '/' + dashCaseUrl,
            menuText: menuText
        };
        moduleItem[splitAtDot[0]].children.push(menuItem);
    });

    mangoStateProvider.addStates(MENU_ITEMS);
    if (MD_ADMIN_SETTINGS.customMenuItems)
        mangoStateProvider.addStates(MD_ADMIN_SETTINGS.customMenuItems);
}]);

mdAdminApp.run([
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
    'MD_ADMIN_SETTINGS',
    'Translate',
    '$window',
function(MENU_ITEMS, $rootScope, $state, $timeout, $mdSidenav, $mdMedia, $mdColors, $MD_THEME_CSS, cssInjector,
        $mdToast, User, MD_ADMIN_SETTINGS, Translate, $window) {

    $rootScope.mdAdmin = MD_ADMIN_SETTINGS;
    $rootScope.user = MD_ADMIN_SETTINGS.user;
    $rootScope.menuItems = MENU_ITEMS;
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

    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
        if (error && (error === 'No user' || error.status === 401 || error.status === 403)) {
            event.preventDefault();
            $state.loginRedirectUrl = $state.href(toState, toParams);
            $state.go('login');
        } else {
            console.log(error);
        }
    });

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
        
        if (toState !== fromState) {
            var contentDiv = document.querySelector('.main-content');
            if (contentDiv) {
                contentDiv.scrollTop = 0;
            }
        }
    });

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if (toState.name === 'dashboard.mango3') {
            $window.open('/ui/', '_self');
            return;
        }
        if ($state.includes('dashboard') && !$rootScope.navLockedOpen) {
            $rootScope.closeMenu();
        }
        if (toState.name === 'logout') {
            event.preventDefault();
            User.logout().$promise.then(null, function() {
                // consume error
            }).then(function() {
                $rootScope.user = null;
                MD_ADMIN_SETTINGS.user = null;
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

        if (current.status !== 'STARTING_UP' && current.status === previous.status)
            return;

        switch(current.status) {
        case 'API_DOWN':
            message = Translate.trSync('login.dashboards.v3.app.apiDown');
            MD_ADMIN_SETTINGS.user = null;
            break;
        case 'STARTING_UP':
            if (current.status === previous.status && current.info.startupProgress === previous.info.startupProgress
                    && current.info.startupState === previous.info.startupState) {
                return;
            }
            message = Translate.trSync('login.dashboards.v3.app.startingUp', [current.info.startupProgress, current.info.startupState]);
            MD_ADMIN_SETTINGS.user = null;
            break;
        case 'API_ERROR':
            message = Translate.trSync('login.dashboards.v3.app.returningErrors');
            MD_ADMIN_SETTINGS.user = null;
            break;
        case 'API_UP':
            if (previous.status && previous.status !== 'LOGGED_IN') {
                message = Translate.trSync('login.dashboards.v3.app.connectivityRestored');
                hideDelay = 5000;
            }
            MD_ADMIN_SETTINGS.user = null;

            // do automatic re-login if we are not on the login page
            if (!$state.includes('login')) {
                User.autoLogin().then(function(user) {
                    MD_ADMIN_SETTINGS.user = user;
                    if (user.locale)
                        moment.locale(user.locale);
                    moment.tz.setDefault(user.getTimezone());
                }, function() {
                    // redirect to the login page if auto-login fails
                    $state.loginRedirectUrl = '/dashboards' + $location.url();
                    $state.go('login');
                    //window.location = $state.href('login');
                });
            }
            break;
        case 'LOGGED_IN':
            // occurs almost simultaneously with API_UP message, only display if we didn't hit API_UP state
            if (previous.status && previous.status !== 'API_UP') {
                message = Translate.trSync('login.dashboards.v3.app.connectivityRestored');
                hideDelay = 5000;
            }
            if (!MD_ADMIN_SETTINGS.user) {
                // user logged in elsewhere
                User.current().$promise.then(function(user) {
                    MD_ADMIN_SETTINGS.user = user;
                    if (user.locale)
                        moment.locale(user.locale);
                    moment.tz.setDefault(user.getTimezone());
                });
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
}]);

// Get an injector for the maServices app and use the JsonStore service to retrieve the
// custom user menu items from the REST api prior to bootstrapping the main application.
// This is so the states can be added to the stateProvider in the config block for the
// main application. If the states are added after the main app runs then the user may
// not navigate directly to one of their custom states on startup
var servicesInjector = angular.injector(['maServices'], true);
var User = servicesInjector.get('User');
var JsonStore = servicesInjector.get('JsonStore');

var mdAdminSettings = {};

User.current().$promise.then(null, function() {
    return User.autoLogin();
}).then(function(user) {
    mdAdminSettings.user = user;
    return JsonStore.get({xid: 'custom-user-menu'}).$promise;
}).then(function(store) {
    mdAdminSettings.customMenuItems = store.jsonData.menuItems;
    mdAdminSettings.defaultUrl = store.jsonData.defaultUrl;
}).then(null, function() {
    // consume error
}).then(function() {
    servicesInjector.get('$rootScope').$destroy();
    mdAdminApp.constant('MD_ADMIN_SETTINGS', mdAdminSettings);
    angular.element(document).ready(function() {
        angular.bootstrap(document.documentElement, ['mdAdminApp'], {strictDi: true});
    });
});

}); // define
