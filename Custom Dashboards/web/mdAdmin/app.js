/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([
    'angular',
    'mango-3.0/maMaterialDashboards',
    'mango-3.0/maAppComponents',
    'require',
    'angular-ui-router',
    'oclazyload',
    'angular-loading-bar',
    './views/docs/docs-setup'
], function(angular, maMaterialDashboards, maAppComponents, require) {
'use strict';

var mdAdminApp = angular.module('mdAdminApp', [
    'oc.lazyLoad',
    'ui.router',
    'angular-loading-bar',
    'maMaterialDashboards',
    'maAppComponents',
    'ngMessages'
]);

mdAdminApp.constant('require', require);
mdAdminApp.constant('CUSTOM_USER_MENU_XID', 'custom-user-menu');
mdAdminApp.constant('CUSTOM_USER_PAGES_XID', 'custom-user-pages');
mdAdminApp.constant('DASHBOARDS_NG_DOCS', NG_DOCS);

mdAdminApp.provider('mangoState', ['$stateProvider', function mangoStateProvider($stateProvider) {
    this.addStates = function(menuItems, parent) {
        angular.forEach(menuItems, function(menuItem, area) {
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

                try {
                    $stateProvider.state(menuItem);
                } catch (error) {
                    // state already exists
                }
            }

            this.addStates(menuItem.children, menuItem);
        }.bind(this));
    }

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
            auth: ['$rootScope', 'User', function($rootScope, User) {
                $rootScope.user = User.current();
                return $rootScope.user.$promise;
            }],
            loadMyDirectives: ['rQ', '$ocLazyLoad', function(rQ, $ocLazyLoad) {
                return rQ(['./services/Menu',
                           './services/Page',
                           './services/MenuEditor',
                           './directives/menu/jsonStoreMenu',
                           './directives/menu/dashboardMenu',
                           './directives/menu/menuLink',
                           './directives/menu/menuToggle',
                           './directives/menuEditor/menuEditor',
                           './directives/pageEditor/pageEditor',
                           './directives/liveEditor/liveEditor',
                           './directives/liveEditor/livePreview',
                           './directives/liveEditor/dualPaneEditor',
                           './directives/pageView/pageView',
                           './directives/iframeView/iframeView'
                ], function(Menu, Page, MenuEditor, jsonStoreMenu, dashboardMenu, menuLink, menuToggle,
                        menuEditor, pageEditor, liveEditor, livePreview, dualPaneEditor, pageView, iframeView) {
                    angular.module('dashboard', ['ui.ace'])
                        .factory('Menu', Menu)
                        .factory('Page', Page)
                        .factory('MenuEditor', MenuEditor)
                        .component('jsonStoreMenu', jsonStoreMenu)
                        .component('dashboardMenu', dashboardMenu)
                        .component('menuLink', menuLink)
                        .component('menuToggle', menuToggle)
                        .directive('menuEditor', menuEditor)
                        .directive('pageEditor', pageEditor)
                        .directive('liveEditor', liveEditor)
                        .directive('livePreview', livePreview)
                        .directive('dualPaneEditor', dualPaneEditor)
                        .directive('pageView', pageView)
                        .directive('iframeView', iframeView);
                    $ocLazyLoad.inject('dashboard');
                });
            }],
            dashboardTranslations: ['Translate', function(Translate) {
                return Translate.loadNamespaces(['dashboards', 'common']);
            }]
        }
    },
    {
        name: 'login',
        url: '/login',
        templateUrl: 'views/login.html',
        menuHidden: true,
        menuIcon: 'fa fa-sign-in',
        menuTr: 'header.login',
        resolve: {
            deps: ['rQ', '$ocLazyLoad', function(rQ, $ocLazyLoad) {
                return rQ(['./directives/login/login'], function(login) {
                    angular.module('login', [])
                        .directive('login', login);
                    $ocLazyLoad.inject('login');
                });
            }],
            loginTranslations: ['Translate', function(Translate) {
                return Translate.loadNamespaces('login');
            }]
        }
    },
    {
        name: 'dashboard.home',
        url: '/home',
        templateUrl: 'views/dashboard/home.html',
        menuTr: 'dashboards.v3.dox.home',
        menuIcon: 'fa fa-home'
    },
    {
        name: 'dashboard.watchlist',
        url: '/watchlist',
        templateUrl: 'views/dashboard/watchlist.html',
        menuText: 'Watch List',
        menuIcon: 'fa fa-eye',
        resolve: {
            loadMyDirectives: ['rQ', '$ocLazyLoad', function(rQ, $ocLazyLoad) {
                return rQ(['./directives/watchList/watchListTable',
                           './directives/watchList/watchListChart'
                ], function(watchListTable, watchListChart, maxFilter) {
                    angular.module('watchlist', [])
                        .directive('watchListTable', watchListTable)
                        .directive('watchListChart', watchListChart)
                        .filter('noNaN', function () {
                                return function (input, suffix) {
                                      if (isNaN(input)) { return '...'; }
                                      else { return input.toFixed(1) + suffix; }
                                }
                          });
                    $ocLazyLoad.inject('watchlist');
                });
            }]
        }
    },
    {
        name: 'dashboard.apiErrors',
        url: '/api-errors',
        templateUrl: 'views/dashboard/errors.html',
        menuTr: 'dashboards.v3.dox.apiErrors',
        menuHidden: true,
        menuIcon: 'fa fa-exclamation-triangle'
    },
    {
        url: '/edit-menu',
        name: 'dashboard.editMenu',
        templateUrl: 'views/dashboard/editMenu.html',
        menuTr: 'dashboards.v3.app.editMenu',
        menuIcon: 'fa fa-pencil',
        permission: 'edit-menus'
    },
    {
        url: '/edit-pages/{pageXid}',
        name: 'dashboard.editPages',
        templateUrl: 'views/dashboard/editPages.html',
        menuTr: 'dashboards.v3.app.editPages',
        menuIcon: 'fa fa-magic',
        permission: 'edit-pages',
        params: {
            markup: null
        }
    },
    {
        url: '/view-page/{pageXid}',
        name: 'dashboard.viewPage',
        template: '<page-view xid="{{pageXid}}"></page-view>',
        menuTr: 'dashboards.v3.app.viewPage',
        menuHidden: true,
        controller: function ($scope, $stateParams) {
            $scope.pageXid = $stateParams.pageXid;
        }
    },
    {
        url: '/system-settings',
        name: 'dashboard.systemSettings',
        template: '<iframe-view src="/system_settings.shtm"></iframe-view>',
        menuTr: 'header.systemSettings',
        menuIcon: 'fa fa-cog',
        menuHidden: true
    },
    {
        url: '/data-sources',
        name: 'dashboard.dataSources',
        template: '<iframe-view src="/data_sources.shtm"></iframe-view>',
        menuTr: 'header.dataSources',
        menuIcon: 'fa fa-plug',
        menuHidden: true
    },
    {
        url: '/users',
        name: 'dashboard.users',
        template: '<iframe-view src="/users.shtm"></iframe-view>',
        menuTr: 'header.users',
        menuIcon: 'fa fa-user',
        menuHidden: true
    },
    {
        url: '/events',
        name: 'dashboard.events',
        template: '<iframe-view src="/events.shtm"></iframe-view>',
        menuTr: 'header.alarms',
        menuIcon: 'fa fa-bell',
        menuHidden: true
    },
    {
        url: '/import-export',
        name: 'dashboard.importExport',
        template: '<iframe-view src="/emport.shtm"></iframe-view>',
        menuTr: 'header.emport',
        menuIcon: 'fa fa-expand',
        menuHidden: true
    },
    {
        url: '/examples',
        name: 'dashboard.examples',
        menuHidden: true
    },
    {
        url: '/play-area',
        name: 'dashboard.examples.playArea',
        templateUrl: 'views/examples/playArea.html',
        menuTr: 'dashboards.v3.dox.playArea',
        menuIcon: 'fa fa-magic'
    },
    {
        name: 'dashboard.examples.playAreaBig',
        templateUrl: 'views/examples/playAreaBig.html',
        url: '/play-area-big',
        menuTr: 'dashboards.v3.dox.playAreaBig',
        menuHidden: true,
        menuIcon: 'fa fa-magic'
    },
    {
        name: 'dashboard.subtest',
        url: '/sub-test',
        menuText: 'Submenu test',
        menuIcon: 'fa fa-magic',
        children: [
            {
                name: 'dashboard.subtest.page',
                url: '/page',
                template: '<h1>page</h1>',
                menuText: 'Submenu test page'
            },
            {
                name: 'dashboard.subtest.section',
                url: '/section',
                menuText: 'Submenu test section',
                menuIcon: 'fa fa-magic',
                children: [
                    {
                        name: 'dashboard.subtest.section.page1',
                        url: '/page1',
                        template: '<h1>section page1</h1>',
                        menuText: 'Page 1'
                    },
                    {
                        name: 'dashboard.subtest.section.page2',
                        url: '/page2',
                        template: '<h1>section page2</h1>',
                        menuText: 'Page 2'
                    }
                ]
            }
        ]
    },
    {
        name: 'dashboard.examples.basics',
        url: '/basics',
        menuTr: 'dashboards.v3.dox.basics',
        menuIcon: 'fa fa-info-circle',
        children: [
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
        name: 'dashboard.examples.templates',
        url: '/templates',
        menuTr: 'dashboards.v3.dox.templates',
        menuIcon: 'fa fa-file-o',
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
        menuIcon: 'fa fa-wrench',
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
            }
        ]
    },
    {
        name: 'dashboard.examples.singleValueDisplays',
        url: '/single-value-displays',
        menuTr: 'dashboards.v3.dox.singleValueDisplays',
        menuIcon: 'fa fa-tachometer',
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
        menuIcon: 'fa fa-area-chart',
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
        name: 'dashboard.examples.statistics',
        url: '/statistics',
        menuTr: 'dashboards.v3.dox.statistics',
        menuIcon: 'fa fa-table',
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
        menuIcon: 'fa fa-list',
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
        menuIcon: 'fa fa-sitemap',
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
        name: 'dashboard.examples.settingPointValues',
        url: '/setting-point-values',
        menuTr: 'dashboards.v3.dox.settingPoint',
        menuIcon: 'fa fa-pencil-square-o',
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
    }
]);

