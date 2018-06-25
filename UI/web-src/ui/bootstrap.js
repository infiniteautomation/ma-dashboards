/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import './app';
import defaultUiSettings from './uiSettings.json';
import {require as requirejs} from 'requirejs';
import {moduleVersions} from '../shims/exportAMD.js';
import {MA_UI_SETTINGS_XID, MA_UI_MENU_XID} from './constants.js';

// Get an injector for the ngMangoServices app and use the JsonStore service to retrieve the
// custom user menu items from the REST api prior to bootstrapping the main application.
// This is so the states can be added to the stateProvider in the config block for the
// main application. If the states are added after the main app runs then the user may
// not navigate directly to one of their custom states on startup
const servicesInjector = angular.injector(['ngMangoServices'], true);
const User = servicesInjector.get('maUser');
const JsonStore = servicesInjector.get('maJsonStore');
const $q = servicesInjector.get('$q');
const $http = servicesInjector.get('$http');
const maCssInjector = servicesInjector.get('maCssInjector');

// ensures credentials are saved/deleted on first page load if params are set
User.getCredentialsFromUrl();

const settingsStorePromise = JsonStore.getPublic({xid: MA_UI_SETTINGS_XID}).$promise.then(null, angular.noop);
const uiSettingsPromise = settingsStorePromise.then(settingsStore => {
    const uiSettings = angular.copy(defaultUiSettings);
    
    if (settingsStore) {
        angular.merge(uiSettings, settingsStore.jsonData);
    }

    if (uiSettings.userCss) {
    	maCssInjector.injectLink(uiSettings.userCss, 'userCss', 'meta[name="user-styles-after-here"]');
    }
    
    // contains fix for https://github.com/angular/material/issues/10516
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Mac OS X') >= 0 && userAgent.indexOf('Safari/') >= 0 &&
    		userAgent.indexOf('Chrome/') < 0 && userAgent.indexOf('Chromium/') < 0) {
        // assign to variable to stop other warnings
        // jshint unused:false
        const safariCss = import(/* webpackChunkName: "ui.safari" */ './styles/safari.css');
    }
    
    return uiSettings;
});

const userPromise = User.getCurrent().$promise.then(null, () => {
    return uiSettingsPromise.then(uiSettings => {
        return User.autoLogin(uiSettings);
    });
});

const userMenuStorePromise = userPromise.then(user => {
    return JsonStore.get({xid: MA_UI_MENU_XID}).$promise;
}, error => null);

// only going to load the user modules if we are logged in
const angularModulesPromise = userPromise.then(user => {
    const moduleUrlsPromise = $http({
        method: 'GET',
        url: '/rest/v1/modules/angularjs-modules/public'
    }).then(response => response.data && response.data.urls || [], error => []);
    
    return $q.all([moduleUrlsPromise, uiSettingsPromise]);
}).then(([moduleUrls, uiSettings]) => {
    const urls = moduleUrls.map(url => {
        return url.replace(/^\/modules\/(.*?)\/web\/(.*?).js(?:\?v=(.*))?$/, (match, module, filename, version) => {
            moduleVersions[module] = version;
            return `modules/${module}/web/${filename}`;
        });
    });

    if (uiSettings.userModule) {
        urls.push(uiSettings.userModule);
    }

    const modulePromises = urls.map(url => {
        const deferred = $q.defer();
        requirejs([url], module => {
            deferred.resolve(module);
        }, () => {
            console.log('Failed to load AngularJS module', arguments);
            deferred.resolve();
        });
        return deferred.promise;
    });

    return $q.all(modulePromises);
}, error => {
    console.log('Error loading AngularJS modules from Mango modules', error);
    return [];
});

$q.all([userPromise.then(null, error => null), userMenuStorePromise, uiSettingsPromise, angularModulesPromise])
.then(([user, userMenuStore, uiSettings, angularModules]) => {
    // *dont* destroy the services injector
	// If you do, you end up with two $rootScopes once the app bootstraps, the first with id 1, the second with id 2
	// This caused the "send test email" button not to work on first load
    //servicesInjector.get('$rootScope').$destroy();

    uiSettings.mangoModuleNames = [];
    const angularJsModuleNames = ['maUiApp'];
    angularModules.forEach((angularModule, index, array) => {
        if (angularModule && angularModule.name) {
            angularJsModuleNames.push(angularModule.name);
            
            if (uiSettings.userModule && index === (array.length - 1)) {
                uiSettings.userModuleName = angularModule.name;
            } else {
                uiSettings.mangoModuleNames.push(angularModule.name);
            }
        }
    });

    // create a new AngularJS module which depends on the ui module and all the modules' AngularJS modules
    const maUiBootstrap = angular.module('maUiBootstrap', angularJsModuleNames);

    // configure the the providers using data retrieved before bootstrap
    maUiBootstrap.config(['maUserProvider', 'maUiMenuProvider', 'maUiSettingsProvider',
            (UserProvider, maUiMenuProvider, maUiSettingsProvider) => {

        // store pre-bootstrap user into the User service
        UserProvider.setUser(user);
        
        if (userMenuStore) {
            // also registers the custom menu items
            maUiMenuProvider.setCustomMenuStore(userMenuStore);
        }

        maUiSettingsProvider.setUiSettings(uiSettings);
    }]);
    
    angular.element(() => {
        try {
            angular.bootstrap(document.documentElement, ['maUiBootstrap'], {strictDi: true});
        } catch (e) {
            const errorDiv = document.querySelector('.pre-bootstrap-error');
            const msgDiv = errorDiv.querySelector('div');
            const pre = errorDiv.querySelector('pre');
            const code = errorDiv.querySelector('code');
            const link = errorDiv.querySelector('a');

            msgDiv.textContent = 'Error bootstrapping Mango app: ' + e.message;
            code.textContent = e.stack;
            errorDiv.style.display = 'block';
            
            link.onclick = () => {
                pre.style.display = pre.style.display === 'none' ? 'block' : 'none';
            };
            
            throw e;
        }
    });
});
