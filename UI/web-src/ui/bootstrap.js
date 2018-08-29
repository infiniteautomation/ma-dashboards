/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import './app';
import defaultUiSettings from './uiSettings.json';
import {require as requirejs} from 'requirejs';
import {moduleVersions} from '../shims/exportAMD.js';
import util from './bootstrapUtil.js';

Promise.resolve().then(() => {
    // clear the autologin credentials if the url parameter is set
    util.checkClearAutoLogin();
    
    const preLoginDataPromise = util.xhrRequest({
        method: 'GET',
        url: '/rest/v2/ui-bootstrap/pre-login'
    }).then(response => {
        if (response.status !== 200) {
            throw new Error('Failed to fetch pre-login bootstrap data');
        }
        return response.data;
    });
    
    const uiSettingsPromise = preLoginDataPromise.then(preLoginData => {
        const uiSettings = angular.copy(defaultUiSettings);
        const customSettings = preLoginData.uiSettings && preLoginData.uiSettings.jsonData;
        return angular.merge(uiSettings, customSettings);
    });
    
    const modulesPromise = Promise.all([preLoginDataPromise, uiSettingsPromise]).then(([preLoginData, uiSettings]) => {
        const moduleUrls = preLoginData.angularJsModules && preLoginData.angularJsModules.urls;
        const moduleNames = moduleUrls.map(url => {
            return url.replace(/^\/modules\/(.*?)\/web\/(.*?).js(?:\?v=(.*))?$/, (match, module, filename, version) => {
                moduleVersions[module] = version;
                return `modules/${module}/web/${filename}`;
            });
        });
    
        if (uiSettings.userModule) {
            moduleNames.push(uiSettings.userModule);
        }
    
        const modulePromises = moduleNames.map(moduleName => {
            return new Promise((resolve, reject) => {
                requirejs([moduleName], module => {
                    resolve(module);
                }, () => {
                    console.log('Failed to load AngularJS module', arguments);
                    resolve();
                });
            });
        });
    
        return Promise.all(modulePromises);
    });
    
    const userPromise = preLoginDataPromise.then(preLoginData => {
        if (preLoginData.user) {
            return preLoginData.user;
        }
        
        return uiSettingsPromise.then(uiSettings => {
            return util.autoLogin(uiSettings);
        });
    });
    
    const postLoginDataPromise = userPromise.then(user => {
        if (!user) return;
        
        return util.xhrRequest({
            method: 'GET',
            url: '/rest/v2/ui-bootstrap/post-login'
        }).then(response => {
            if (response.status !== 200) {
                throw new Error('Failed to fetch post-login bootstrap data');
            }
            return response.data;
        });
    });

    return Promise.all([uiSettingsPromise, modulesPromise, userPromise, postLoginDataPromise]);
}).then(([uiSettings, angularModules, user, postLoginData]) => {
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
        
        if (postLoginData && postLoginData.menu) {
            // also registers the custom menu items
            maUiMenuProvider.setCustomMenuStore(postLoginData.menu);
        }

        maUiSettingsProvider.setUiSettings(uiSettings);
    }]);

    // promise resolves when DOM loaded
    return new Promise(resolve => angular.element(resolve));
}).then(() => {
    angular.bootstrap(document.documentElement, ['maUiBootstrap'], {strictDi: true});
}).then(null, error => {
    const errorDiv = document.querySelector('.pre-bootstrap-error');
    const msgDiv = errorDiv.querySelector('div');
    const pre = errorDiv.querySelector('pre');
    const code = errorDiv.querySelector('code');
    const link = errorDiv.querySelector('a');

    msgDiv.textContent = 'Error bootstrapping Mango UI app: ' + error.message;
    code.textContent = error.stack;
    errorDiv.style.display = 'block';
    
    link.onclick = () => {
        pre.style.display = pre.style.display === 'none' ? 'block' : 'none';
    };
    
    console.error(error);
});
