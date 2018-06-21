/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import menuEditorFactory from './services/menuEditor';
import jsonStoreMenu from './components/menu/jsonStoreMenu';
import menu from './components/menu/menu';
import menuLink from './components/menu/menuLink';
import menuToggle from './components/menu/menuToggle';
import menuEditor from './directives/menuEditor/menuEditor';
import pageEditor from './directives/pageEditor/pageEditor';
import pageEditorControls from './directives/pageEditor/pageEditorControls';
import dualPaneEditor from './directives/liveEditor/dualPaneEditor';
import autoLoginSettings from './components/autoLoginSettings/autoLoginSettings';
import activeEventIcons from './components/activeEventIcons/activeEventIcons';
import dateBar from './components/dateBar/dateBar';
import footer from './components/footer/footer';
import upgradesBanner from './components/upgradesBanner/upgradesBanner';
import 'angular-ui-ace';

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
    .component('maUiFooter', footer)
    .component('maUiUpgradesBanner', upgradesBanner);
