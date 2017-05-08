/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular', './util/loadLoginTranslations'], function(require, angular, loadLoginTranslations) {
'use strict';

return [
    {
        name: 'login',
        url: '/login',
        templateUrl: 'views/login.html',
        menuHidden: true,
        menuIcon: 'exit_to_app',
        menuTr: 'header.login',
        resolve: {
            deps: ['maRequireQ', '$ocLazyLoad', function(maRequireQ, $ocLazyLoad) {
                return maRequireQ(['./directives/login/login'], function(login) {
                    angular.module('maUiLoginState', [])
                        .directive('maUiLogin', login);
                    $ocLazyLoad.inject('maUiLoginState');
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
        name: 'agreeToLicense',
        url: '/agree-to-license',
        templateUrl: 'views/agreeToLicense.html',
        menuTr: 'ui.app.agreeToLicense',
        menuIcon: 'done',
        menuHidden: true
    },
    {
        name: 'ui',
        templateUrl: 'views/main.html',
        'abstract': true,
        menuHidden: true,
        menuTr: 'ui.app.ui',
        resolve: {
            auth: ['maTranslate', 'maUser', function(Translate, User) {
                if (!User.current) {
                    throw 'No user';
                }
                return Translate.loadNamespaces(['ui', 'common']);
            }],
            loginTranslations: loadLoginTranslations,
            errorTemplate: ['$templateRequest', function($templateRequest) {
                // preloads the error page so if the server goes down we can still display the page
                return $templateRequest('views/error.html');
            }],
            loadMyDirectives: ['maRequireQ', '$ocLazyLoad', function(maRequireQ, $ocLazyLoad) {
                return maRequireQ(['./services/menuEditor',
                           './components/menu/jsonStoreMenu',
                           './components/menu/menu',
                           './components/menu/menuLink',
                           './components/menu/menuToggle',
                           './directives/menuEditor/menuEditor',
                           './directives/pageEditor/pageEditor',
                           './directives/pageEditor/pageEditorControls',
                           './directives/liveEditor/liveEditor',
                           './directives/liveEditor/dualPaneEditor',
                           './directives/helpLink/helpLink',
                           './components/autoLoginSettings/autoLoginSettings',
                           './components/activeEventIcons/activeEventIcons',
                           './components/dateBar/dateBar',
                           './components/footer/footer'
                ], function(menuEditorFactory, jsonStoreMenu, menu, menuLink, menuToggle,
                        menuEditor, pageEditor, pageEditorControls, liveEditor, dualPaneEditor, helpLink, autoLoginSettings, activeEventIcons, dateBar, footer) {
                    angular.module('maUiRootState', ['ui.ace'])
                        .factory('maUiMenuEditor', menuEditorFactory)
                        .directive('maUiMenuEditor', menuEditor)
                        .directive('maUiPageEditor', pageEditor)
                        .directive('maUiPageEditorControls', pageEditorControls)
                        .directive('maUiLiveEditor', liveEditor)
                        .directive('maUiDualPaneEditor', dualPaneEditor)
                        .directive('maUiHelpLink', helpLink)
                        .component('maUiJsonStoreMenu', jsonStoreMenu)
                        .component('maUiMenu', menu)
                        .component('maUiMenuLink', menuLink)
                        .component('maUiMenuToggle', menuToggle)
                        .component('maUiAutoLoginSettings', autoLoginSettings)
                        .component('maUiActiveEventIcons', activeEventIcons)
                        .component('maUiDateBar', dateBar)
                        .component('maUiFooter', footer);
                    $ocLazyLoad.inject('maUiRootState');
                });
            }]
        }
    },
    {
        name: 'ui.notFound',
        url: '/not-found?path',
        templateUrl: 'views/notFound.html',
        menuHidden: true,
        menuTr: 'ui.app.pageNotFound',
        weight: 3000
    },
    {
        name: 'ui.unauthorized',
        url: '/unauthorized?path',
        templateUrl: 'views/unauthorized.html',
        menuHidden: true,
        menuTr: 'ui.app.unauthorized',
        weight: 3000
    },
    {
        name: 'ui.error',
        url: '/error',
        templateUrl: 'views/error.html',
        menuHidden: true,
        menuTr: 'ui.app.error',
        weight: 3000
    },
    {
        name: 'ui.serverError',
        url: '/server-error',
        templateUrl: 'views/serverError.html',
        menuHidden: true,
        menuTr: 'ui.app.serverError',
        weight: 3000
    },
    {
        name: 'ui.home',
        url: '/home',
        templateUrl: 'views/home.html',
        menuTr: 'ui.dox.home',
        menuIcon: 'home',
        params: {
            helpPage: 'ui.help.gettingStarted',
            helpOpen: null
        },
        controller: ['$scope', 'maUiPages', function ($scope, maUiPages) {
            maUiPages.getPages().then(function(store) {
                $scope.pageCount = store.jsonData.pages.length;
            });
        }],
        weight: 990,
        permission: 'superadmin'
    },
    {
        name: 'ui.watchList',
        url: '/watch-list/{watchListXid}?dataSourceXid&deviceName&hierarchyFolderId',
        template: '<ma-ui-watch-list-page flex="noshrink" layout="column"></ma-ui-watch-list-page>',
        menuTr: 'ui.app.watchList',
        menuIcon: 'remove_red_eye',
        params: {
            dateBar: {
                rollupControls: true
            },
            helpPage: 'ui.help.watchList'
        },
        resolve: {
            loadMyDirectives: ['maRequireQ', '$ocLazyLoad', 'maCssInjector', function(maRequireQ, $ocLazyLoad, cssInjector) {
                return maRequireQ(['./directives/watchList/watchListPage',
                            './directives/watchList/watchListTableRow'], 
                function (watchListPage, watchListTableRow) {
                    angular.module('maUiWatchListState', [])
                        .directive('maUiWatchListPage', watchListPage)
                        .directive('maUiWatchListTableRow', watchListTableRow);
                    $ocLazyLoad.inject('maUiWatchListState');
                    cssInjector.injectLink(require.toUrl('./directives/watchList/watchListPage.css'),'watchlistPageStyles','link[href="styles/main.css"]');
                });
            }]
        }
    },
    {
        name: 'ui.dataPointDetails',
        url: '/data-point-details/{pointXid}?pointId',
        template: '<ma-ui-data-point-details></ma-ui-data-point-details>',
        menuTr: 'ui.app.dataPointDetails',
        menuIcon: 'timeline',
        params: {
            dateBar: {
                rollupControls: true
            },
            helpPage: 'ui.help.dataPointDetails'
        },
        resolve: {
            loadMyDirectives: ['maRequireQ', '$ocLazyLoad', 'maCssInjector', function(maRequireQ, $ocLazyLoad, cssInjector) {
                return maRequireQ(['./components/dataPointDetails/dataPointDetails'], function (dataPointDetails) {
                    angular.module('maUiDataPointDetailsState', [])
                        .component('maUiDataPointDetails', dataPointDetails);
                    $ocLazyLoad.inject('maUiDataPointDetailsState');
                    cssInjector.injectLink(require.toUrl('./components/dataPointDetails/dataPointDetails.css'), 'dataPointDetails' ,'link[href="styles/main.css"]');
                });
            }]
        }
    },
    {
        name: 'ui.events',
        url: '/events?eventType&alarmLevel&sortOrder&acknowledged',
        template: '<ma-ui-events-page></ma-ui-events-page>',
        menuTr: 'ui.app.events',
        menuIcon: 'alarm',
        params: {
            dateBar: {
                rollupControls: false
            },
            helpPage: 'ui.help.events'
        },
        resolve: {
            loadMyDirectives: ['maRequireQ', '$ocLazyLoad', 'maCssInjector', function(maRequireQ, $ocLazyLoad, cssInjector) {
                return maRequireQ(['./components/eventsPage/eventsPage'], function (eventsPage) {
                    angular.module('maUiEventsState', [])
                        .component('maUiEventsPage', eventsPage);
                    $ocLazyLoad.inject('maUiEventsState');
                    cssInjector.injectLink(require.toUrl('./components/eventsPage/eventsPage.css'), 'eventsPage' ,'link[href="styles/main.css"]');
                });
            }]
        }
    },
    {
        name: 'ui.help',
        url: '/help',
        menuTr: 'header.help',
        menuIcon: 'help',
        submenu: true,
        weight: 2000,
        params: {
            sidebar: null
        }
    },
    {
        url: '/getting-started',
        name: 'ui.help.gettingStarted',
        templateUrl: 'views/help/gettingStarted.html',
        menuTr: 'ui.dox.gettingStarted',
        weight: 900
    },
    {
        name: 'ui.help.legacy',
        url: '/legacy',
        templateUrl: 'views/help/legacy.html',
        menuHidden: true,
        menuTr: 'ui.dox.legacyHelp'
    },
    {
        url: '/watch-list',
        name: 'ui.help.watchList',
        templateUrl: 'views/help/watchList.html',
        menuTr: 'ui.dox.watchList'
    },
    {
        url: '/data-point-details',
        name: 'ui.help.dataPointDetails',
        templateUrl: 'views/help/dataPointDetails.html',
        menuTr: 'ui.dox.dataPointDetails'
    },
    {
        url: '/events',
        name: 'ui.help.events',
        templateUrl: 'views/help/events.html',
        menuTr: 'ui.dox.events'
    },
    {
        url: '/date-bar',
        name: 'ui.help.dateBar',
        templateUrl: 'views/help/dateBar.html',
        menuTr: 'ui.dox.dateBar'
    },
    {
        url: '/ui-settings',
        name: 'ui.help.uiSettings',
        templateUrl: 'views/help/uiSettings.html',
        menuTr: 'ui.app.uiSettings'
    },
    {
        url: '/watch-list-builder',
        name: 'ui.help.watchListBuilder',
        templateUrl: 'views/help/watchListBuilder.html',
        menuTr: 'ui.app.watchListBuilder'
    },
    {
        url: '/custom-pages',
        name: 'ui.help.customPages',
        templateUrl: 'views/help/customPages.html',
        menuTr: 'ui.dox.customPages'
    },
    {
        url: '/menu-editor',
        name: 'ui.help.menuEditor',
        templateUrl: 'views/help/menuEditor.html',
        menuTr: 'ui.dox.menuEditor'
    },
    {
        url: '/custom-dashboards',
        name: 'ui.help.customDashboards',
        templateUrl: 'views/help/customDashboards.html',
        menuTr: 'ui.dox.customDashboards'
    },
    {
        url: '/view-page/{pageXid}',
        name: 'ui.viewPage',
        template: '<ma-ui-page-view xid="{{pageXid}}" flex layout="column"></ma-ui-page-view>',
        menuTr: 'ui.app.viewPage',
        menuHidden: true,
        controller: ['$scope', '$stateParams', function ($scope, $stateParams) {
            $scope.pageXid = $stateParams.pageXid;
        }],
        weight: 3000
    },
    {
        url: '/administration',
        name: 'ui.settings',
        menuIcon: 'build',
        menuTr: 'ui.app.adminTools',
        template: '<div flex="noshrink" layout="column" ui-view></div>',
        abstract: true,
        weight: 1999
    },
    {
        name: 'ui.settings.dataSources',
        menuIcon: 'device_hub',
        menuTr: 'header.dataSources',
        href: '/data_sources.shtm',
        target: 'mango-legacy',
        permission: 'superadmin'
    },
    {
        url: '/edit-pages/{pageXid}',
        name: 'ui.settings.editPages',
        templateUrl: 'views/editPages.html',
        menuTr: 'ui.app.editPages',
        menuIcon: 'dashboard',
        permission: 'edit-ui-pages',
        params: {
            dateBar: {
                rollupControls: true
            },
            markup: null,
            templateUrl: null,
            helpPage: 'ui.help.customPages'
        }
    },
    {
        url: '/edit-menu',
        name: 'ui.settings.editMenu',
        templateUrl: 'views/editMenu.html',
        menuTr: 'ui.app.editMenu',
        menuIcon: 'toc',
        permission: 'edit-ui-menus',
        params: {
            helpPage: 'ui.help.menuEditor'
        }
    },
    {
        url: '/auto-login-settings',
        name: 'ui.settings.autoLoginSettings',
        templateUrl: 'views/autoLoginSettings.html',
        menuTr: 'ui.app.autoLoginSettings',
        menuIcon: 'face',
        permission: 'superadmin'
    },
    {
        url: '/ui-settings',
        name: 'ui.settings.uiSettings',
        templateUrl: 'views/uiSettings.html',
        menuTr: 'ui.app.uiSettings',
        menuIcon: 'color_lens',
        permission: 'edit-ui-settings',
        params: {
            helpPage: 'ui.help.uiSettings'
        }
    },
    {
        name: 'ui.settings.users',
        url: '/users/{username}',
        template: '<ma-ui-users-page><ma-ui-users-page>',
        menuTr: 'header.users',
        menuIcon: 'people',
        permission: 'superadmin',
        params: {
            helpPage: 'ui.help.users'
        },
        resolve: {
            loadMyDirectives: ['maRequireQ', '$ocLazyLoad', function(maRequireQ, $ocLazyLoad) {
                return maRequireQ(['./components/usersPage/usersPage'], function (usersPage) {
                    angular.module('maUiUsersState', [])
                        .component('maUiUsersPage', usersPage);
                    $ocLazyLoad.inject('maUiUsersState');
                });
            }]
        }
    },
    {
        name: 'ui.settings.system',
        url: '/system',
        template: '<ma-ui-system-settings-page flex="noshrink" layout="column"><ma-ui-system-settings-page>',
        menuTr: 'header.systemSettings',
        menuIcon: 'settings',
        permission: 'superadmin',
        params: {
            helpPage: 'ui.help.systemSettings'
        },
        resolve: {
            loadMyDirectives: ['maRequireQ', '$ocLazyLoad', function(maRequireQ, $ocLazyLoad) {
                return maRequireQ(['./components/systemSettingsPage/systemSettingsPage'], function (systemSettingsPage) {
                    angular.module('maUiSystemSettingsState', [])
                        .component('maUiSystemSettingsPage', systemSettingsPage);
                    $ocLazyLoad.inject('maUiSystemSettingsState');
                });
            }]
        }
    },
    {
        name: 'ui.settings.system.systemInformation',
        url: '/information',
        menuTr: 'systemSettings.systemInformation',
        templateUrl: require.toUrl('./systemSettings/systemInformation.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.siteAnalytics',
        url: '/site-analytics',
        menuTr: 'systemSettings.siteAnalytics',
        templateUrl: require.toUrl('./systemSettings/analytics.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.language',
        url: '/language',
        menuTr: 'systemSettings.languageSettings',
        templateUrl: require.toUrl('./systemSettings/language.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.systemAlarmLevels',
        url: '/system-alarm-levels',
        menuTr: 'systemSettings.systemAlarmLevels',
        templateUrl: require.toUrl('./systemSettings/systemAlarmLevels.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.auditAlarmLevels',
        url: '/audit-alarm-levels',
        menuTr: 'systemSettings.auditAlarmLevels',
        templateUrl: require.toUrl('./systemSettings/auditAlarmLevels.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.email',
        url: '/email',
        menuTr: 'systemSettings.emailSettings',
        templateUrl: require.toUrl('./systemSettings/email.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.http',
        url: '/http',
        menuTr: 'systemSettings.httpSettings',
        templateUrl: require.toUrl('./systemSettings/httpSettings.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.threadPools',
        url: '/thread-pools',
        menuTr: 'systemSettings.threadPools',
        templateUrl: require.toUrl('./systemSettings/threadPools.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.uiPerformance',
        url: '/ui-performance',
        menuTr: 'systemSettings.uiPerformance',
        templateUrl: require.toUrl('./systemSettings/uiPerformance.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.purge',
        url: '/purge',
        menuTr: 'systemSettings.purgeSettings',
        templateUrl: require.toUrl('./systemSettings/purgeSettings.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.ui',
        url: '/ui',
        menuTr: 'ui.settings',
        templateUrl: require.toUrl('./systemSettings/uiModule.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.color',
        url: '/color',
        menuTr: 'systemSettings.colourSettings',
        templateUrl: require.toUrl('./systemSettings/color.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.configBackup',
        url: '/config-backup',
        menuTr: 'systemSettings.backupSettings',
        templateUrl: require.toUrl('./systemSettings/configBackup.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.sqlBackup',
        url: '/sql-backup',
        menuTr: 'systemSettings.H2DatabaseBackupSettings',
        templateUrl: require.toUrl('./systemSettings/sqlBackup.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.system.chart',
        url: '/chart',
        menuTr: 'systemSettings.chartSettings',
        templateUrl: require.toUrl('./systemSettings/chart.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.watchListBuilder',
        url: '/watch-list-builder/{watchListXid}',
        template: '<h1 ma-tr="ui.app.watchListBuilder"></h1>\n<ma-ui-watch-list-builder></ma-ui-watch-list-builder>',
        menuTr: 'ui.app.watchListBuilder',
        menuIcon: 'playlist_add_check',
        params: {
            watchList: null,
            helpPage: 'ui.help.watchListBuilder'
        },
        resolve: {
            loadMyDirectives: ['maRequireQ', '$ocLazyLoad', 'maCssInjector', function(maRequireQ, $ocLazyLoad, cssInjector) {
                return maRequireQ(['./components/watchListBuilder/watchListBuilder', './directives/bracketEscape/bracketEscape'], function (watchListBuilder, bracketEscape) {
                    angular.module('maUiWatchListBuilderState', [])
                        .directive('maUiBracketEscape', bracketEscape)
                        .component('maUiWatchListBuilder', watchListBuilder);
                    $ocLazyLoad.inject('maUiWatchListBuilderState');
                    cssInjector.injectLink(require.toUrl('./components/watchListBuilder/watchListBuilder.css'), 'watchListBuilder' ,'link[href="styles/main.css"]');
                });
            }]
        }
    },
    {
        name: 'ui.settings.importExport',
        url: '/import-export',
        template: '<ma-ui-import-export-page><ma-ui-import-export-page>',
        menuTr: 'header.emport',
        menuIcon: 'import_export',
        permission: 'superadmin',
        params: {
            helpPage: 'ui.help.importExport'
        },
        resolve: {
            loadMyDirectives: ['maRequireQ', '$ocLazyLoad', function(maRequireQ, $ocLazyLoad) {
                return maRequireQ(['./components/importExportPage/importExportPage'], function (importExportPage) {
                    angular.module('maUiImportExportState', [])
                        .component('maUiImportExportPage', importExportPage);
                    $ocLazyLoad.inject('maUiImportExportState');
                });
            }]
        }
    },
    {
        name: 'ui.settings.modules',
        url: '/modules',
        template: '<ma-ui-modules-page><ma-ui-modules-page>',
        menuTr: 'header.modules',
        menuIcon: 'extension',
        permission: 'superadmin',
        params: {
            helpPage: 'ui.help.modules'
        },
        resolve: {
            loadMyDirectives: ['maRequireQ', '$ocLazyLoad', function(maRequireQ, $ocLazyLoad) {
                return maRequireQ(['./components/modulesPage/modulesPage'], function (modulesPage) {
                    angular.module('maUiModulesState', [])
                        .component('maUiModulesPage', modulesPage);
                    $ocLazyLoad.inject('maUiModulesState');
                });
            }]
        }
    },
    {
        name: 'ui.examples',
        url: '/examples',
        menuTr: 'ui.dox.examples',
        menuIcon: 'info',
        menuHidden: true,
        submenu: true,
        weight: 2001
    },
    {
        url: '/play-area',
        name: 'ui.examples.playArea',
        templateUrl: 'views/examples/playArea.html',
        menuTr: 'ui.dox.playArea',
        menuIcon: 'fa-magic',
        params: {
            markup: null
        },
        weight: 990
    },
    {
        name: 'ui.examples.playAreaBig',
        templateUrl: 'views/examples/playAreaBig.html',
        url: '/play-area-big',
        menuTr: 'ui.dox.playAreaBig',
        menuHidden: true,
        menuIcon: 'fa-magic',
        weight: 990
    },
    {
        name: 'ui.examples.basics',
        url: '/basics',
        menuTr: 'ui.dox.basics',
        menuIcon: 'fa-info-circle',
        weight: 995
    },
    {
        name: 'ui.examples.basics.angular',
        templateUrl: 'views/examples/angular.html',
        url: '/angular',
        menuTr: 'ui.dox.angular'
    },
    {
        name: 'ui.examples.basics.pointList',
        templateUrl: 'views/examples/pointList.html',
        url: '/point-list',
        menuTr: 'ui.dox.pointList'
    },
    {
        name: 'ui.examples.basics.getPointByXid',
        templateUrl: 'views/examples/getPointByXid.html',
        url: '/get-point-by-xid',
        menuTr: 'ui.dox.getPointByXid'
    },
    {
        name: 'ui.examples.basics.dataSourceAndDeviceList',
        templateUrl: 'views/examples/dataSourceAndDeviceList.html',
        url: '/data-source-and-device-list',
        menuTr: 'ui.dox.dataSourceAndDeviceList'
    },
    {
        name: 'ui.examples.basics.liveValues',
        templateUrl: 'views/examples/liveValues.html',
        url: '/live-values',
        menuTr: 'ui.dox.liveValues'
    },
    {
        name: 'ui.examples.basics.filters',
        templateUrl: 'views/examples/filters.html',
        url: '/filters',
        menuTr: 'ui.dox.filters'
    },
    {
        name: 'ui.examples.basics.datePresets',
        templateUrl: 'views/examples/datePresets.html',
        url: '/date-presets',
        menuTr: 'ui.dox.datePresets'
    },
    {
        name: 'ui.examples.basics.styleViaValue',
        templateUrl: 'views/examples/styleViaValue.html',
        url: '/style-via-value',
        menuTr: 'ui.dox.styleViaValue'
    },
    {
        name: 'ui.examples.basics.pointValues',
        templateUrl: 'views/examples/pointValues.html',
        url: '/point-values',
        menuTr: 'ui.dox.pointValues'
    },
    {
        name: 'ui.examples.basics.latestPointValues',
        templateUrl: 'views/examples/latestPointValues.html',
        url: '/latest-point-values',
        menuTr: 'ui.dox.latestPointValues'
    },
    {
        name: 'ui.examples.basics.clocksAndTimezones',
        templateUrl: 'views/examples/clocksAndTimezones.html',
        url: '/clocks-and-timezones',
        menuTr: 'ui.dox.clocksAndTimezones'
    },
    {
        name: 'ui.examples.singleValueDisplays',
        url: '/single-value-displays',
        menuTr: 'ui.dox.singleValueDisplays',
        menuIcon: 'fa-tachometer',
        weight: 996
    },
    {
        name: 'ui.examples.singleValueDisplays.gauges',
        templateUrl: 'views/examples/gauges.html',
        url: '/gauges',
        menuTr: 'ui.dox.gauges'
    },
    {
        name: 'ui.examples.singleValueDisplays.switchImage',
        templateUrl: 'views/examples/switchImage.html',
        url: '/switch-image',
        menuTr: 'ui.dox.switchImage'
    },
    {
        name: 'ui.examples.singleValueDisplays.bars',
        templateUrl: 'views/examples/bars.html',
        url: '/bars',
        menuTr: 'ui.dox.bars'
    },
    {
        name: 'ui.examples.singleValueDisplays.tanks',
        templateUrl: 'views/examples/tanks.html',
        url: '/tanks',
        menuTr: 'ui.dox.tanks'
    },
    {
        name: 'ui.examples.charts',
        url: '/charts',
        menuTr: 'ui.dox.charts',
        menuIcon: 'fa-area-chart',
        weight: 997
    },
    {
        name: 'ui.examples.charts.lineChart',
        templateUrl: 'views/examples/lineChart.html',
        url: '/line-chart',
        menuTr: 'ui.dox.lineChart'
    },
    {
        name: 'ui.examples.charts.barChart',
        templateUrl: 'views/examples/barChart.html',
        url: '/bar-chart',
        menuTr: 'ui.dox.barChart'
    },
    {
        name: 'ui.examples.charts.advancedChart',
        templateUrl: 'views/examples/advancedChart.html',
        url: '/advanced-chart',
        menuTr: 'ui.dox.advancedChart'
    },
    {
        name: 'ui.examples.charts.stateChart',
        templateUrl: 'views/examples/stateChart.html',
        url: '/state-chart',
        menuTr: 'ui.dox.stateChart'
    },
    {
        name: 'ui.examples.charts.liveUpdatingChart',
        templateUrl: 'views/examples/liveUpdatingChart.html',
        url: '/live-updating-chart',
        menuTr: 'ui.dox.liveUpdatingChart'
    },
    {
        name: 'ui.examples.charts.pieChart',
        templateUrl: 'views/examples/pieChart.html',
        url: '/pie-chart',
        menuTr: 'ui.dox.pieChart'
    },
    {
        name: 'ui.examples.charts.dailyComparison',
        templateUrl: 'views/examples/dailyComparisonChart.html',
        url: '/daily-comparison',
        menuTr: 'ui.dox.dailyComparisonChart'
    },
    {
        name: 'ui.examples.settingPointValues',
        url: '/setting-point-values',
        menuTr: 'ui.dox.settingPoint',
        menuIcon: 'fa-pencil-square-o',
        weight: 998
    },
    {
        name: 'ui.examples.settingPointValues.setPoint',
        templateUrl: 'views/examples/setPoint.html',
        url: '/set-point',
        menuTr: 'ui.dox.settingPoint'
    },
    {
        name: 'ui.examples.settingPointValues.toggle',
        templateUrl: 'views/examples/toggle.html',
        url: '/toggle',
        menuTr: 'ui.dox.toggle'
    },
    {
        name: 'ui.examples.settingPointValues.sliders',
        templateUrl: 'views/examples/sliders.html',
        url: '/sliders',
        menuTr: 'ui.dox.sliders'
    },
    {
        name: 'ui.examples.settingPointValues.multistateRadio',
        templateUrl: 'views/examples/multistateRadio.html',
        url: '/multistate-radio-buttons',
        menuTr: 'ui.dox.multistateRadio'
    },
    {
        name: 'ui.examples.statistics',
        url: '/statistics',
        menuTr: 'ui.dox.statistics',
        menuIcon: 'fa-table'
    },
    {
        name: 'ui.examples.statistics.getStatistics',
        templateUrl: 'views/examples/getStatistics.html',
        url: '/get-statistics',
        menuTr: 'ui.dox.getStatistics'
    },
    {
        name: 'ui.examples.statistics.statisticsTable',
        templateUrl: 'views/examples/statisticsTable.html',
        url: '/statistics-table',
        menuTr: 'ui.dox.statisticsTable'
    },
    {
        name: 'ui.examples.statistics.statePieChart',
        templateUrl: 'views/examples/statePieChart.html',
        url: '/state-pie-chart',
        menuTr: 'ui.dox.statePieChart'
    },
    {
        name: 'ui.examples.pointArrays',
        url: '/point-arrays',
        menuTr: 'ui.dox.pointArrayTemplating',
        menuIcon: 'fa-list'
    },
    {
        name: 'ui.examples.pointArrays.buildPointArray',
        templateUrl: 'views/examples/buildPointArray.html',
        url: '/build-point-array',
        menuTr: 'ui.dox.buildPointArray'
    },
    {
        name: 'ui.examples.pointArrays.pointArrayTable',
        templateUrl: 'views/examples/pointArrayTable.html',
        url: '/point-array-table',
        menuTr: 'ui.dox.pointArrayTable'
    },
    {
        name: 'ui.examples.pointArrays.pointArrayLineChart',
        templateUrl: 'views/examples/pointArrayLineChart.html',
        url: '/point-array-line-chart',
        menuTr: 'ui.dox.pointArrayLineChart'
    },
    {
        name: 'ui.examples.pointArrays.templating',
        templateUrl: 'views/examples/templating.html',
        url: '/templating',
        menuTr: 'ui.dox.templating'
    },
    {
        name: 'ui.examples.pointArrays.dataPointTable',
        templateUrl: 'views/examples/dataPointTable.html',
        url: '/data-point-table',
        menuTr: 'ui.dox.dataPointTable'
    },
    {
        name: 'ui.examples.pointHierarchy',
        url: '/point-hierarchy',
        menuTr: 'ui.dox.pointHierarchy',
        menuIcon: 'fa-sitemap'
    },
    {
        name: 'ui.examples.pointHierarchy.displayTree',
        templateUrl: 'views/examples/displayTree.html',
        url: '/display-tree',
        menuTr: 'ui.dox.displayTree'
    },
    {
        name: 'ui.examples.pointHierarchy.pointHierarchyLineChart',
        templateUrl: 'views/examples/pointHierarchyLineChart.html',
        url: '/line-chart',
        menuTr: 'ui.dox.pointHierarchyLineChart'
    },
    {
        name: 'ui.examples.templates',
        url: '/templates',
        menuTr: 'ui.dox.templates',
        menuIcon: 'fa-file-o'
    },
    {
        name: 'ui.examples.templates.angularMaterial',
        templateUrl: 'views/examples/angularMaterial.html',
        url: '/angular-material',
        menuText: 'Angular Material'
    },
    {
        name: 'ui.examples.templates.bootstrap',
        templateUrl: 'views/examples/bootstrap.html',
        url: '/bootstrap',
        menuText: 'Bootstrap 3'
    },
    {
        name: 'ui.examples.templates.autoLogin',
        templateUrl: 'views/examples/autoLogin.html',
        url: '/auto-login',
        menuTr: 'ui.dox.autoLogin'
    },
    {
        name: 'ui.examples.templates.extendApp',
        templateUrl: 'views/examples/extendApp.html',
        url: '/extend-app',
        menuTr: 'ui.dox.extendApp'
    },
    {
        name: 'ui.examples.templates.loginPage',
        templateUrl: 'views/examples/loginPageTemplate.html',
        url: '/login-page',
        menuTr: 'ui.dox.loginPageTemplate'
    },
    {
        name: 'ui.examples.templates.adminTemplate',
        templateUrl: 'views/examples/adminTemplate.html',
        url: '/admin-template',
        menuTr: 'ui.dox.adminTemplate'
    },
    {
        name: 'ui.examples.templates.adaptiveLayouts',
        templateUrl: 'views/examples/adaptiveLayouts.html',
        url: '/adaptive-layouts',
        menuText: 'Adaptive Layouts'
    },
    {
        name: 'ui.examples.utilities',
        url: '/utilities',
        menuTr: 'ui.dox.utilities',
        menuIcon: 'fa-wrench'
    },
    {
        name: 'ui.examples.utilities.translation',
        templateUrl: 'views/examples/translation.html',
        url: '/translation',
        menuTr: 'ui.dox.translation'
    },
    {
        name: 'ui.examples.utilities.jsonStore',
        templateUrl: 'views/examples/jsonStore.html',
        url: '/json-store',
        menuTr: 'ui.dox.jsonStore'
    },
    {
        name: 'ui.examples.utilities.watchdog',
        templateUrl: 'views/examples/watchdog.html',
        url: '/watchdog',
        menuTr: 'ui.dox.watchdog'
    },
    {
        name: 'ui.examples.utilities.eventsTable',
        templateUrl: 'views/examples/eventsTable.html',
        url: '/events-table',
        menuTr: 'ui.app.eventsTable'
    },
    {
        name: 'ui.examples.utilities.googleMaps',
        templateUrl: 'views/examples/googleMaps.html',
        url: '/google-maps',
        menuText: 'Google Maps'
    }
];

});
