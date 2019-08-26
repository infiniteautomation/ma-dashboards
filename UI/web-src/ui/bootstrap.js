/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import './app';
import defaultUiSettings from './uiSettings.json';
import {require as requirejs} from 'requirejs';
import amdConfiguration from '../shims/exportAMD.js';
import util from './bootstrapUtil.js';

let beforeinstallpromptEvent;
window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    beforeinstallpromptEvent = e;
});

/**
 * This service worker currently does nothing. It was only added to meet the criteria for prompting to install the application.
 * https://developers.google.com/web/fundamentals/app-install-banners/#criteria 
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/ui/serviceWorker.js').then(registration => {
            // all good
        }, error => {
            console.log('ServiceWorker registration failed', error);
        });
    });
}

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

//    const bundlePromise = new Promise((resolve, reject) => {
//        requirejs(['/rest/v1/modules/angularjs-modules/bundle'], result => {
//            resolve(result);
//        }, error => {
//            console.log('Failed to load bundle', arguments);
//            resolve();
//        });
//    });

    const modulesPromise = Promise.all([preLoginDataPromise, uiSettingsPromise]).then(([preLoginData, uiSettings]) => {
        const modules = preLoginData.angularJsModules.modules;
        const amdModuleNames = modules.filter(m => !m.supportsBundling).map(m => {
            amdConfiguration.moduleVersions[m.name] = m.version;
            return m.url.replace(/\.js$/, '');
        });

        if (uiSettings.userModule) {
            amdModuleNames.push(uiSettings.userModule);
        }
        
        modules.filter(m => m.supportsBundling).forEach(m => {
            const amd = m.amdModuleNames;
            amdModuleNames.push(...amd);
        });
    
        const modulePromises = amdModuleNames.map(moduleName => {
            return new Promise((resolve, reject) => {
                requirejs([moduleName], module => {
                    resolve(module);
                }, e => {
                    reject(e);
                });
            }).catch(e => {
                console.error(`Failed to load AMD module ${moduleName}`, e);
            });
        });
        
        return Promise.all(modulePromises);
    });
    
    const userPromise = preLoginDataPromise.then(preLoginData => {
        if (preLoginData.user) {
            preLoginData.user.originalId = preLoginData.user.username;
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

    return Promise.all([uiSettingsPromise, modulesPromise, userPromise, preLoginDataPromise, postLoginDataPromise]);
}).then(([uiSettings, angularModules, user, preLoginData, postLoginData]) => {
    
    amdConfiguration.defaultVersion = preLoginData.lastUpgradeTime;
    
    uiSettings.mangoModuleNames = [];
    const angularJsModuleNames = ['maUiApp'];
    
    preLoginData.angularJsModules.modules.filter(m => m.supportsBundling).forEach(m => {
        m.angularJsModuleNames.forEach(n => {
            try {
                angularModules.push(angular.module(n));
            } catch (e) {}
        });
    });
    
    angularModules.forEach((angularModule, index, array) => {
        if (angularModule && angularModule.name) {
            if (Array.isArray(angularModule.optionalRequires)) {
                angularModule.optionalRequires.forEach(require => {
                    try {
                        angular.module(require);
                        angularModule.requires.push(require);
                    } catch (e) {
                        // module not loaded, don't add to requires
                    }
                });
            }
            
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
    maUiBootstrap.config(['maUserProvider', 'maUiSettingsProvider', 'maUiServerInfoProvider', 'MA_UI_INSTALL_PROMPT',
            (UserProvider, maUiSettingsProvider, maUiServerInfoProvider, installPrompt) => {

        // store pre-bootstrap user into the User service
        UserProvider.setUser(user);
        maUiSettingsProvider.setUiSettings(uiSettings);

        maUiServerInfoProvider.setPreLoginData(preLoginData);
        if (postLoginData) {
            maUiServerInfoProvider.setPostLoginData(postLoginData);
        }
        
        Object.defineProperty(installPrompt, 'event', {
            configurable: true,
            get() {
                return beforeinstallpromptEvent;
            }
        });
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
