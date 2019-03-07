/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import StackTrace from 'stacktrace-js';

export default [
    {
        name: 'login',
        url: '/login',
        menuHidden: true,
        menuIcon: 'exit_to_app',
        menuTr: 'header.login',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.login" */
                        './views/login.html');
            },
            deps: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.login" */
                        './directives/login/login').then(login => {
                    angular.module('maUiLoginState', [])
                        .directive('maUiLogin', login.default);
                    $injector.loadNewModules(['maUiLoginState']);
                });
            }]
        }
    },
    {
        name: 'resetPassword',
        url: '/reset-password?resetToken',
        menuHidden: true,
        menuIcon: 'code',
        menuTr: 'header.resetPassword',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.login" */
                        './views/resetPassword.html');
            },
            deps: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.login" */
                        './components/resetPassword/resetPassword').then(resetPassword => {
                    angular.module('maUiResetPasswordState', [])
                        .component('maUiResetPassword', resetPassword.default);
                    $injector.loadNewModules(['maUiResetPasswordState']);
                });
            }]
        }
    },
    {
        name: 'forgotPassword',
        url: '/forgot-password?username',
        menuHidden: true,
        menuIcon: 'live_help',
        menuTr: 'header.forgotPassword',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.login" */
                        './views/forgotPassword.html');
            },
            deps: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.login" */
                        './components/forgotPassword/forgotPassword').then(forgotPassword => {
                    angular.module('maUiForgotPasswordState', [])
                        .component('maUiForgotPassword', forgotPassword.default);
                    $injector.loadNewModules(['maUiForgotPasswordState']);
                });
            }]
        }
    },
    {
        name: 'changePassword',
        url: '/change-password?username',
        menuHidden: true,
        menuIcon: 'vpn_key',
        menuTr: 'header.changePasword',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.login" */
                        './views/changePassword.html');
            },
            deps: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.login" */
                        './components/changePassword/changePassword').then(changePassword => {
                    angular.module('maUiChangePasswordState', [])
                        .component('maUiChangePassword', changePassword.default);
                    $injector.loadNewModules(['maUiChangePasswordState']);
                });
            }]
        },
        params: {
            credentialsExpired: null,
            password: null
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
        template: '<ma-ui-license-page flex layout="column"></ma-ui-license-page>',
        resolve: {
            maUiAgreeToLicensePage: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.main" */
                        './components/licensePage/licensePage').then(licensePage => {
                    angular.module('maUiLicensePage', [])
                        .component('maUiLicensePage', licensePage.default);
                    $injector.loadNewModules(['maUiLicensePage']);
                });
            }]
        },
        menuTr: 'ui.app.agreeToLicense',
        menuIcon: 'done',
        menuHidden: true
    },
    {
        name: 'ui',
        'abstract': true,
        menuHidden: true,
        menuTr: 'ui.app.ui',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.main" */
                        './views/main.html');
            },
            auth: ['maUser', function(User) {
                if (!User.current) {
                    throw new User.NoUserError('No user logged in');
                }
            }],
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.main" */
                        './mainModule').then(() => {
                    $injector.loadNewModules(['maUiRootState']);
                });
            }],
            rootScopeData: ['$rootScope', 'maUiServerInfo', function($rootScope, maUiServerInfo) {
                return maUiServerInfo.getPostLoginData().then(serverInfo => {
                    $rootScope.serverInfo = serverInfo;
                });
            }]
        }
    },
    {
        name: 'ui.notFound',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.main" */
                        './views/notFound.html');
            }
        },
        url: '/not-found?path',
        menuHidden: true,
        menuTr: 'ui.app.pageNotFound',
        weight: 3000
    },
    {
        name: 'ui.unauthorized',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.main" */
                        './views/unauthorized.html');
            }
        },
        url: '/unauthorized?path',
        menuHidden: true,
        menuTr: 'ui.app.unauthorized',
        weight: 3000
    },
    {
        name: 'ui.error',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.main" */
                        './views/error.html');
            },
            errorFrames: ['$stateParams', function($stateParams) {
                if ($stateParams.error && $stateParams.error instanceof Error) {
                    try {
                        return StackTrace.fromError($stateParams.error, {offline: true});
                    } catch (e) {
                    }
                }
            }]
        },
        url: '/error',
        menuHidden: true,
        menuTr: 'ui.app.error',
        weight: 3000,
        params: {
            toState: null,
            toParams: null,
            fromState: null,
            fromParams: null,
            error: null
        },
        controller: ['$scope', 'errorFrames', '$stateParams', function($scope, errorFrames, $stateParams) {
            $scope.frames = errorFrames;
            if (Array.isArray(errorFrames)) {
                const stackTraceLines = errorFrames.map(frame => {
                    return `\tat ${frame.functionName} (${frame.fileName}:${frame.lineNumber}:${frame.columnNumber})`;
                });
                
                stackTraceLines.unshift('' + $stateParams.error);
                $scope.stackTrace = stackTraceLines.join('\n');
            }
        }]
    },
    {
        name: 'ui.serverError',
        url: '/server-error',
        menuHidden: true,
        menuTr: 'ui.app.serverError',
        weight: 3000,
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.main" */
                        './views/serverError.html');
            }
        },
        controller: ['$scope', '$http', function($scope, $http) {
            $http({url: '/rest/v2/exception/latest'}).then(response => {
                const exception = $scope.exception = response.data.MANGO_USER_LAST_EXCEPTION;
                if (exception) {
                    $scope.fullStack = printException(exception).join('\n');
                    $scope.rootCause = printException(exception, true).join('\n');
                } else {
                    $scope.noException = true;
                }
            });
            
            function printException(e, rootCauseOnly = false, lines = [], depth = 0) {
                if (rootCauseOnly) {
                    while(e.cause != null) {
                        e = e.cause;
                    }
                }
                
                lines.push(depth > 0 ? `Caused by: ${e.localizedMessage}` : e.localizedMessage);
                if (Array.isArray(e.stackTrace)) {
                    e.stackTrace.forEach(frame => {
                        lines.push(`\tat ${frame.className}.${frame.methodName} (${frame.fileName}:${frame.lineNumber})`);
                    });
                }
                
                if (e.cause) {
                    printException(e.cause, false, lines, depth + 1);
                }
                
                return lines;
            }
        }]
    },
    {
        name: 'ui.watchList',
        url: '/watch-list/{watchListXid}?dataSourceXid&deviceName&hierarchyFolderId&tags',
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
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.main" */
                        './directives/watchList/watchListPage').then(watchListPage => {
                    angular.module('maUiWatchListState', [])
                        .directive('maUiWatchListPage', watchListPage.default);
                    $injector.loadNewModules(['maUiWatchListState']);
                });
            }]
        }
    },
    {
        name: 'ui.dataPointDetails',
        url: '/data-point-details/{pointXid}?pointId&edit&detectorId&detectorXid',
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
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.main" */
                        './components/dataPointDetails/dataPointDetails').then(dataPointDetails => {
                    angular.module('maUiDataPointDetailsState', [])
                        .component('maUiDataPointDetails', dataPointDetails.default);
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
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.main" */
                        './components/eventsPage/eventsPage').then(eventsPage => {
                    angular.module('maUiEventsState', [])
                        .component('maUiEventsPage', eventsPage.default);
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
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/gettingStarted.html');
            }
        },
        menuTr: 'ui.dox.gettingStarted',
        weight: 900
    },
    {
        name: 'ui.help.legacy',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/legacy.html');
            }
        },
        url: '/legacy',
        menuHidden: true,
        menuTr: 'ui.dox.legacyHelp'
    },
    {
        url: '/watch-list',
        name: 'ui.help.watchList',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/watchList.html');
            }
        },
        menuTr: 'ui.dox.watchList'
    },
    {
        url: '/data-point-details',
        name: 'ui.help.dataPointDetails',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/dataPointDetails.html');
            }
        },
        menuTr: 'ui.dox.dataPointDetails'
    },
    {
        url: '/events',
        name: 'ui.help.events',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/events.html');
            }
        },
        menuTr: 'ui.dox.events'
    },
    {
        url: '/date-bar',
        name: 'ui.help.dateBar',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/dateBar.html');
            }
        },
        menuTr: 'ui.dox.dateBar'
    },
    {
        url: '/ui-settings',
        name: 'ui.help.uiSettings',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/uiSettings.html');
            }
        },
        menuTr: 'ui.app.uiSettings'
    },
    {
        url: '/watch-list-builder',
        name: 'ui.help.watchListBuilder',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/watchListBuilder.html');
            }
        },
        menuTr: 'ui.app.watchListBuilder'
    },
    {
        url: '/custom-pages',
        name: 'ui.help.customPages',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/customPages.html');
            }
        },
        menuTr: 'ui.dox.customPages'
    },
    {
        url: '/menu-editor',
        name: 'ui.help.menuEditor',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/menuEditor.html');
            }
        },
        menuTr: 'ui.dox.menuEditor'
    },
    {
        url: '/users',
        name: 'ui.help.users',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/users.html');
            }
        },
        menuTr: 'header.users'
    },
    {
        url: '/custom-dashboards',
        name: 'ui.help.customDashboards',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/customDashboards.html');
            }
        },
        menuTr: 'ui.dox.customDashboards'
    },
    {
        url: '/system-status',
        name: 'ui.help.systemStatus',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/systemStatus.html');
            }
        },
        menuTr: 'ui.settings.systemStatus'
    },
    {
        url: '/data-sources',
        name: 'ui.help.dataSources',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/dataSources.html');
            }
        },
        menuTr: 'header.dataSources'
    },
    {
        url: '/purge-now',
        name: 'ui.help.purgeNow',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/purgeNow.html');
            }
        },
        menuTr: 'dsEdit.purge.purgeNow'
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
        weight: 3000,
        params: {
            dateBar: {
                rollupControls: true
            }
        }
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
        name: 'ui.settings.home',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './views/home.html');
            }
        },
        url: '/home',
        menuTr: 'ui.dox.home',
        menuIcon: 'home',
        params: {
            helpPage: 'ui.help.gettingStarted',
            helpOpen: null
        },
        controller: ['$scope', 'maUiPages', '$injector', 'maUiMenu', function ($scope, maUiPages, $injector, maUiMenu) {
            maUiPages.getPages().then(function(store) {
                $scope.pageCount = store.jsonData.pages.length;
            });
            $scope.hasDashboardDesigner = !!$injector.modules.maDashboardDesignerMenuItem;
            
            maUiMenu.getMenu().then(menu => {
                $scope.utilityMenuItems = menu.filter(item => item.showInUtilities);
            });
        }],
        weight: 990,
        permission: 'superadmin'
    },
    {
        name: 'ui.settings.dataSources',
        url: '/data-sources/{xid}?dataSourceId',
        template: '<ma-ui-data-source-page flex="noshrink" layout="column"><ma-ui-data-source-page>',
        menuTr: 'header.dataSources',
        menuIcon: 'device_hub',
        requiredPermission: 'permissionDatasource',
        resolve: {
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/dataSourcePage/dataSourcePage').then(dataSourcePage => {
                    angular.module('maDataSourcePage', [])
                        .component('maUiDataSourcePage', dataSourcePage.default);
                    $injector.loadNewModules(['maDataSourcePage']);
                });
            }]
        },
        params: {
            helpPage: 'ui.help.dataSources'
        }
    },
    {
        url: '/edit-pages/{pageXid}',
        name: 'ui.settings.editPages',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './views/editPages.html');
            }
        },
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
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './views/editMenu.html');
            }
        },
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
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './views/autoLoginSettings.html');
            }
        },
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
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/uiSettingsPage/uiSettingsPage').then(uiSettingsPage => {
                    angular.module('maUiSettingsPage', [])
                        .component('maUiSettingsPage', uiSettingsPage.default);
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
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/usersPage/usersPage').then(usersPage => {
                    angular.module('maUiUsersState', [])
                        .component('maUiUsersPage', usersPage.default);
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
        // params: {
        //     helpPage: 'ui.help.systemSettings'
        // },
        resolve: {
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/systemSettingsPage/systemSettingsPage').then(systemSettingsPage => {
                    angular.module('maUiSystemSettingsState', [])
                        .component('maUiSystemSettingsPage', systemSettingsPage.default);
                    $injector.loadNewModules(['maUiSystemSettingsState']);
                });
            }]
        }
    },
    {
        name: 'ui.settings.system.systemInformation',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/systemInformation.html');
            }
        },
        url: '/information',
        menuTr: 'systemSettings.systemInformation',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.siteAnalytics',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/analytics.html');
            }
        },
        url: '/site-analytics',
        menuTr: 'systemSettings.siteAnalytics',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.language',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/language.html');
            }
        },
        url: '/language',
        menuTr: 'systemSettings.languageSettings',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.systemAlarmLevels',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/systemAlarmLevels.html');
            }
        },
        url: '/system-alarm-levels',
        menuTr: 'systemSettings.systemAlarmLevels',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.auditAlarmLevels',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/auditAlarmLevels.html');
            }
        },
        url: '/audit-alarm-levels',
        menuTr: 'systemSettings.auditAlarmLevels',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.email',
        params: {
            helpPage: 'ui.help.emailSettings'
        },
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/email.html');
            }
        },
        url: '/email',
        menuTr: 'systemSettings.emailSettings',
        menuHidden: true
    },
    {
        url: '/email',
        name: 'ui.help.emailSettings',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/emailSettings.html');
            }
        },
        menuTr: 'systemSettings.emailSettings'
    },
    {
        name: 'ui.settings.system.http',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/httpSettings.html');
            }
        },
        url: '/http',
        menuTr: 'systemSettings.httpSettings',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.httpServer',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/httpServerSettings.html');
            }
        },
        url: '/http-server',
        menuTr: 'systemSettings.httpServerSettings',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.password',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/passwordSettings.html');
            }
        },
        url: '/password',
        menuTr: 'systemSettings.passwordSettings',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.threadPools',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/threadPools.html');
            }
        },
        url: '/thread-pools',
        menuTr: 'systemSettings.threadPools',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.uiPerformance',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/uiPerformance.html');
            }
        },
        url: '/ui-performance',
        menuTr: 'systemSettings.uiPerformance',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.purge',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/purgeSettings.html');
            }
        },
        url: '/purge',
        menuTr: 'systemSettings.purgeSettings',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.ui',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/uiModule.html');
            }
        },
        url: '/ui',
        menuTr: 'ui.settings',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.color',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/color.html');
            }
        },
        url: '/color',
        menuTr: 'systemSettings.colourSettings',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.configBackup',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/configBackup.html');
            }
        },
        url: '/config-backup',
        menuTr: 'systemSettings.backupSettings',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.sqlBackup',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/sqlBackup.html');
            }
        },
        url: '/sql-backup',
        menuTr: 'systemSettings.H2DatabaseBackupSettings',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.chart',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/chart.html');
            }
        },
        url: '/chart',
        menuTr: 'systemSettings.chartSettings',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.permissions',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/permissions.html');
            }
        },
        url: '/permissions',
        menuTr: 'systemSettings.systemPermissions',
        menuHidden: true
    },
    {
        name: 'ui.settings.system.pointHierarchy',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemSettings/pointHierarchySettings.html');
            }
        },
        url: '/point-hierarchy',
        menuTr: 'systemSettings.pointHierarchySettings',
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
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/systemStatusPage/systemStatusPage').then(systemStatusPage => {
                    angular.module('maUiSystemStatusState', [])
                        .component('maUiSystemStatusPage', systemStatusPage.default);
                    $injector.loadNewModules(['maUiSystemStatusState']);
                });
            }]
        }
    },
    {
        name: 'ui.settings.systemStatus.auditTrail',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemStatus/auditTrail.html');
            }
        },
        url: '/audit-trail',
        menuTr: 'ui.settings.systemStatus.auditTrail',
        menuHidden: true,
        params: {
            dateBar: {
                rollupControls: false
            }
        }
    },
    {
        name: 'ui.settings.systemStatus.loggingConsole',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemStatus/loggingConsole.html');
            }
        },
        url: '/logging-console',
        menuTr: 'ui.settings.systemStatus.loggingConsole',
        menuHidden: true
    },
    {
        name: 'ui.settings.systemStatus.internalMetrics',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemStatus/internalMetrics.html');
            }
        },
        url: '/internal-metrics',
        menuTr: 'ui.settings.systemStatus.internalMetrics',
        menuHidden: true
    },
    {
        name: 'ui.settings.systemStatus.workItems',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemStatus/workItems.html');
            }
        },
        url: '/work-items',
        menuTr: 'ui.settings.systemStatus.workItems',
        menuHidden: true
    },
    {
        name: 'ui.settings.systemStatus.threads',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemStatus/threads.html');
            }
        },
        url: '/threads',
        menuTr: 'ui.settings.systemStatus.threads',
        menuHidden: true
    },
    {
        name: 'ui.settings.systemStatus.serverInfo',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './systemStatus/serverInfo.html');
            }
        },
        url: '/server-info',
        menuTr: 'ui.settings.systemStatus.serverInfo',
        menuHidden: true
    },
    {
        name: 'ui.settings.watchListBuilder',
        url: '/watch-list-builder/{watchListXid}',
        template: '<ma-ui-watch-list-builder></ma-ui-watch-list-builder>',
        menuTr: 'ui.app.watchListBuilder',
        menuIcon: 'playlist_add_check',
        params: {
            watchList: null,
            helpPage: 'ui.help.watchListBuilder'
        },
        resolve: {
            loadMyDirectives: ['$injector', function($injector) {
                const p1 = import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/watchListBuilder/watchListBuilder');

                const p2 = import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './directives/bracketEscape/bracketEscape');
                
                return Promise.all([p1, p2]).then(([watchListBuilder, bracketEscape]) => {
                    angular.module('maUiWatchListBuilderState', [])
                        .directive('maUiBracketEscape', bracketEscape.default)
                        .directive('maUiWatchListBuilder', watchListBuilder.default);
                    $injector.loadNewModules(['maUiWatchListBuilderState']);
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
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/importExportPage/importExportPage').then(importExportPage => {
                    angular.module('maUiImportExportState', [])
                        .component('maUiImportExportPage', importExportPage.default);
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
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/modulesPage/modulesPage').then(modulesPage => {
                    angular.module('maUiModulesState', [])
                        .directive('maUiModulesPage', modulesPage.default);
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
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/upgradePage/upgradePage').then(upgradePage => {
                    angular.module('maUiUpgradeState', [])
                        .component('maUiUpgradePage', upgradePage.default);
                    $injector.loadNewModules(['maUiUpgradeState']);
                });
            }]
        }
    },
    {
        name: 'ui.settings.modules.offlineUpgrade',
        url: '/offline-upgrade',
        views: {
            '@ui.settings': {
                template: '<ma-ui-offline-upgrade-page flex layout="column"><ma-ui-offline-upgrade-page>'
            }
        },
        menuTr: 'ui.app.offlineUpgrades',
        menuIcon: 'update',
        permission: 'superadmin',
        menuHidden: true,
        resolve: {
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/offlineUpgradePage/offlineUpgradePage').then(offlineUpgradePage => {
                    angular.module('maUiOfflineUpgradeState', [])
                        .directive('maUiOfflineUpgradePage', offlineUpgradePage.default);
                    $injector.loadNewModules(['maUiOfflineUpgradeState']);
                });
            }]
        }
    },
    {
        name: 'ui.settings.fileStores',
        url: '/file-stores?fileStore&folderPath',
        template: '<ma-file-store-browser flex preview="true" ng-model="tmp"><ma-file-store-browser>',
        menuTr: 'ui.app.fileStores',
        menuIcon: 'file_upload',
        permission: 'superadmin'
    },
    {
        name: 'ui.settings.jsonStore',
        url: '/json-store',
        template: `<div>
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
        template: `<div>
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
    {
        name: 'ui.settings.bulkDataPointEdit',
        url: '/bulk-data-point-edit',
        template: '<ma-ui-bulk-data-point-edit-page flex="noshrink" layout="column"></ma-ui-bulk-data-point-edit-page>',
        menuTr: 'ui.app.bulkDataPointEdit',
        menuIcon: 'fitness_center',
        permission: 'superadmin',
        resolve: {
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/bulkDataPointEditPage/bulkDataPointEditPage').then(bulkDataPointEditPage => {
                    angular.module('maUiBulkDataPointEditState', [])
                        .component('maUiBulkDataPointEditPage', bulkDataPointEditPage.default);
                    $injector.loadNewModules(['maUiBulkDataPointEditState']);
                });
            }]
        }
    },
    {
        name: 'ui.settings.eventHandlers',
        url: '/event-handlers/{xid}',
        template: '<ma-ui-event-handler-page flex="noshrink" layout="column"><ma-ui-event-handler-page>',
        menuTr: 'ui.app.eventHandlers',
        menuIcon: 'assignment_turned_in',
        permission: 'superadmin',
        params: {
            helpPage: 'ui.help.eventHandlers',
            event: null
        },
        resolve: {
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/eventHandlerPage/eventHandlerPage').then(eventHandlerPage => {
                    angular.module('maUiEventHandlerPage', [])
                        .component('maUiEventHandlerPage', eventHandlerPage.default);
                    $injector.loadNewModules(['maUiEventHandlerPage']);
                });
            }]
        }
    },
    {
        name: 'ui.help.eventHandlers',
        url: '/event-handlers/help',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "eager" */ './views/help/eventHandlers.html');
            }
        },
        menuTr: 'ui.app.eventHandlers'
    },
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
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/playArea.html');
            }
        },
        menuTr: 'ui.dox.playArea',
        menuIcon: 'fa-magic',
        params: {
            markup: null
        },
        weight: 990
    },
    {
        name: 'ui.examples.playAreaBig',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/playAreaBig.html');
            }
        },
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
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/angular.html');
            }
        },
        url: '/angular',
        menuTr: 'ui.dox.angular'
    },
    {
        name: 'ui.examples.basics.pointList',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/pointList.html');
            }
        },
        url: '/point-list',
        menuTr: 'ui.dox.pointList'
    },
    {
        name: 'ui.examples.basics.getPointByXid',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/getPointByXid.html');
            }
        },
        url: '/get-point-by-xid',
        menuTr: 'ui.dox.getPointByXid'
    },
    {
        name: 'ui.examples.basics.dataSourceAndDeviceList',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/dataSourceAndDeviceList.html');
            }
        },
        url: '/data-source-and-device-list',
        menuTr: 'ui.dox.dataSourceAndDeviceList'
    },
    {
        name: 'ui.examples.basics.liveValues',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/liveValues.html');
            }
        },
        url: '/live-values',
        menuTr: 'ui.dox.liveValues'
    },
    {
        name: 'ui.examples.basics.filters',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/filters.html');
            }
        },
        url: '/filters',
        menuTr: 'ui.dox.filters'
    },
    {
        name: 'ui.examples.basics.datePresets',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/datePresets.html');
            }
        },
        url: '/date-presets',
        menuTr: 'ui.dox.datePresets'
    },
    {
        name: 'ui.examples.basics.styleViaValue',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/styleViaValue.html');
            }
        },
        url: '/style-via-value',
        menuTr: 'ui.dox.styleViaValue'
    },
    {
        name: 'ui.examples.basics.pointValues',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/pointValues.html');
            }
        },
        url: '/point-values',
        menuTr: 'ui.dox.pointValues'
    },
    {
        name: 'ui.examples.basics.latestPointValues',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/latestPointValues.html');
            }
        },
        url: '/latest-point-values',
        menuTr: 'ui.dox.latestPointValues'
    },
    {
        name: 'ui.examples.basics.clocksAndTimezones',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/clocksAndTimezones.html');
            }
        },
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
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/gauges.html');
            }
        },
        url: '/gauges',
        menuTr: 'ui.dox.gauges'
    },
    {
        name: 'ui.examples.singleValueDisplays.switchImage',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/switchImage.html');
            }
        },
        url: '/switch-image',
        menuTr: 'ui.dox.switchImage'
    },
    {
        name: 'ui.examples.singleValueDisplays.bars',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/bars.html');
            }
        },
        url: '/bars',
        menuTr: 'ui.dox.bars'
    },
    {
        name: 'ui.examples.singleValueDisplays.tanks',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/tanks.html');
            }
        },
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
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/lineChart.html');
            }
        },
        url: '/line-chart',
        menuTr: 'ui.dox.lineChart'
    },
    {
        name: 'ui.examples.charts.barChart',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/barChart.html');
            }
        },
        url: '/bar-chart',
        menuTr: 'ui.dox.barChart'
    },
    {
        name: 'ui.examples.charts.advancedChart',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/advancedChart.html');
            }
        },
        url: '/advanced-chart',
        menuTr: 'ui.dox.advancedChart'
    },
    {
        name: 'ui.examples.charts.stateChart',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/stateChart.html');
            }
        },
        url: '/state-chart',
        menuTr: 'ui.dox.stateChart'
    },
    {
        name: 'ui.examples.charts.liveUpdatingChart',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/liveUpdatingChart.html');
            }
        },
        url: '/live-updating-chart',
        menuTr: 'ui.dox.liveUpdatingChart'
    },
    {
        name: 'ui.examples.charts.pieChart',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/pieChart.html');
            }
        },
        url: '/pie-chart',
        menuTr: 'ui.dox.pieChart'
    },
    {
        name: 'ui.examples.charts.dailyComparison',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/dailyComparisonChart.html');
            }
        },
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
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/setPoint.html');
            }
        },
        url: '/set-point',
        menuTr: 'ui.dox.settingPoint'
    },
    {
        name: 'ui.examples.settingPointValues.toggle',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/toggle.html');
            }
        },
        url: '/toggle',
        menuTr: 'ui.dox.toggle'
    },
    {
        name: 'ui.examples.settingPointValues.sliders',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/sliders.html');
            }
        },
        url: '/sliders',
        menuTr: 'ui.dox.sliders'
    },
    {
        name: 'ui.examples.settingPointValues.multistateRadio',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/multistateRadio.html');
            }
        },
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
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/getStatistics.html');
            }
        },
        url: '/get-statistics',
        menuTr: 'ui.dox.getStatistics'
    },
    {
        name: 'ui.examples.statistics.statisticsTable',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/statisticsTable.html');
            }
        },
        url: '/statistics-table',
        menuTr: 'ui.dox.statisticsTable'
    },
    {
        name: 'ui.examples.statistics.statePieChart',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/statePieChart.html');
            }
        },
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
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/buildPointArray.html');
            }
        },
        url: '/build-point-array',
        menuTr: 'ui.dox.buildPointArray'
    },
    {
        name: 'ui.examples.pointArrays.pointArrayTable',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/pointArrayTable.html');
            }
        },
        url: '/point-array-table',
        menuTr: 'ui.dox.pointArrayTable'
    },
    {
        name: 'ui.examples.pointArrays.pointArrayLineChart',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/pointArrayLineChart.html');
            }
        },
        url: '/point-array-line-chart',
        menuTr: 'ui.dox.pointArrayLineChart'
    },
    {
        name: 'ui.examples.pointArrays.templating',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/templating.html');
            }
        },
        url: '/templating',
        menuTr: 'ui.dox.templating'
    },
    {
        name: 'ui.examples.pointArrays.dataPointTable',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/dataPointTable.html');
            }
        },
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
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/displayTree.html');
            }
        },
        url: '/display-tree',
        menuTr: 'ui.dox.displayTree'
    },
    {
        name: 'ui.examples.pointHierarchy.pointHierarchyLineChart',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/pointHierarchyLineChart.html');
            }
        },
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
        name: 'ui.examples.templates.adaptiveLayouts',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/adaptiveLayouts.html');
            }
        },
        url: '/adaptive-layouts',
        menuTr: 'ui.dox.adaptiveLayouts'
    },
    {
        name: 'ui.examples.utilities',
        url: '/utilities',
        menuTr: 'ui.dox.utilities',
        menuIcon: 'fa-wrench'
    },
    {
        name: 'ui.examples.utilities.translation',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/translation.html');
            }
        },
        url: '/translation',
        menuTr: 'ui.dox.translation'
    },
    {
        name: 'ui.examples.utilities.jsonStore',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/jsonStore.html');
            }
        },
        url: '/json-store',
        menuTr: 'ui.dox.jsonStore'
    },
    {
        name: 'ui.examples.utilities.watchdog',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/watchdog.html');
            }
        },
        url: '/watchdog',
        menuTr: 'ui.dox.watchdog'
    },
    {
        name: 'ui.examples.utilities.eventsTable',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/eventsTable.html');
            }
        },
        url: '/events-table',
        menuTr: 'ui.app.eventsTable'
    },
    {
        name: 'ui.examples.utilities.googleMaps',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/googleMaps.html');
            }
        },
        url: '/google-maps',
        menuTr: 'ui.dox.googleMaps'
    },
    {
        name: 'ui.examples.svg',
        url: '/svg',
        menuTr: 'ui.dox.svgGraphics',
        menuIcon: 'fa-picture-o'
    },
    {
        name: 'ui.examples.svg.basicUsage',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/svgBasic.html');
            }
        },
        url: '/basic-usage',
        menuTr: 'ui.dox.basicSvg'
    },
    {
        name: 'ui.examples.svg.interactiveSvg',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/svgAdvanced.html');
            }
        },
        url: '/interactive-svg',
        menuTr: 'ui.dox.interactiveSvg'
    },
    {
        name: 'ui.examples.svg.svgWindRose',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.examples" */
                        './views/examples/svgWindRose.html');
            }
        },
        url: '/wind-rose',
        menuTr: 'ui.dox.svgWindRose'
    },
    {
        name: 'ui.settings.systemStatus.dataSourcesPerformance',
        url: '/ds-performance',
        menuTr: 'ui.settings.systemStatus.dataSourcesPerformance',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                    './systemStatus/dataSourcesPerformance.html');
            }
        },
        menuHidden: true,
    },
    {
        name: 'ui.settings.mailingList',
        url: '/mailing-lists',
        template: '<ma-ui-mailing-list-page></ma-ui-mailing-list-page>',
        menuTr: 'ui.app.mailingLists',
        menuIcon: 'email',
        params: {
            helpPage: 'ui.help.mailingList'
        },
        resolve: {
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/mailingListPage/mailingList').then(mailingListPage => {
                    angular.module('maUiMailingListPage', [])
                        .component('maUiMailingListPage', mailingListPage.default);
                    $injector.loadNewModules(['maUiMailingListPage']);
                });
            }]
        }
    },
    {
        url: '/mailing-lists/help',
        name: 'ui.help.mailingList',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.help" */
                        './views/help/mailingLists.html');
            }
        },
        menuTr: 'ui.app.mailingLists'
    },
    {
        name: 'ui.settings.virtualSerialPort',
        url: '/virtual-serial-port/{xid}',
        template: '<ma-virtual-serial-port></ma-virtual-serial-port>',
        menuTr: 'systemSettings.comm.virtual.serialPorts',
        menuIcon: 'settings_input_hdmi',
        permission: 'superadmin',
        params: {
            noPadding: false,
            hideFooter: false,
            helpPage: 'ui.help.virtualSerialPort'
        },
        resolve: {
            loadMyDirectives: ['$injector', function($injector) {
                return import(/* webpackMode: "lazy", webpackChunkName: "ui.settings" */
                        './components/virtualSerialPort/virtualSerialPort').then(virtualSerialPort => {
                    angular.module('maVirtualSerialPort', [])
                        .component('maVirtualSerialPort', virtualSerialPort.default);
                    $injector.loadNewModules(['maVirtualSerialPort']);
                });
            }]
        }
    },
    {
        name: 'ui.help.virtualSerialPort',
        url: '/virtual-serial-port/help',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "eager" */ './views/help/virtualSerialPort.html');
            }
        },
        menuTr: 'systemSettings.comm.virtual.serialPorts'
    },
    {
        name: 'ui.help.scriptingEditor',
        url: '/scripting-editor/help',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "eager" */ './views/help/scriptingEditor.html');
            }
        },
        menuTr: 'ui.app.mangoJavaScript'
    },
    {
        name: 'ui.help.freeMarkerTemplates',
        url: '/scripting-editor/help',
        resolve: {
            viewTemplate: function() {
                return import(/* webpackMode: "eager" */ './views/help/freeMarkerTemplates.html');
            }
        },
        menuTr: 'ui.dox.freeMarker'
    },
];
