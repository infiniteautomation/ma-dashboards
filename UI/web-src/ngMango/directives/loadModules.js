/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maLoadModules
 * @restrict A
 * @description Used to lazily load AngularJS modules by name, use with ng-if to hide children until after
 * the modules are loaded.
 * 
 * @param {string[]} ma-load-modules Array of module names to load
 * @param {expression=} ma-modules-loaded Expression which is evaluated when the modules have loaded.
 *
 */

loadModules.$inject = ['maModuleLoader', '$timeout'];
function loadModules(maModuleLoader, $timeout) {
    class ModuleLoaderController {
        static get $$ngIsClass() { return true; }
        
        $onChanges(changes) {
            if (changes.moduleNames && this.moduleNames) {
                let moduleNames = this.moduleNames;
                if (!Array.isArray(moduleNames)) {
                    moduleNames = [moduleNames];
                }
                maModuleLoader.loadModules(moduleNames).then(() => {
                    if (this.modulesLoaded) {
                        this.modulesLoaded({$modules: moduleNames});
                    }
                });
            }
        }
    }
    
    return {
        restrict: 'A',
        scope: false,
        priority: 601, // has to be higher priority than ng-if to use on same element
        bindToController: {
            moduleNames: '<maLoadModules',
            modulesLoaded: '&?maModulesLoaded'
        },
        controller: ModuleLoaderController
    };
}

export default loadModules;
