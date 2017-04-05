/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([
    'angular',
    'mango-3.4/maMaterialDashboards',
    'mango-3.4/maAppComponents',
    'require',
    './services/Page',
    './services/DateBar',
    './services/mdAdminSettings',
    './directives/pageView/pageView',
    './directives/liveEditor/livePreview',
    './components/googleAnalytics/googleAnalytics',
    'moment-timezone',
    'angular-ui-router',
    'angular-ui-sortable',
    'oclazyload',
    'angular-loading-bar',
    './views/docs/docs-setup'
], function(angular, maMaterialDashboards, maAppComponents, require, Page, DateBar, mdAdminSettings, pageView, livePreview, googleAnalytics, moment) {
'use strict';

var mdAdminApp = angular.module('mdAdminApp', [
    'oc.lazyLoad',
    'ui.router',
    'ui.sortable',
    'angular-loading-bar',
    'maMaterialDashboards',
    'maAppComponents',
    'ngMessages'
]);

loadLoginTranslations.$inject = ['Translate', 'mdAdminSettings', 'User', '$window'];
function loadLoginTranslations(Translate, mdAdminSettings, User, $window) {
    return Translate.loadNamespaces('login').then(function(data) {
        var user = User.current;
        moment.locale((user && user.locale) || data.locale || $window.navigator.languages || $window.navigator.language);
        moment.tz.setDefault(user ? user.getTimezone() : moment.tz.guess());
    });
}

mdAdminApp.factory('Page', Page)
    .factory('DateBar', DateBar)
    .factory('mdAdminSettings', mdAdminSettings)
    .directive('pageView', pageView)
    .directive('livePreview', livePreview)
    .component('maGoogleAnalytics', googleAnalytics)
    .constant('require', require)
    .constant('CUSTOM_USER_MENU_XID', 'custom-user-menu')
    .constant('CUSTOM_USER_PAGES_XID', 'custom-user-pages')
    .constant('DASHBOARDS_NG_DOCS', NG_DOCS);

mdAdminApp.provider('mangoState', ['$stateProvider', function mangoStateProvider($stateProvider) {
    var resolveObjects = {};
    
    this.addStates = function(menuItems, parent, fromJsonStore) {
        angular.forEach(menuItems, function(menuItem, index) {
            if (menuItem.name || menuItem.state) {
                if (menuItem.linkToPage) {
                    delete menuItem.templateUrl;
                    menuItem.template = '<page-view xid="' + menuItem.pageXid + '" flex layout="column"></page-view>';
                }
                if (menuItem.templateUrl) {
                    delete menuItem.template;
                }
                if (!menuItem.templateUrl && !menuItem.template && !menuItem.views) {
                    menuItem.template = '<div ui-view></div>';
                    menuItem.abstract = true;
                }
                if (!menuItem.name) {
                    menuItem.name = menuItem.state;
                }
                if (!menuItem.weight) {
                    menuItem.weight = 1000;
                }
                
                if (!menuItem.resolve) {
                    menuItem.resolve = {};
                }
                if (menuItem.name.indexOf('dashboard.') !== 0) {
                    if (!menuItem.resolve.loginTranslations) {
                        menuItem.resolve.loginTranslations = loadLoginTranslations;
                    }
                }
                
                if (menuItem.name.indexOf('dashboard.examples.') === 0) {
                    if (!menuItem.params) menuItem.params = {};
                    menuItem.params.dateBar = {
                        rollupControls: true
                    };
                }

                try {
                    $stateProvider.state(menuItem);
                    resolveObjects[menuItem.name] = menuItem.resolve;
                } catch (error) {
                    // state already exists
                    if (!fromJsonStore) {
                        var existingResolve = resolveObjects[menuItem.name];
                        if (existingResolve) {
                            angular.extend(existingResolve, menuItem.resolve);
                        }
                    }
                }
            }

            this.addStates(menuItem.children, menuItem, fromJsonStore);
        }.bind(this));
    };

    // runtime dependencies for the service can be injected here, at the provider.$get() function.
    this.$get = [function() {
        return {
            addState: function(name, state) {
                $stateProvider.state(name, state);
            },
            addStates: this.addStates
        };
    }.bind(this)];
}]);

mdAdminApp.constant('MENU_ITEMS', [
    {
        name: 'dashboard',
        templateUrl: 'views/dashboard/main.html',
        'abstract': true,
        menuHidden: true,
        resolve: {
            auth: ['Translate', 'User', function(Translate, User) {
                if (!User.current) {
                    throw 'No user';
                }
                return Translate.loadNamespaces(['dashboards', 'common']);
            }],
            loginTranslations: loadLoginTranslations,
            errorTemplate: ['$templateRequest', function($templateRequest) {
                // preloads the error page so if the server goes down we can still display the page
                return $templateRequest('views/dashboard/error.html');
            }],
            loadMyDirectives: ['rQ', '$ocLazyLoad', function(rQ, $ocLazyLoad) {
                return rQ(['./services/Menu',
                           './services/MenuEditor',
                           './components/menu/jsonStoreMenu',
                           './components/menu/dashboardMenu',
                           './components/menu/menuLink',
                           './components/menu/menuToggle',
                           './directives/menuEditor/menuEditor',
                           './directives/pageEditor/pageEditor',
                           './directives/liveEditor/liveEditor',
                           './directives/liveEditor/dualPaneEditor',
                           './directives/stateParams/stateParams',
                           './components/autoLoginSettings/autoLoginSettings',
                           './components/activeEventIcons/activeEventIcons',
                           './components/dateBar/dateBar',
                           './components/footer/footer'
                ], function(Menu, MenuEditor, jsonStoreMenu, dashboardMenu, menuLink, menuToggle,
                        menuEditor, pageEditor, liveEditor, dualPaneEditor, stateParams, autoLoginSettings, activeEventIcons, dateBar, footer) {
                    angular.module('dashboard', ['ui.ace'])
                        .factory('Menu', Menu)
                        .factory('MenuEditor', MenuEditor)
                        .factory('DateBar', DateBar)
                        .directive('menuEditor', menuEditor)
                        .directive('pageEditor', pageEditor)
                        .directive('liveEditor', liveEditor)
                        .directive('dualPaneEditor', dualPaneEditor)
                        .directive('stateParams', stateParams)
                        .component('jsonStoreMenu', jsonStoreMenu)
                        .component('dashboardMenu', dashboardMenu)
                        .component('menuLink', menuLink)
                        .component('menuToggle', menuToggle)
                        .component('autoLoginSettings', autoLoginSettings)
                        .component('maActiveEventIcons', activeEventIcons)
                        .component('dateBar', dateBar)
                        .component('maFooter', footer);
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
        name: 'dashboard.unauthorized',
        url: '/unauthorized?path',
        templateUrl: 'views/dashboard/unauthorized.html',
        menuHidden: true,
        menuTr: 'dashboards.v3.app.unauthorized'
    },
    {
        name: 'dashboard.error',
        url: '/error',
        templateUrl: 'views/dashboard/error.html',
        menuHidden: true,
        menuTr: 'dashboards.v3.app.error'
    },
    {
        name: 'dashboard.serverError',
        url: '/server-error',
        templateUrl: 'views/dashboard/serverError.html',
        menuHidden: true,
        menuTr: 'dashboards.v3.app.serverError'
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
        menuIcon: 'home',
        params: {
            helpPage: 'dashboard.help.gettingStarted'
        },
        controller: ['$scope', 'Page', function ($scope, Page) {
            Page.getPages().then(function(store) {
                $scope.pageCount = store.jsonData.pages.length;
            });
        }]
    },
    {
        name: 'dashboard.watchList',
        url: '/watch-list/{watchListXid}?dataSourceXid&deviceName&hierarchyFolderId',
        template: '<ma-watch-list-page flex="noshrink" layout="column"></ma-watch-list-page>',
        menuTr: 'dashboards.v3.app.watchList',
        menuIcon: 'remove_red_eye',
        params: {
            dateBar: {
                rollupControls: true
            },
            helpPage: 'dashboard.help.watchList'
        },
        resolve: {
            loadMyDirectives: ['rQ', '$ocLazyLoad', 'cssInjector', function(rQ, $ocLazyLoad, cssInjector) {
                return rQ(['./directives/watchList/watchListPage',
                            './directives/watchList/watchListTableRow',
                            'md-color-picker/mdColorPicker'], 
                function (watchListPage, watchListTableRow) {
                    angular.module('watchListPage', ['mdColorPicker'])
                        .directive('maWatchListPage', watchListPage)
                        .directive('maWatchListTableRow', watchListTableRow);
                    $ocLazyLoad.inject('watchListPage');
                    cssInjector.injectLink(require.toUrl('./directives/watchList/watchListPage.css'),'watchlistPageStyles','link[href="styles/main.css"]');
                    cssInjector.injectLink(require.toUrl('md-color-picker/mdColorPicker.css'), 'mdColorPicker');
                });
            }]
        }
    },
    {
        name: 'dashboard.dataPointDetails',
        url: '/data-point-details/{pointXid}?pointId',
        template: '<ma-data-point-details></ma-data-point-details>',
        menuTr: 'dashboards.v3.app.dataPointDetails',
        menuIcon: 'timeline',
        params: {
            dateBar: {
                rollupControls: true
            },
            helpPage: 'dashboard.help.dataPointDetails'
        },
        resolve: {
            loadMyDirectives: ['rQ', '$ocLazyLoad', 'cssInjector', function(rQ, $ocLazyLoad, cssInjector) {
                return rQ(['./components/dataPointDetails/dataPointDetails'], function (dataPointDetails) {
                    angular.module('dataPointDetailsPage', [])
                        .component('maDataPointDetails', dataPointDetails);
                    $ocLazyLoad.inject('dataPointDetailsPage');
                    cssInjector.injectLink(require.toUrl('./components/dataPointDetails/dataPointDetails.css'), 'dataPointDetails' ,'link[href="styles/main.css"]');
                });
            }]
        }
    },
    {
        name: 'dashboard.events',
        url: '/events?eventType&alarmLevel&sortOrder&acknowledged',
        template: '<ma-events-page></ma-events-page>',
        menuTr: 'dashboards.v3.app.events',
        menuIcon: 'alarm',
        params: {
            dateBar: {
                rollupControls: false
            },
            helpPage: 'dashboard.help.events'
        },
        resolve: {
            loadMyDirectives: ['rQ', '$ocLazyLoad', 'cssInjector', function(rQ, $ocLazyLoad, cssInjector) {
                return rQ(['./components/eventsPage/eventsPage'], function (eventsPage) {
                    angular.module('eventsPage', [])
                        .component('maEventsPage', eventsPage);
                    $ocLazyLoad.inject('eventsPage');
                    cssInjector.injectLink(require.toUrl('./components/eventsPage/eventsPage.css'), 'eventsPage' ,'link[href="styles/main.css"]');
                });
            }]
        }
    },
    {
        name: 'dashboard.help',
        url: '/help',
        menuTr: 'header.help',
        menuIcon: 'help',
        submenu: true,
        weight: 2000,
        children: [
            {
                url: '/getting-started',
                name: 'dashboard.help.gettingStarted',
                templateUrl: 'views/help/gettingStarted.html',
                menuTr: 'dashboards.v3.dox.gettingStarted'
            },
            {
                name: 'dashboard.help.legacy',
                url: '/legacy',
                templateUrl: 'views/help/legacy.html',
                menuHidden: true,
                menuTr: 'dashboards.v3.dox.legacyHelp'
            },
            {
                url: '/watch-list',
                name: 'dashboard.help.watchList',
                templateUrl: 'views/help/watchList.html',
                menuTr: 'dashboards.v3.dox.watchList'
            },
            {
                url: '/data-point-details',
                name: 'dashboard.help.dataPointDetails',
                templateUrl: 'views/help/dataPointDetails.html',
                menuTr: 'dashboards.v3.dox.dataPointDetails'
            },
            {
                url: '/events',
                name: 'dashboard.help.events',
                templateUrl: 'views/help/events.html',
                menuTr: 'dashboards.v3.dox.events'
            },
            {
                url: '/date-bar',
                name: 'dashboard.help.dateBar',
                templateUrl: 'views/help/dateBar.html',
                menuTr: 'dashboards.v3.dox.dateBar'
            },
            {
                url: '/dashboard-settings',
                name: 'dashboard.help.dashboardSettings',
                templateUrl: 'views/help/dashboardSettings.html',
                menuTr: 'dashboards.v3.app.dashboardSettings'
            },
            {
                url: '/watch-list-builder',
                name: 'dashboard.help.watchListBuilder',
                templateUrl: 'views/help/watchListBuilder.html',
                menuTr: 'dashboards.v3.app.watchListBuilder'
            },
            {
                url: '/custom-pages',
                name: 'dashboard.help.customPages',
                templateUrl: 'views/help/customPages.html',
                menuTr: 'dashboards.v3.dox.customPages'
            },
            {
                url: '/menu-editor',
                name: 'dashboard.help.menuEditor',
                templateUrl: 'views/help/menuEditor.html',
                menuTr: 'dashboards.v3.dox.menuEditor'
            },
            {
                url: '/custom-dashboards',
                name: 'dashboard.help.customDashboards',
                templateUrl: 'views/help/customDashboards.html',
                menuTr: 'dashboards.v3.dox.customDashboards'
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
        template: '<page-view xid="{{pageXid}}" flex layout="column"></page-view>',
        menuTr: 'dashboards.v3.app.viewPage',
        menuHidden: true,
        controller: ['$scope', '$stateParams', function ($scope, $stateParams) {
            $scope.pageXid = $stateParams.pageXid;
        }]
    },
    {
        url: '/administration',
        name: 'dashboard.settings',
        menuIcon: 'build',
        menuTr: 'dashboards.v3.app.adminTools',
        weight: 1999,
        children: [
            {
                url: '/edit-pages/{pageXid}',
                name: 'dashboard.settings.editPages',
                templateUrl: 'views/dashboard/editPages.html',
                menuTr: 'dashboards.v3.app.editPages',
                menuIcon: 'dashboard',
                permission: 'edit-pages',
                params: {
                    dateBar: {
                        rollupControls: true
                    },
                    markup: null,
                    templateUrl: null,
                    helpPage: 'dashboard.help.customPages'
                }
            },
            {
                url: '/edit-menu',
                name: 'dashboard.settings.editMenu',
                templateUrl: 'views/dashboard/editMenu.html',
                menuTr: 'dashboards.v3.app.editMenu',
                menuIcon: 'toc',
                permission: 'edit-menus',
                params: {
                    helpPage: 'dashboard.help.menuEditor'
                }
            },
            {
                url: '/auto-login-settings',
                name: 'dashboard.settings.autoLoginSettings',
                templateUrl: 'views/dashboard/autoLoginSettings.html',
                menuTr: 'dashboards.v3.app.autoLoginSettings',
                menuIcon: 'face',
                permission: 'superadmin'
            },
            {
                url: '/dashboard-settings',
                name: 'dashboard.settings.dashboardSettings',
                templateUrl: 'views/dashboard/dashboardSettings.html',
                menuTr: 'dashboards.v3.app.dashboardSettings',
                menuIcon: 'color_lens',
                permission: 'superadmin',
                params: {
                    helpPage: 'dashboard.help.dashboardSettings'
                }
            },
            {
                name: 'dashboard.settings.users',
                url: '/users/{username}',
                template: '<users-page><users-page>',
                menuTr: 'header.users',
                menuIcon: 'people',
                permission: 'superadmin',
                params: {
                    helpPage: 'dashboard.help.users'
                },
                resolve: {
                    loadMyDirectives: ['rQ', '$ocLazyLoad', function(rQ, $ocLazyLoad) {
                        return rQ(['./components/usersPage/usersPage'], function (usersPage) {
                            angular.module('usersPage', [])
                                .component('usersPage', usersPage);
                            $ocLazyLoad.inject('usersPage');
                        });
                    }]
                }
            },
            {
                name: 'dashboard.settings.system',
                url: '/system',
                template: '<system-settings-page><system-settings-page>',
                menuTr: 'header.systemSettings',
                menuIcon: 'settings',
                permission: 'superadmin',
                params: {
                    helpPage: 'dashboard.help.systemSettings'
                },
                resolve: {
                    loadMyDirectives: ['rQ', '$ocLazyLoad', function(rQ, $ocLazyLoad) {
                        return rQ(['./components/systemSettingsPage/systemSettingsPage'], function (systemSettingsPage) {
                            angular.module('systemSettingsPage', [])
                                .component('systemSettingsPage', systemSettingsPage);
                            $ocLazyLoad.inject('systemSettingsPage');
                        });
                    }]
                }
            },
            {
                name: 'dashboard.settings.watchListBuilder',
                url: '/watch-list-builder/{watchListXid}',
                template: '<h1 ma-tr="dashboards.v3.app.watchListBuilder"></h1>\n<watch-list-builder></watch-list-builder>',
                menuTr: 'dashboards.v3.app.watchListBuilder',
                menuIcon: 'playlist_add_check',
                params: {
                    watchList: null,
                    helpPage: 'dashboard.help.watchListBuilder'
                },
                resolve: {
                    loadMyDirectives: ['rQ', '$ocLazyLoad', 'cssInjector', function(rQ, $ocLazyLoad, cssInjector) {
                        return rQ(['./components/watchListBuilder/watchListBuilder', './directives/bracketEscape/bracketEscape'], function (watchListBuilder, bracketEscape) {
                            angular.module('watchListBuilder', [])
                                .directive('bracketEscape', bracketEscape)
                                .component('watchListBuilder', watchListBuilder);
                            $ocLazyLoad.inject('watchListBuilder');
                            cssInjector.injectLink(require.toUrl('./components/watchListBuilder/watchListBuilder.css'), 'watchListBuilder' ,'link[href="styles/main.css"]');
                        });
                    }]
                }
            },
            {
                name: 'dashboard.settings.importExport',
                url: '/import-export',
                template: '<import-export-page><import-export-page>',
                menuTr: 'header.emport',
                menuIcon: 'import_export',
                permission: 'superadmin',
                params: {
                    helpPage: 'dashboard.help.importExport'
                },
                resolve: {
                    loadMyDirectives: ['rQ', '$ocLazyLoad', function(rQ, $ocLazyLoad) {
                        return rQ(['./components/importExportPage/importExportPage'], function (importExportPage) {
                            angular.module('importExportPage', [])
                                .component('importExportPage', importExportPage);
                            $ocLazyLoad.inject('importExportPage');
                        });
                    }]
                }
            },
            {
                name: 'dashboard.settings.modules',
                url: '/modules',
                template: '<modules-page><modules-page>',
                menuTr: 'header.modules',
                menuIcon: 'extension',
                permission: 'superadmin',
                params: {
                    helpPage: 'dashboard.help.modules'
                },
                resolve: {
                    loadMyDirectives: ['rQ', '$ocLazyLoad', function(rQ, $ocLazyLoad) {
                        return rQ(['./components/modulesPage/modulesPage'], function (modulesPage) {
                            angular.module('modulesPage', [])
                                .component('modulesPage', modulesPage);
                            $ocLazyLoad.inject('modulesPage');
                        });
                    }]
                }
            }
        ]
    },
    {
        name: 'dashboard.examples',
        url: '/examples',
        menuTr: 'dashboards.v3.dox.examples',
        menuIcon: 'info',
        menuHidden: true,
        submenu: true,
        weight: 2001,
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
                        menuTr: 'dashboards.v3.app.eventsTable'
                    },
                    {
                        name: 'dashboard.examples.utilities.googleMaps',
                        templateUrl: 'views/examples/googleMaps.html',
                        url: '/google-maps',
                        menuText: 'Google Maps'
                    }
                ]
            }
        ]
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
    'cfpLoadingBarProvider',
    'SystemSettingsProvider',
function(MENU_ITEMS, MD_ADMIN_SETTINGS, DASHBOARDS_NG_DOCS, $stateProvider, $urlRouterProvider, $ocLazyLoadProvider,
        $httpProvider, $mdThemingProvider, $injector, $compileProvider, mangoStateProvider, $locationProvider, $mdAriaProvider,
        errorInterceptorProvider, cfpLoadingBarProvider, SystemSettingsProvider) {

    // will need initially when we use AngularJS 1.6.x
    //$compileProvider.preAssignBindingsEnabled(true);
    $compileProvider.debugInfoEnabled(false);
    $mdAriaProvider.disableWarnings();
    
    errorInterceptorProvider.ignore = function(rejection) {
        var ignoreUrls = ['/rest/v1/json-data/custom-user-menu',
                          '/rest/v1/json-data/custom-user-pages',
                          '/rest/v1/json-data/play-area-'];

        if (!rejection.config)
            return false;
        
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

    if (MD_ADMIN_SETTINGS.palettes) {
        for (var paletteName in MD_ADMIN_SETTINGS.palettes) {
            $mdThemingProvider.definePalette(paletteName, angular.copy(MD_ADMIN_SETTINGS.palettes[paletteName]));
        }
    }

    if (MD_ADMIN_SETTINGS.themes) {
        for (var name in MD_ADMIN_SETTINGS.themes) {
            var themeSettings = MD_ADMIN_SETTINGS.themes[name];
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
    
    MD_ADMIN_SETTINGS.UI_PREFERENCES_KEY = 'uiPreferences';
    
    // need to store a reference to the theming provider in order to generate themes at runtime
    MD_ADMIN_SETTINGS.themingProvider = $mdThemingProvider;

    var defaultTheme = MD_ADMIN_SETTINGS.defaultTheme || 'mangoDark';
    $mdThemingProvider.setDefaultTheme(defaultTheme);
    $mdThemingProvider.alwaysWatchTheme(true);
    $mdThemingProvider.generateThemesOnDemand(true);
    $mdThemingProvider.enableBrowserColor({
        theme: defaultTheme
    });

    $httpProvider.interceptors.push('errorInterceptor');
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
        var mdAdminSettings = $injector.get('mdAdminSettings');
        var User = $injector.get('User');
        var $state = $injector.get('$state');
        var user = User.current;
        
        var path = '/dashboards/';
        if ($location.path()) {
            path += $location.path().substring(1);
        }
        
        if (!user) {
            $state.loginRedirectUrl = path;
            return '/login';
        }
        
        if (path === '/dashboards/') {
            var homeUrl = user.mangoDefaultUri || user.homeUrl;
            if (homeUrl && homeUrl.indexOf('/dashboards') === 0) {
                return homeUrl.substring(11); // strip dashboards from start of url
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
        menuHidden: true,
        submenu: true,
        weight: 2002,
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
    var modules = DOCS_PAGES.map(function(page) {return page.moduleName;})
    .filter(function(item, index, array) {
        return index == array.indexOf(item);
    });

    // Create module menu items & states
    modules.forEach(function(item, index, array) {
        var dashCaseUrl = item.replace(/[A-Z]/g, function(c) { return '-' + c.toLowerCase(); });

        var menuText = item;
        if (item==='maDashboards') { menuText = 'Components'; }
        else if (item==='maFilters') { menuText = 'Filters'; }
        else if (item==='maServices') { menuText = 'Services'; }

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
        if (splitAtDot[0] === 'maDashboards') { menuText = dashCaseUrl;}
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
        mangoStateProvider.addStates(MD_ADMIN_SETTINGS.customMenuItems, null, true);
    
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
    
    SystemSettingsProvider.addSection({
        titleTr: 'dashboards.settings',
        template: require.toUrl('dashboards/settings.html')
    });
}]);

mdAdminApp.constant('MA_UI_PREFS_KEY', 'uiPreferences');

mdAdminApp.run([
    'MENU_ITEMS',
    '$rootScope',
    '$state',
    '$timeout',
    '$mdSidenav',
    '$mdMedia',
    'localStorageService',
    '$mdToast',
    'User',
    'mdAdminSettings',
    'Translate',
    '$location',
    '$stateParams',
    'DateBar',
    '$document',
    '$mdDialog',
function(MENU_ITEMS, $rootScope, $state, $timeout, $mdSidenav, $mdMedia, localStorageService,
        $mdToast, User, mdAdminSettings, Translate, $location, $stateParams, DateBar, $document, $mdDialog) {

    mdAdminSettings.generateTheme();
    $rootScope.stateParams = $stateParams;
    $rootScope.dateBar = DateBar;
    $rootScope.mdAdminSettings = mdAdminSettings;
    $rootScope.User = User;
    $rootScope.menuItems = MENU_ITEMS;
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
            if (toState.name !== 'dashboard.error') {
                $state.go('dashboard.error');
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
        if ($state.includes('dashboard.settings.dashboardSettings')) {
            // resets themes to the last saved state when leaving the settings page
            mdAdminSettings.reset();
            mdAdminSettings.generateTheme();
        }
        
        if ($state.includes('dashboard') && !$rootScope.navLockedOpen) {
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
        if (view === '@dashboard') {
            if ($mdMedia('gt-sm')) {
                var uiPrefs = localStorageService.get(mdAdminSettings.UI_PREFERENCES_KEY);
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
        var uiPrefs = localStorageService.get(mdAdminSettings.UI_PREFERENCES_KEY) || {};
        uiPrefs.menuClosed = true;
        localStorageService.set(mdAdminSettings.UI_PREFERENCES_KEY, uiPrefs);
        
        angular.element('#menu-button').blur();
        $rootScope.navLockedOpen = false;
        $mdSidenav('left').close();
    };

    $rootScope.openMenu = function() {
        var uiPrefs = localStorageService.get(mdAdminSettings.UI_PREFERENCES_KEY) || {};
        uiPrefs.menuClosed = false;
        localStorageService.set(mdAdminSettings.UI_PREFERENCES_KEY, uiPrefs);
        
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
            break;
        case 'STARTING_UP':
            if (current.status === previous.status && current.info.startupProgress === previous.info.startupProgress &&
                    current.info.startupState === previous.info.startupState) {
                return;
            }
            message = Translate.trSync('login.dashboards.v3.app.startingUp', [current.info.startupProgress, current.info.startupState]);
            break;
        case 'API_ERROR':
            message = Translate.trSync('login.dashboards.v3.app.returningErrors');
            break;
        case 'API_UP':
            if (previous.status && previous.status !== 'LOGGED_IN') {
                message = Translate.trSync('login.dashboards.v3.app.connectivityRestored');
                hideDelay = 5000;
            }

            // do automatic re-login if we are not on the login page
            if (!$state.includes('login') && !current.wasLogout) {
                User.autoLogin().then(null, function() {
                    // close dialogs
                    $mdDialog.cancel();
                    
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

// Get an injector for the maServices app and use the JsonStore service to retrieve the
// custom user menu items from the REST api prior to bootstrapping the main application.
// This is so the states can be added to the stateProvider in the config block for the
// main application. If the states are added after the main app runs then the user may
// not navigate directly to one of their custom states on startup
var servicesInjector = angular.injector(['maServices'], true);
var User = servicesInjector.get('User');
var JsonStore = servicesInjector.get('JsonStore');
var $q = servicesInjector.get('$q');
var $http = servicesInjector.get('$http');

var userAndUserSettingsPromise = User.getCurrent().$promise.then(null, function() {
    return User.autoLogin();
}).then(function(user) {
    var userMenuPromise = JsonStore.get({xid: 'custom-user-menu'}).$promise.then(null, angular.noop);
    return $q.all([user, userMenuPromise]);
}, angular.noop).then(function(data) {
    return {
        user: data && data[0],
        userMenuStore: data && data[1]
    };
});

var dashboardSettingsPromise = $http({
    method: 'GET',
    url: require.toUrl('./dashboardSettings.json')
}).then(function(data) {
    return data.data;
}, angular.noop);

var customDashboardSettingsPromise = JsonStore.getPublic({xid: 'dashboard-settings'}).$promise.then(null, angular.noop);

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

$q.all([userAndUserSettingsPromise, dashboardSettingsPromise, customDashboardSettingsPromise, angularModulesPromise]).then(function(data) {
    // destroy the services injector
    servicesInjector.get('$rootScope').$destroy();
    
    var MD_ADMIN_SETTINGS = {};
    var user = data[0].user;
    var userMenuStore = data[0].userMenuStore;
    var defaultSettings = data[1];
    var customSettingsStore = data[2];
    var angularModules = data[3] || [];
    
    if (defaultSettings) {
        MD_ADMIN_SETTINGS.defaultSettings = defaultSettings;
        angular.merge(MD_ADMIN_SETTINGS, defaultSettings);
    }
    if (customSettingsStore) {
        MD_ADMIN_SETTINGS.initialSettings = customSettingsStore.jsonData;
        angular.merge(MD_ADMIN_SETTINGS, customSettingsStore.jsonData);
    }
    if (userMenuStore) {
        MD_ADMIN_SETTINGS.customMenuItems = userMenuStore.jsonData.menuItems;
    }

    var angularJsModuleNames = ['mdAdminApp'];
    for (var i = 0; i < angularModules.length; i++) {
        var angularModule = angularModules[i];
        angularJsModuleNames.push(angularModule.name);
    }
    
    mdAdminApp.constant('MD_ADMIN_SETTINGS', MD_ADMIN_SETTINGS);

    angular.module('mdAdminBootstrap', angularJsModuleNames).config(['UserProvider', function(UserProvider) {
        // store pre-bootstrap user into the User service
        UserProvider.setUser(user);
    }]);

    angular.element(document).ready(function() {
        angular.bootstrap(document.documentElement, ['mdAdminBootstrap'], {strictDi: true});
    });
});

}); // define
