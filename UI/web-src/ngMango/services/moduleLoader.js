/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
* @ngdoc service
* @name ngMangoServices.maModuleLoader
*
* @description Lazily loads a set list of AngularJS modules by name.
* 
*/

moduleLoaderFactory.$inject = ['$q', '$injector'];
function moduleLoaderFactory($q, $injector) {

    const availableModules = {
        'ui.ace'() {
            const acePromise = import(/* webpackMode: "lazy", webpackChunkName: "ace" */ 'ace').then(module => module.promise);
            const angularUiAcePromise = import(/* webpackMode: "lazy", webpackChunkName: "ace" */ 'angular-ui-ace');
            
            return Promise.all([acePromise, angularUiAcePromise]);
        }
    };
    
    const toAngularPromise = (es6Promise) => {
        const deferred = $q.defer();
        es6Promise.then(deferred.resolve, deferred.reject);
        return deferred.promise;
    };

    class ModuleLoader {
        
        /**
        * @ngdoc method
        * @methodOf ngMangoServices.maModuleLoader
        * @name maModuleLoader#loadModules
        *
        * @description Load modules by name
        * @param {string[]} loadModules Array of module names to load
        * @returns {promise} Promise is resolved when all modules have been loaded
        *
        */
        loadModules(moduleNames) {
            const promises = moduleNames.map(moduleName => {
                const loadFunction = availableModules[moduleName];
                if (typeof loadFunction !== 'function') {
                    return $q.reject();
                }
                return loadFunction();
            });

            return toAngularPromise(Promise.all(promises)).then(() => {
                $injector.loadNewModules(moduleNames);
            });
        }
    }
    
    return new ModuleLoader();
}

export default moduleLoaderFactory;