mdAdminApp.config([
    'MENU_ITEMS',
    'CUSTOM_MENU_ITEMS',
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
function(MENU_ITEMS, CUSTOM_MENU_ITEMS, DASHBOARDS_NG_DOCS, $stateProvider, $urlRouterProvider, $ocLazyLoadProvider,
        $httpProvider, $mdThemingProvider, $injector, $compileProvider, mangoStateProvider, $locationProvider) {

    $compileProvider.debugInfoEnabled(false);

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
        .theme('default')
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
        .theme('inverse')
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
    
    $urlRouterProvider.otherwise('/home');
    
    // little hackish here, going to append the DASHBOARDS_NG_DOCS to the MENU_ITEMS "constant"
    var docsParent = {
        name: 'dashboard.docs',
        url: '/docs',
        menuText: 'Angular Docs',
        children: []
    };
    MENU_ITEMS.push(docsParent);
    
    for (var i = 0; i < DASHBOARDS_NG_DOCS.pages.length; i++) {
        var item = DASHBOARDS_NG_DOCS.pages[i];
        
        var menuItem = {
            name: 'dashboard.docs.' + item.id,
            templateUrl: require.toUrl('./views/docs/' + item.id + '.html'),
            url: item.id,
            menuText: item.shortName
        };
        
        docsParent.children.push(menuItem);
    }
    
    // CUSTOM_MENU_ITEMS will nearly always contain all of the MENU_ITEMS
    mangoStateProvider.addStates(MENU_ITEMS);
    if (CUSTOM_MENU_ITEMS)
        mangoStateProvider.addStates(CUSTOM_MENU_ITEMS);
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
function(MENU_ITEMS, $rootScope, $state, $timeout, $mdSidenav, $mdMedia, $mdColors, $MD_THEME_CSS, cssInjector) {
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
        if (error && (error.status === 401 || error.status === 403)) {
            event.preventDefault();
            $state.loginRedirect = toState;
            $state.go('login');
        }
    });

    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        var crumbs = [];
        var state = $state.$current;
        do {
            if (state.menuTr) {
                crumbs.unshift({maTr: state.menuTr});
            } else if (state.menuText) {
                crumbs.unshift({text: state.menuText});
            }
        } while (state = state.parent);
        $rootScope.crumbs = crumbs;
    });

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if ($state.includes('dashboard')) {
            $rootScope.closeMenu();
        }
    });
    
    $rootScope.lockLeft = true;
    $rootScope.toggleMenu = function() {
        if ($mdMedia('gt-sm')) {
            $rootScope.lockLeft = !$rootScope.lockLeft;
        }
        else {
            $mdSidenav('left').toggle();
        }
        
        angular.element('#menu-button').blur();
    }
    
    $rootScope.closeMenu = function() {
        $mdSidenav('left').close();
    }

    $rootScope.openMenu = function() {
        angular.element('#menu-button').blur();
        $mdSidenav('left').open();
    }

}]);

// Get an injector for the maServices app and use the JsonStore service to retrieve the
// custom user menu items from the REST api prior to bootstrapping the main application.
// This is so the states can be added to the stateProvider in the config block for the
// main application. If the states are added after the main app runs then the user may
// not navigate directly to one of their custom states on startup
var servicesInjector = angular.injector(['maServices'], true);
var JsonStore = servicesInjector.get('JsonStore');
JsonStore.get({xid: 'custom-user-menu'}).$promise.then(function(store) {
    return store.jsonData.menuItems;
}, function() {
    return null;
}).then(function(customMenuItems) {
    mdAdminApp.constant('CUSTOM_MENU_ITEMS', customMenuItems);
    angular.element(document).ready(function() {
        angular.bootstrap(document.documentElement, ['mdAdminApp']);
    });
});

}); // define
