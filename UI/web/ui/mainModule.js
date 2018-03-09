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
import {require as requirejs} from 'requirejs';
import 'ace';
import 'angular-ui-ace';

//const aceFiles = require.context('ace/src', false, /^\.\/(?:theme|mode|ext|keybinding)-.*\.js$/);
//import 'ace/src/theme-monokai';
//import 'ace/src/mode-html';

requirejs(['ace/lib/net', 'ace/edit_session'], (net, editSession) => {
    net.loadScript = function(path, callback) {
//        aceFiles('./' + path);
//        callback();

        let promise;
        if (path.indexOf('theme-') === 0) {
            promise = import(/* webpackMode: "eager" */ 'ace/src/theme-' + path.slice('theme-'.length));
        } else if (path.indexOf('mode-') === 0) {
            promise = import(/* webpackMode: "eager" */ 'ace/src/mode-' + path.slice('mode-'.length));
        } else if (path.indexOf('ext-') === 0) {
            promise = import(/* webpackMode: "eager" */ 'ace/src/ext-' + path.slice('ext-'.length));
        } else if (path.indexOf('keybinding-') === 0) {
            promise = import(/* webpackMode: "eager" */ 'ace/src/keybinding-' + path.slice('keybinding-'.length));
        }
        
        return promise.then(callback);
    };
    
    editSession.EditSession.prototype.$useWorker = false;
});

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
