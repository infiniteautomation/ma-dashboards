/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular', './util/loadLoginTranslations'], function(require, angular, loadLoginTranslations) {
'use strict';

return [
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
        menuTr: 'ui.app.pageNotFound'
    },
    {
        name: 'dashboard.unauthorized',
        url: '/unauthorized?path',
        templateUrl: 'views/dashboard/unauthorized.html',
        menuHidden: true,
        menuTr: 'ui.app.unauthorized'
    },
    {
        name: 'dashboard.error',
        url: '/error',
        templateUrl: 'views/dashboard/error.html',
        menuHidden: true,
        menuTr: 'ui.app.error'
    },
    {
        name: 'dashboard.serverError',
        url: '/server-error',
        templateUrl: 'views/dashboard/serverError.html',
        menuHidden: true,
        menuTr: 'ui.app.serverError'
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
        menuTr: 'ui.dox.home',
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
        menuTr: 'ui.app.watchList',
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
        menuTr: 'ui.app.dataPointDetails',
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
        menuTr: 'ui.app.events',
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
                menuTr: 'ui.dox.gettingStarted'
            },
            {
                name: 'dashboard.help.legacy',
                url: '/legacy',
                templateUrl: 'views/help/legacy.html',
                menuHidden: true,
                menuTr: 'ui.dox.legacyHelp'
            },
            {
                url: '/watch-list',
                name: 'dashboard.help.watchList',
                templateUrl: 'views/help/watchList.html',
                menuTr: 'ui.dox.watchList'
            },
            {
                url: '/data-point-details',
                name: 'dashboard.help.dataPointDetails',
                templateUrl: 'views/help/dataPointDetails.html',
                menuTr: 'ui.dox.dataPointDetails'
            },
            {
                url: '/events',
                name: 'dashboard.help.events',
                templateUrl: 'views/help/events.html',
                menuTr: 'ui.dox.events'
            },
            {
                url: '/date-bar',
                name: 'dashboard.help.dateBar',
                templateUrl: 'views/help/dateBar.html',
                menuTr: 'ui.dox.dateBar'
            },
            {
                url: '/ui-settings',
                name: 'dashboard.help.dashboardSettings',
                templateUrl: 'views/help/dashboardSettings.html',
                menuTr: 'ui.app.dashboardSettings'
            },
            {
                url: '/watch-list-builder',
                name: 'dashboard.help.watchListBuilder',
                templateUrl: 'views/help/watchListBuilder.html',
                menuTr: 'ui.app.watchListBuilder'
            },
            {
                url: '/custom-pages',
                name: 'dashboard.help.customPages',
                templateUrl: 'views/help/customPages.html',
                menuTr: 'ui.dox.customPages'
            },
            {
                url: '/menu-editor',
                name: 'dashboard.help.menuEditor',
                templateUrl: 'views/help/menuEditor.html',
                menuTr: 'ui.dox.menuEditor'
            },
            {
                url: '/custom-dashboards',
                name: 'dashboard.help.customDashboards',
                templateUrl: 'views/help/customDashboards.html',
                menuTr: 'ui.dox.customDashboards'
            }
        ]
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
        url: '/view-page/{pageXid}',
        name: 'dashboard.viewPage',
        template: '<page-view xid="{{pageXid}}" flex layout="column"></page-view>',
        menuTr: 'ui.app.viewPage',
        menuHidden: true,
        controller: ['$scope', '$stateParams', function ($scope, $stateParams) {
            $scope.pageXid = $stateParams.pageXid;
        }]
    },
    {
        url: '/administration',
        name: 'dashboard.settings',
        menuIcon: 'build',
        menuTr: 'ui.app.adminTools',
        weight: 1999,
        children: [
            {
                url: '/edit-pages/{pageXid}',
                name: 'dashboard.settings.editPages',
                templateUrl: 'views/dashboard/editPages.html',
                menuTr: 'ui.app.editPages',
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
                menuTr: 'ui.app.editMenu',
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
                menuTr: 'ui.app.autoLoginSettings',
                menuIcon: 'face',
                permission: 'superadmin'
            },
            {
                url: '/ui-settings',
                name: 'dashboard.settings.dashboardSettings',
                templateUrl: 'views/dashboard/dashboardSettings.html',
                menuTr: 'ui.app.dashboardSettings',
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
                template: '<h1 ma-tr="ui.app.watchListBuilder"></h1>\n<watch-list-builder></watch-list-builder>',
                menuTr: 'ui.app.watchListBuilder',
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
        menuTr: 'ui.dox.examples',
        menuIcon: 'info',
        menuHidden: true,
        submenu: true,
        weight: 2001,
        children: [
            {
                url: '/play-area',
                name: 'dashboard.examples.playArea',
                templateUrl: 'views/examples/playArea.html',
                menuTr: 'ui.dox.playArea',
                menuIcon: 'fa-magic',
                params: {
                    markup: null
                }
            },
            {
                name: 'dashboard.examples.playAreaBig',
                templateUrl: 'views/examples/playAreaBig.html',
                url: '/play-area-big',
                menuTr: 'ui.dox.playAreaBig',
                menuHidden: true,
                menuIcon: 'fa-magic'
            },
            {
                name: 'dashboard.examples.basics',
                url: '/basics',
                menuTr: 'ui.dox.basics',
                menuIcon: 'fa-info-circle',
                children: [
                    {
                        name: 'dashboard.examples.basics.angular',
                        templateUrl: 'views/examples/angular.html',
                        url: '/angular',
                        menuTr: 'ui.dox.angular'
                    },
                    {
                        name: 'dashboard.examples.basics.pointList',
                        templateUrl: 'views/examples/pointList.html',
                        url: '/point-list',
                        menuTr: 'ui.dox.pointList'
                    },
                    {
                        name: 'dashboard.examples.basics.getPointByXid',
                        templateUrl: 'views/examples/getPointByXid.html',
                        url: '/get-point-by-xid',
                        menuTr: 'ui.dox.getPointByXid'
                    },
                    {
                        name: 'dashboard.examples.basics.dataSourceAndDeviceList',
                        templateUrl: 'views/examples/dataSourceAndDeviceList.html',
                        url: '/data-source-and-device-list',
                        menuTr: 'ui.dox.dataSourceAndDeviceList'
                    },
                    {
                        name: 'dashboard.examples.basics.liveValues',
                        templateUrl: 'views/examples/liveValues.html',
                        url: '/live-values',
                        menuTr: 'ui.dox.liveValues'
                    },
                    {
                        name: 'dashboard.examples.basics.filters',
                        templateUrl: 'views/examples/filters.html',
                        url: '/filters',
                        menuTr: 'ui.dox.filters'
                    },
                    {
                        name: 'dashboard.examples.basics.datePresets',
                        templateUrl: 'views/examples/datePresets.html',
                        url: '/date-presets',
                        menuTr: 'ui.dox.datePresets'
                    },
                    {
                        name: 'dashboard.examples.basics.styleViaValue',
                        templateUrl: 'views/examples/styleViaValue.html',
                        url: '/style-via-value',
                        menuTr: 'ui.dox.styleViaValue'
                    },
                    {
                        name: 'dashboard.examples.basics.pointValues',
                        templateUrl: 'views/examples/pointValues.html',
                        url: '/point-values',
                        menuTr: 'ui.dox.pointValues'
                    },
                    {
                        name: 'dashboard.examples.basics.latestPointValues',
                        templateUrl: 'views/examples/latestPointValues.html',
                        url: '/latest-point-values',
                        menuTr: 'ui.dox.latestPointValues'
                    },
                    {
                        name: 'dashboard.examples.basics.clocksAndTimezones',
                        templateUrl: 'views/examples/clocksAndTimezones.html',
                        url: '/clocks-and-timezones',
                        menuTr: 'ui.dox.clocksAndTimezones'
                    }
                ]
            },
            {
                name: 'dashboard.examples.singleValueDisplays',
                url: '/single-value-displays',
                menuTr: 'ui.dox.singleValueDisplays',
                menuIcon: 'fa-tachometer',
                children: [
                    {
                        name: 'dashboard.examples.singleValueDisplays.gauges',
                        templateUrl: 'views/examples/gauges.html',
                        url: '/gauges',
                        menuTr: 'ui.dox.gauges'
                    },
                    {
                        name: 'dashboard.examples.singleValueDisplays.switchImage',
                        templateUrl: 'views/examples/switchImage.html',
                        url: '/switch-image',
                        menuTr: 'ui.dox.switchImage'
                    },
                    {
                        name: 'dashboard.examples.singleValueDisplays.bars',
                        templateUrl: 'views/examples/bars.html',
                        url: '/bars',
                        menuTr: 'ui.dox.bars'
                    },
                    {
                        name: 'dashboard.examples.singleValueDisplays.tanks',
                        templateUrl: 'views/examples/tanks.html',
                        url: '/tanks',
                        menuTr: 'ui.dox.tanks'
                    }
                ]
            },
            {
                name: 'dashboard.examples.charts',
                url: '/charts',
                menuTr: 'ui.dox.charts',
                menuIcon: 'fa-area-chart',
                children: [
                    {
                        name: 'dashboard.examples.charts.lineChart',
                        templateUrl: 'views/examples/lineChart.html',
                        url: '/line-chart',
                        menuTr: 'ui.dox.lineChart'
                    },
                    {
                        name: 'dashboard.examples.charts.barChart',
                        templateUrl: 'views/examples/barChart.html',
                        url: '/bar-chart',
                        menuTr: 'ui.dox.barChart'
                    },
                    {
                        name: 'dashboard.examples.charts.advancedChart',
                        templateUrl: 'views/examples/advancedChart.html',
                        url: '/advanced-chart',
                        menuTr: 'ui.dox.advancedChart'
                    },
                    {
                        name: 'dashboard.examples.charts.stateChart',
                        templateUrl: 'views/examples/stateChart.html',
                        url: '/state-chart',
                        menuTr: 'ui.dox.stateChart'
                    },
                    {
                        name: 'dashboard.examples.charts.liveUpdatingChart',
                        templateUrl: 'views/examples/liveUpdatingChart.html',
                        url: '/live-updating-chart',
                        menuTr: 'ui.dox.liveUpdatingChart'
                    },
                    {
                        name: 'dashboard.examples.charts.pieChart',
                        templateUrl: 'views/examples/pieChart.html',
                        url: '/pie-chart',
                        menuTr: 'ui.dox.pieChart'
                    },
                    {
                        name: 'dashboard.examples.charts.dailyComparison',
                        templateUrl: 'views/examples/dailyComparisonChart.html',
                        url: '/daily-comparison',
                        menuTr: 'ui.dox.dailyComparisonChart'
                    }
                ]
            },
            {
                name: 'dashboard.examples.settingPointValues',
                url: '/setting-point-values',
                menuTr: 'ui.dox.settingPoint',
                menuIcon: 'fa-pencil-square-o',
                children: [
                    {
                        name: 'dashboard.examples.settingPointValues.setPoint',
                        templateUrl: 'views/examples/setPoint.html',
                        url: '/set-point',
                        menuTr: 'ui.dox.settingPoint'
                    },
                    {
                        name: 'dashboard.examples.settingPointValues.toggle',
                        templateUrl: 'views/examples/toggle.html',
                        url: '/toggle',
                        menuTr: 'ui.dox.toggle'
                    },
                    {
                        name: 'dashboard.examples.settingPointValues.sliders',
                        templateUrl: 'views/examples/sliders.html',
                        url: '/sliders',
                        menuTr: 'ui.dox.sliders'
                    },
                    {
                        name: 'dashboard.examples.settingPointValues.multistateRadio',
                        templateUrl: 'views/examples/multistateRadio.html',
                        url: '/multistate-radio-buttons',
                        menuTr: 'ui.dox.multistateRadio'
                    }
                ]
            },
            {
                name: 'dashboard.examples.statistics',
                url: '/statistics',
                menuTr: 'ui.dox.statistics',
                menuIcon: 'fa-table',
                children: [
                    {
                        name: 'dashboard.examples.statistics.getStatistics',
                        templateUrl: 'views/examples/getStatistics.html',
                        url: '/get-statistics',
                        menuTr: 'ui.dox.getStatistics'
                    },
                    {
                        name: 'dashboard.examples.statistics.statisticsTable',
                        templateUrl: 'views/examples/statisticsTable.html',
                        url: '/statistics-table',
                        menuTr: 'ui.dox.statisticsTable'
                    },
                    {
                        name: 'dashboard.examples.statistics.statePieChart',
                        templateUrl: 'views/examples/statePieChart.html',
                        url: '/state-pie-chart',
                        menuTr: 'ui.dox.statePieChart'
                    }
                ]
            },
            {
                name: 'dashboard.examples.pointArrays',
                url: '/point-arrays',
                menuTr: 'ui.dox.pointArrayTemplating',
                menuIcon: 'fa-list',
                children: [
                    {
                        name: 'dashboard.examples.pointArrays.buildPointArray',
                        templateUrl: 'views/examples/buildPointArray.html',
                        url: '/build-point-array',
                        menuTr: 'ui.dox.buildPointArray'
                    },
                    {
                        name: 'dashboard.examples.pointArrays.pointArrayTable',
                        templateUrl: 'views/examples/pointArrayTable.html',
                        url: '/point-array-table',
                        menuTr: 'ui.dox.pointArrayTable'
                    },
                    {
                        name: 'dashboard.examples.pointArrays.pointArrayLineChart',
                        templateUrl: 'views/examples/pointArrayLineChart.html',
                        url: '/point-array-line-chart',
                        menuTr: 'ui.dox.pointArrayLineChart'
                    },
                    {
                        name: 'dashboard.examples.pointArrays.templating',
                        templateUrl: 'views/examples/templating.html',
                        url: '/templating',
                        menuTr: 'ui.dox.templating'
                    },
                    {
                        name: 'dashboard.examples.pointArrays.dataPointTable',
                        templateUrl: 'views/examples/dataPointTable.html',
                        url: '/data-point-table',
                        menuTr: 'ui.dox.dataPointTable'
                    }
                ]
            },
            {
                name: 'dashboard.examples.pointHierarchy',
                url: '/point-hierarchy',
                menuTr: 'ui.dox.pointHierarchy',
                menuIcon: 'fa-sitemap',
                children: [
                    {
                        name: 'dashboard.examples.pointHierarchy.displayTree',
                        templateUrl: 'views/examples/displayTree.html',
                        url: '/display-tree',
                        menuTr: 'ui.dox.displayTree'
                    },
                    {
                        name: 'dashboard.examples.pointHierarchy.pointHierarchyLineChart',
                        templateUrl: 'views/examples/pointHierarchyLineChart.html',
                        url: '/line-chart',
                        menuTr: 'ui.dox.pointHierarchyLineChart'
                    }
                ]
            },
            {
                name: 'dashboard.examples.templates',
                url: '/templates',
                menuTr: 'ui.dox.templates',
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
                        menuTr: 'ui.dox.autoLogin'
                    },
                    {
                        name: 'dashboard.examples.templates.extendApp',
                        templateUrl: 'views/examples/extendApp.html',
                        url: '/extend-app',
                        menuTr: 'ui.dox.extendApp'
                    },
                    {
                        name: 'dashboard.examples.templates.loginPage',
                        templateUrl: 'views/examples/loginPageTemplate.html',
                        url: '/login-page',
                        menuTr: 'ui.dox.loginPageTemplate'
                    },
                    {
                        name: 'dashboard.examples.templates.adminTemplate',
                        templateUrl: 'views/examples/adminTemplate.html',
                        url: '/admin-template',
                        menuTr: 'ui.dox.adminTemplate'
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
                menuTr: 'ui.dox.utilities',
                menuIcon: 'fa-wrench',
                children: [
                    {
                        name: 'dashboard.examples.utilities.translation',
                        templateUrl: 'views/examples/translation.html',
                        url: '/translation',
                        menuTr: 'ui.dox.translation'
                    },
                    {
                        name: 'dashboard.examples.utilities.jsonStore',
                        templateUrl: 'views/examples/jsonStore.html',
                        url: '/json-store',
                        menuTr: 'ui.dox.jsonStore'
                    },
                    {
                        name: 'dashboard.examples.utilities.watchdog',
                        templateUrl: 'views/examples/watchdog.html',
                        url: '/watchdog',
                        menuTr: 'ui.dox.watchdog'
                    },
                    {
                        name: 'dashboard.examples.utilities.eventsTable',
                        templateUrl: 'views/examples/eventsTable.html',
                        url: '/events-table',
                        menuTr: 'ui.app.eventsTable'
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
];

});
