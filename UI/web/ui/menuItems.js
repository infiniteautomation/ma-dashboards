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
        templateUrl: require.toUrl('./views/login.html'),
        menuHidden: true,
        menuIcon: 'exit_to_app',
        menuTr: 'header.login',
        resolve: {
            deps: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
                return maRequireQ(['./directives/login/login'], function(login) {
                    angular.module('maUiLoginState', [])
                        .directive('maUiLogin', login);
                    $injector.loadNewModules(['maUiLoginState']);
                });
            }],
            loginTranslations: loadLoginTranslations
        }
    },
    {
        name: 'resetPassword',
        url: '/reset-password?resetToken',
        templateUrl: require.toUrl('./views/resetPassword.html'),
        menuHidden: true,
        menuIcon: 'vpn_key',
        menuTr: 'header.resetPassword',
        resolve: {
            deps: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
                return maRequireQ(['./components/resetPassword/resetPassword'], function(resetPassword) {
                    angular.module('maUiResetPasswordState', [])
                        .component('maUiResetPassword', resetPassword);
                    $injector.loadNewModules(['maUiResetPasswordState']);
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
        templateUrl: require.toUrl('./views/agreeToLicense.html'),
        menuTr: 'ui.app.agreeToLicense',
        menuIcon: 'done',
        menuHidden: true
    },
    {
        name: 'ui',
        templateUrl: require.toUrl('./views/main.html'),
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
            loadMyDirectives: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
                return maRequireQ(['./services/menuEditor',
                           './components/menu/jsonStoreMenu',
                           './components/menu/menu',
                           './components/menu/menuLink',
                           './components/menu/menuToggle',
                           './directives/menuEditor/menuEditor',
                           './directives/pageEditor/pageEditor',
                           './directives/pageEditor/pageEditorControls',
                           './directives/liveEditor/dualPaneEditor',
                           './components/autoLoginSettings/autoLoginSettings',
                           './components/activeEventIcons/activeEventIcons',
                           './components/dateBar/dateBar',
                           './components/footer/footer',
                           'angular-ui-ace'
                ], function(menuEditorFactory, jsonStoreMenu, menu, menuLink, menuToggle,
                        menuEditor, pageEditor, pageEditorControls, dualPaneEditor, autoLoginSettings, activeEventIcons, dateBar, footer) {
                    angular.module('maUiRootState', ['ui.ace'])
                        .factory('maUiMenuEditor', menuEditorFactory)
                        .directive('maUiMenuEditor', menuEditor)
                        .directive('maUiPageEditor', pageEditor)
                        .directive('maUiPageEditorControls', pageEditorControls)
                        .directive('maUiDualPaneEditor', dualPaneEditor)
                        .component('maUiJsonStoreMenu', jsonStoreMenu)
                        .component('maUiMenu', menu)
                        .component('maUiMenuLink', menuLink)
                        .component('maUiMenuToggle', menuToggle)
                        .component('maUiAutoLoginSettings', autoLoginSettings)
                        .component('maUiActiveEventIcons', activeEventIcons)
                        .component('maUiDateBar', dateBar)
                        .component('maUiFooter', footer);
                    $injector.loadNewModules(['maUiRootState']);
                });
            }],
            rootScopeData: ['$rootScope', 'maSystemSettings', 'maModules', function($rootScope, SystemSettings, maModules) {
                maModules.getCore().then((coreModule) => {
                    $rootScope.coreModule = coreModule;
                }, angular.noop);

                new SystemSettings('instanceDescription').getValue().then((result) => {
                    $rootScope.instanceDescription = result;
                }, angular.noop);
            }]
        }
    },
    {
        name: 'ui.notFound',
        url: '/not-found?path',
        templateUrl: require.toUrl('./views/notFound.html'),
        menuHidden: true,
        menuTr: 'ui.app.pageNotFound',
        weight: 3000
    },
    {
        name: 'ui.unauthorized',
        url: '/unauthorized?path',
        templateUrl: require.toUrl('./views/unauthorized.html'),
        menuHidden: true,
        menuTr: 'ui.app.unauthorized',
        weight: 3000
    },
    {
        name: 'ui.error',
        url: '/error',
        templateUrl: require.toUrl('./views/error.html'),
        menuHidden: true,
        menuTr: 'ui.app.error',
        weight: 3000
    },
    {
        name: 'ui.serverError',
        url: '/server-error',
        templateUrl: require.toUrl('./views/serverError.html'),
        menuHidden: true,
        menuTr: 'ui.app.serverError',
        weight: 3000
    },
    {
        name: 'ui.home',
        url: '/home',
        templateUrl: require.toUrl('./views/home.html'),
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
            loadMyDirectives: ['maRequireQ', '$injector', 'maCssInjector', function(maRequireQ, $injector, cssInjector) {
                return maRequireQ(['./directives/watchList/watchListPage',
                            './directives/watchList/watchListTableRow'], 
                function (watchListPage, watchListTableRow) {
                    angular.module('maUiWatchListState', [])
                        .directive('maUiWatchListPage', watchListPage)
                        .directive('maUiWatchListTableRow', watchListTableRow);
                    $injector.loadNewModules(['maUiWatchListState']);
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
            loadMyDirectives: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
                return maRequireQ(['./components/dataPointDetails/dataPointDetails'], function (dataPointDetails) {
                    angular.module('maUiDataPointDetailsState', [])
                        .component('maUiDataPointDetails', dataPointDetails);
                    $injector.loadNewModules(['maUiDataPointDetailsState']);
                });
            }]
        }
    },
    {
        name: 'ui.events',
        url: '/events?eventType&alarmLevel&activeStatus&acknowledged&dateFilter',
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
            loadMyDirectives: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
                return maRequireQ(['./components/eventsPage/eventsPage'], function (eventsPage) {
                    angular.module('maUiEventsState', [])
                        .component('maUiEventsPage', eventsPage);
                    $injector.loadNewModules(['maUiEventsState']);
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
        templateUrl: require.toUrl('./views/help/gettingStarted.html'),
        menuTr: 'ui.dox.gettingStarted',
        weight: 900
    },
    {
        name: 'ui.help.legacy',
        url: '/legacy',
        templateUrl: require.toUrl('./views/help/legacy.html'),
        menuHidden: true,
        menuTr: 'ui.dox.legacyHelp'
    },
    {
        url: '/watch-list',
        name: 'ui.help.watchList',
        templateUrl: require.toUrl('./views/help/watchList.html'),
        menuTr: 'ui.dox.watchList'
    },
    {
        url: '/data-point-details',
        name: 'ui.help.dataPointDetails',
        templateUrl: require.toUrl('./views/help/dataPointDetails.html'),
        menuTr: 'ui.dox.dataPointDetails'
    },
    {
        url: '/events',
        name: 'ui.help.events',
        templateUrl: require.toUrl('./views/help/events.html'),
        menuTr: 'ui.dox.events'
    },
    {
        url: '/date-bar',
        name: 'ui.help.dateBar',
        templateUrl: require.toUrl('./views/help/dateBar.html'),
        menuTr: 'ui.dox.dateBar'
    },
    {
        url: '/ui-settings',
        name: 'ui.help.uiSettings',
        templateUrl: require.toUrl('./views/help/uiSettings.html'),
        menuTr: 'ui.app.uiSettings'
    },
    {
        url: '/watch-list-builder',
        name: 'ui.help.watchListBuilder',
        templateUrl: require.toUrl('./views/help/watchListBuilder.html'),
        menuTr: 'ui.app.watchListBuilder'
    },
    {
        url: '/custom-pages',
        name: 'ui.help.customPages',
        templateUrl: require.toUrl('./views/help/customPages.html'),
        menuTr: 'ui.dox.customPages'
    },
    {
        url: '/menu-editor',
        name: 'ui.help.menuEditor',
        templateUrl: require.toUrl('./views/help/menuEditor.html'),
        menuTr: 'ui.dox.menuEditor'
    },
    {
        url: '/users',
        name: 'ui.help.users',
        templateUrl: require.toUrl('./views/help/users.html'),
        menuTr: 'header.users'
    },
    {
        url: '/custom-dashboards',
        name: 'ui.help.customDashboards',
        templateUrl: require.toUrl('./views/help/customDashboards.html'),
        menuTr: 'ui.dox.customDashboards'
    },
    {
        url: '/system-status',
        name: 'ui.help.systemStatus',
        templateUrl: require.toUrl('./views/help/systemStatus.html'),
        menuTr: 'ui.settings.systemStatus'
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
        templateUrl: require.toUrl('./views/editPages.html'),
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
        templateUrl: require.toUrl('./views/editMenu.html'),
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
        templateUrl: require.toUrl('./views/autoLoginSettings.html'),
        menuTr: 'ui.app.autoLoginSettings',
        menuIcon: 'face',
        permission: 'superadmin'
    },
    {
        url: '/ui-settings',
        name: 'ui.settings.uiSettings',
        template: '<ma-ui-settings-page></ma-ui-settings-page>',
        menuTr: 'ui.app.uiSettings',
        menuIcon: 'color_lens',
        permission: 'edit-ui-settings',
        params: {
            helpPage: 'ui.help.uiSettings'
        },
        resolve: {
            loadMyDirectives: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
                return maRequireQ(['./components/uiSettingsPage/uiSettingsPage'],
                function (uiSettingsPage) {
                    angular.module('maUiSettingsPage', [])
                        .component('maUiSettingsPage', uiSettingsPage);
                    $injector.loadNewModules(['maUiSettingsPage']);
                });
            }]
        }
    },
    {
        name: 'ui.settings.users',
        url: '/users/{username}',
        template: '<ma-ui-users-page flex="noshrink" layout="column"><ma-ui-users-page>',
        menuTr: 'header.users',
        menuIcon: 'people',
        permission: 'superadmin',
        params: {
            helpPage: 'ui.help.users'
        },
        resolve: {
            loadMyDirectives: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
                return maRequireQ(['./components/usersPage/usersPage'], function (usersPage) {
                    angular.module('maUiUsersState', [])
                        .component('maUiUsersPage', usersPage);
                    $injector.loadNewModules(['maUiUsersState']);
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
            loadMyDirectives: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
                return maRequireQ(['./components/systemSettingsPage/systemSettingsPage'], function (systemSettingsPage) {
                    angular.module('maUiSystemSettingsState', [])
                        .component('maUiSystemSettingsPage', systemSettingsPage);
                    $injector.loadNewModules(['maUiSystemSettingsState']);
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
        name: 'ui.settings.system.permissions',
        url: '/permissions',
        menuTr: 'systemSettings.systemPermissions',
        templateUrl: require.toUrl('./systemSettings/permissions.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.systemStatus',
        url: '/system-status',
        template: '<ma-ui-system-status-page flex="noshrink" layout="column"><ma-ui-system-status-page>',
        menuTr: 'ui.settings.systemStatus',
        menuIcon: 'new_releases',
        permission: 'superadmin',
        params: {
            helpPage: 'ui.help.systemStatus'
        },
        resolve: {
            loadMyDirectives: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
                return maRequireQ(['./components/systemStatusPage/systemStatusPage'], function (systemStatusPage) {
                    angular.module('maUiSystemStatusState', [])
                        .component('maUiSystemStatusPage', systemStatusPage);
                    $injector.loadNewModules(['maUiSystemStatusState']);
                });
            }]
        }
    },
    {
        name: 'ui.settings.systemStatus.auditTrail',
        url: '/audit-trail',
        menuTr: 'ui.settings.systemStatus.auditTrail',
        templateUrl: require.toUrl('./systemStatus/auditTrail.html'),
        menuHidden: true,
        params: {
            dateBar: {
                rollupControls: false
            }
        },
    },
    {
        name: 'ui.settings.systemStatus.loggingConsole',
        url: '/logging-console',
        menuTr: 'ui.settings.systemStatus.loggingConsole',
        templateUrl: require.toUrl('./systemStatus/loggingConsole.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.systemStatus.internalMetrics',
        url: '/internal-metrics',
        menuTr: 'ui.settings.systemStatus.internalMetrics',
        templateUrl: require.toUrl('./systemStatus/internalMetrics.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.systemStatus.workItems',
        url: '/work-items',
        menuTr: 'ui.settings.systemStatus.workItems',
        templateUrl: require.toUrl('./systemStatus/workItems.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.systemStatus.threads',
        url: '/threads',
        menuTr: 'ui.settings.systemStatus.threads',
        templateUrl: require.toUrl('./systemStatus/threads.html'),
        menuHidden: true
    },
    {
        name: 'ui.settings.systemStatus.serverInfo',
        url: '/server-info',
        menuTr: 'ui.settings.systemStatus.serverInfo',
        templateUrl: require.toUrl('./systemStatus/serverInfo.html'),
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
            loadMyDirectives: ['maRequireQ', '$injector', 'maCssInjector', function(maRequireQ, $injector, cssInjector) {
                return maRequireQ(['./components/watchListBuilder/watchListBuilder', './directives/bracketEscape/bracketEscape'],
                        function (watchListBuilder, bracketEscape) {
                    angular.module('maUiWatchListBuilderState', [])
                        .directive('maUiBracketEscape', bracketEscape)
                        .component('maUiWatchListBuilder', watchListBuilder);
                    $injector.loadNewModules(['maUiWatchListBuilderState']);
                    cssInjector.injectLink(require.toUrl('./components/watchListBuilder/watchListBuilder.css'),
                            'watchListBuilder' ,'link[href="styles/main.css"]');
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
            loadMyDirectives: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
                return maRequireQ(['./components/importExportPage/importExportPage'], function (importExportPage) {
                    angular.module('maUiImportExportState', [])
                        .component('maUiImportExportPage', importExportPage);
                    $injector.loadNewModules(['maUiImportExportState']);
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
            loadMyDirectives: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
                return maRequireQ(['./components/modulesPage/modulesPage'], function (modulesPage) {
                    angular.module('maUiModulesState', [])
                        .component('maUiModulesPage', modulesPage);
                    $injector.loadNewModules(['maUiModulesState']);
                });
            }]
        }
    },
    {
        name: 'ui.settings.modules.upgrade',
        url: '/upgrade',
        views: {
        	'@ui.settings': {
                template: '<ma-ui-upgrade-page flex layout="column"><ma-ui-upgrade-page>'
        	}
        },
        menuTr: 'ui.app.moduleUpgrades',
        menuIcon: 'update',
        permission: 'superadmin',
        menuHidden: true,
        resolve: {
            loadMyDirectives: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
                return maRequireQ(['./components/upgradePage/upgradePage'], function (upgradePage) {
                    angular.module('maUiUpgradeState', [])
                        .component('maUiUpgradePage', upgradePage);
                    $injector.loadNewModules(['maUiUpgradeState']);
                });
            }]
        }
    },
    {
        name: 'ui.settings.fileStores',
        url: '/file-stores',
        template: '<ma-file-store-browser flex preview="true" ng-model="tmp"><ma-file-store-browser>',
        menuTr: 'ui.app.fileStores',
        menuIcon: 'file_upload',
        permission: 'superadmin'
    },
    {
        name: 'ui.settings.jsonStore',
        url: '/json-store',
        template: `<h1 ma-tr="ui.app.jsonStorePage"></h1>
            <div>
                <md-button class="md-raised" ui-sref="ui.settings.jsonStoreEditor">
                    <md-icon>add</md-icon>
                    <span ma-tr="ui.app.jsonStoreNew"></span>
                </md-button>
            </div>
            <ma-json-store-table edit-clicked="$state.go(\'ui.settings.jsonStoreEditor\', {xid: $item.xid})"><ma-json-store-table>`,
        menuTr: 'ui.app.jsonStorePage',
        menuIcon: 'sd_storage',
        permission: 'superadmin'
    },
    {
        name: 'ui.settings.jsonStoreEditor',
        url: '/json-store-editor/{xid}',
        template: `<h1 ma-tr="ui.app.jsonStoreEditorPage"></h1>
            <div>
                <md-button class="md-raised" ui-sref="ui.settings.jsonStore">
                    <md-icon>arrow_back</md-icon>
                    <span ma-tr="ui.app.backToJsonTable"></span>
                </md-button>
            </div>
            <ma-json-store item="item" xid="{{$state.params.xid}}"></ma-json-store>
            <ma-json-store-editor ng-if="item || !$state.params.xid" ng-model="item"><ma-json-store-editor>`,
        menuTr: 'ui.app.jsonStoreEditorPage',
        menuIcon: 'sd_storage',
        permission: 'superadmin',
        menuHidden: true
    },
//    {
//        name: 'ui.settings.eventHandlers',
//        url: '/event-handlers/{xid}',
//        template: '<ma-ui-event-handler-page flex="noshrink" layout="column"><ma-ui-event-handler-page>',
//        menuTr: 'ui.app.eventHandlers',
//        menuIcon: 'link',
//        permission: 'superadmin',
//        resolve: {
//            loadMyDirectives: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
//                return maRequireQ(['./components/eventHandlerPage/eventHandlerPage'], function (eventHandlerPage) {
//                    angular.module('eventHandlerPage', [])
//                        .component('maUiEventHandlerPage', eventHandlerPage);
//                    $injector.loadNewModules(['eventHandlerPage']);
//                });
//            }]
//        }
//    },
    {
        name: 'ui.examples',
        url: '/examples',
        menuTr: 'ui.dox.examples',
        menuIcon: 'info',
        // menuHidden: true,
        permission: 'edit-ui-pages',
        submenu: true,
        weight: 2001
    },
    {
        url: '/play-area',
        name: 'ui.examples.playArea',
        templateUrl: require.toUrl('./views/examples/playArea.html'),
        menuTr: 'ui.dox.playArea',
        menuIcon: 'fa-magic',
        params: {
            markup: null
        },
        weight: 990
    },
    {
        name: 'ui.examples.playAreaBig',
        templateUrl: require.toUrl('./views/examples/playAreaBig.html'),
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
        templateUrl: require.toUrl('./views/examples/angular.html'),
        url: '/angular',
        menuTr: 'ui.dox.angular'
    },
    {
        name: 'ui.examples.basics.pointList',
        templateUrl: require.toUrl('./views/examples/pointList.html'),
        url: '/point-list',
        menuTr: 'ui.dox.pointList'
    },
    {
        name: 'ui.examples.basics.getPointByXid',
        templateUrl: require.toUrl('./views/examples/getPointByXid.html'),
        url: '/get-point-by-xid',
        menuTr: 'ui.dox.getPointByXid'
    },
    {
        name: 'ui.examples.basics.dataSourceAndDeviceList',
        templateUrl: require.toUrl('./views/examples/dataSourceAndDeviceList.html'),
        url: '/data-source-and-device-list',
        menuTr: 'ui.dox.dataSourceAndDeviceList'
    },
    {
        name: 'ui.examples.basics.liveValues',
        templateUrl: require.toUrl('./views/examples/liveValues.html'),
        url: '/live-values',
        menuTr: 'ui.dox.liveValues'
    },
    {
        name: 'ui.examples.basics.filters',
        templateUrl: require.toUrl('./views/examples/filters.html'),
        url: '/filters',
        menuTr: 'ui.dox.filters'
    },
    {
        name: 'ui.examples.basics.datePresets',
        templateUrl: require.toUrl('./views/examples/datePresets.html'),
        url: '/date-presets',
        menuTr: 'ui.dox.datePresets'
    },
    {
        name: 'ui.examples.basics.styleViaValue',
        templateUrl: require.toUrl('./views/examples/styleViaValue.html'),
        url: '/style-via-value',
        menuTr: 'ui.dox.styleViaValue'
    },
    {
        name: 'ui.examples.basics.pointValues',
        templateUrl: require.toUrl('./views/examples/pointValues.html'),
        url: '/point-values',
        menuTr: 'ui.dox.pointValues'
    },
    {
        name: 'ui.examples.basics.latestPointValues',
        templateUrl: require.toUrl('./views/examples/latestPointValues.html'),
        url: '/latest-point-values',
        menuTr: 'ui.dox.latestPointValues'
    },
    {
        name: 'ui.examples.basics.clocksAndTimezones',
        templateUrl: require.toUrl('./views/examples/clocksAndTimezones.html'),
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
        templateUrl: require.toUrl('./views/examples/gauges.html'),
        url: '/gauges',
        menuTr: 'ui.dox.gauges'
    },
    {
        name: 'ui.examples.singleValueDisplays.switchImage',
        templateUrl: require.toUrl('./views/examples/switchImage.html'),
        url: '/switch-image',
        menuTr: 'ui.dox.switchImage'
    },
    {
        name: 'ui.examples.singleValueDisplays.bars',
        templateUrl: require.toUrl('./views/examples/bars.html'),
        url: '/bars',
        menuTr: 'ui.dox.bars'
    },
    {
        name: 'ui.examples.singleValueDisplays.tanks',
        templateUrl: require.toUrl('./views/examples/tanks.html'),
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
        templateUrl: require.toUrl('./views/examples/lineChart.html'),
        url: '/line-chart',
        menuTr: 'ui.dox.lineChart'
    },
    {
        name: 'ui.examples.charts.barChart',
        templateUrl: require.toUrl('./views/examples/barChart.html'),
        url: '/bar-chart',
        menuTr: 'ui.dox.barChart'
    },
    {
        name: 'ui.examples.charts.advancedChart',
        templateUrl: require.toUrl('./views/examples/advancedChart.html'),
        url: '/advanced-chart',
        menuTr: 'ui.dox.advancedChart'
    },
    {
        name: 'ui.examples.charts.stateChart',
        templateUrl: require.toUrl('./views/examples/stateChart.html'),
        url: '/state-chart',
        menuTr: 'ui.dox.stateChart'
    },
    {
        name: 'ui.examples.charts.liveUpdatingChart',
        templateUrl: require.toUrl('./views/examples/liveUpdatingChart.html'),
        url: '/live-updating-chart',
        menuTr: 'ui.dox.liveUpdatingChart'
    },
    {
        name: 'ui.examples.charts.pieChart',
        templateUrl: require.toUrl('./views/examples/pieChart.html'),
        url: '/pie-chart',
        menuTr: 'ui.dox.pieChart'
    },
    {
        name: 'ui.examples.charts.dailyComparison',
        templateUrl: require.toUrl('./views/examples/dailyComparisonChart.html'),
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
        templateUrl: require.toUrl('./views/examples/setPoint.html'),
        url: '/set-point',
        menuTr: 'ui.dox.settingPoint'
    },
    {
        name: 'ui.examples.settingPointValues.toggle',
        templateUrl: require.toUrl('./views/examples/toggle.html'),
        url: '/toggle',
        menuTr: 'ui.dox.toggle'
    },
    {
        name: 'ui.examples.settingPointValues.sliders',
        templateUrl: require.toUrl('./views/examples/sliders.html'),
        url: '/sliders',
        menuTr: 'ui.dox.sliders'
    },
    {
        name: 'ui.examples.settingPointValues.multistateRadio',
        templateUrl: require.toUrl('./views/examples/multistateRadio.html'),
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
        templateUrl: require.toUrl('./views/examples/getStatistics.html'),
        url: '/get-statistics',
        menuTr: 'ui.dox.getStatistics'
    },
    {
        name: 'ui.examples.statistics.statisticsTable',
        templateUrl: require.toUrl('./views/examples/statisticsTable.html'),
        url: '/statistics-table',
        menuTr: 'ui.dox.statisticsTable'
    },
    {
        name: 'ui.examples.statistics.statePieChart',
        templateUrl: require.toUrl('./views/examples/statePieChart.html'),
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
        templateUrl: require.toUrl('./views/examples/buildPointArray.html'),
        url: '/build-point-array',
        menuTr: 'ui.dox.buildPointArray'
    },
    {
        name: 'ui.examples.pointArrays.pointArrayTable',
        templateUrl: require.toUrl('./views/examples/pointArrayTable.html'),
        url: '/point-array-table',
        menuTr: 'ui.dox.pointArrayTable'
    },
    {
        name: 'ui.examples.pointArrays.pointArrayLineChart',
        templateUrl: require.toUrl('./views/examples/pointArrayLineChart.html'),
        url: '/point-array-line-chart',
        menuTr: 'ui.dox.pointArrayLineChart'
    },
    {
        name: 'ui.examples.pointArrays.templating',
        templateUrl: require.toUrl('./views/examples/templating.html'),
        url: '/templating',
        menuTr: 'ui.dox.templating'
    },
    {
        name: 'ui.examples.pointArrays.dataPointTable',
        templateUrl: require.toUrl('./views/examples/dataPointTable.html'),
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
        templateUrl: require.toUrl('./views/examples/displayTree.html'),
        url: '/display-tree',
        menuTr: 'ui.dox.displayTree'
    },
    {
        name: 'ui.examples.pointHierarchy.pointHierarchyLineChart',
        templateUrl: require.toUrl('./views/examples/pointHierarchyLineChart.html'),
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
        templateUrl: require.toUrl('./views/examples/angularMaterial.html'),
        url: '/angular-material',
        menuText: 'Angular Material'
    },
    {
        name: 'ui.examples.templates.bootstrap',
        templateUrl: require.toUrl('./views/examples/bootstrap.html'),
        url: '/bootstrap',
        menuText: 'Bootstrap 3'
    },
    {
        name: 'ui.examples.templates.autoLogin',
        templateUrl: require.toUrl('./views/examples/autoLogin.html'),
        url: '/auto-login',
        menuTr: 'ui.dox.autoLogin'
    },
    {
        name: 'ui.examples.templates.extendApp',
        templateUrl: require.toUrl('./views/examples/extendApp.html'),
        url: '/extend-app',
        menuTr: 'ui.dox.extendApp'
    },
    {
        name: 'ui.examples.templates.loginPage',
        templateUrl: require.toUrl('./views/examples/loginPageTemplate.html'),
        url: '/login-page',
        menuTr: 'ui.dox.loginPageTemplate'
    },
    {
        name: 'ui.examples.templates.adminTemplate',
        templateUrl: require.toUrl('./views/examples/adminTemplate.html'),
        url: '/admin-template',
        menuTr: 'ui.dox.adminTemplate'
    },
    {
        name: 'ui.examples.templates.adaptiveLayouts',
        templateUrl: require.toUrl('./views/examples/adaptiveLayouts.html'),
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
        templateUrl: require.toUrl('./views/examples/translation.html'),
        url: '/translation',
        menuTr: 'ui.dox.translation'
    },
    {
        name: 'ui.examples.utilities.jsonStore',
        templateUrl: require.toUrl('./views/examples/jsonStore.html'),
        url: '/json-store',
        menuTr: 'ui.dox.jsonStore'
    },
    {
        name: 'ui.examples.utilities.watchdog',
        templateUrl: require.toUrl('./views/examples/watchdog.html'),
        url: '/watchdog',
        menuTr: 'ui.dox.watchdog'
    },
    {
        name: 'ui.examples.utilities.eventsTable',
        templateUrl: require.toUrl('./views/examples/eventsTable.html'),
        url: '/events-table',
        menuTr: 'ui.app.eventsTable'
    },
    {
        name: 'ui.examples.utilities.googleMaps',
        templateUrl: require.toUrl('./views/examples/googleMaps.html'),
        url: '/google-maps',
        menuText: 'Google Maps'
    },
    {
        name: 'ui.examples.svg',
        url: '/svg',
        menuTr: 'ui.dox.svgGraphics',
        menuIcon: 'fa-picture-o'
    },
    {
        name: 'ui.examples.svg.basicUsage',
        templateUrl: require.toUrl('./views/examples/svgBasic.html'),
        url: '/basic-usage',
        menuTr: 'ui.dox.basicSvg'
    },
    {
        name: 'ui.examples.svg.interactiveSvg',
        templateUrl: require.toUrl('./views/examples/svgAdvanced.html'),
        url: '/interactive-svg',
        menuTr: 'ui.dox.interactiveSvg'
    }
];

});
