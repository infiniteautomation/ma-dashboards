/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

ModulesPageController.$inject = ['maModules'];
function ModulesPageController(Modules) {
    this.Modules = Modules;
}

ModulesPageController.prototype.$onInit = function() {
    this.Modules.getAll().then(function(modules) {
        this.modules = modules;
    }.bind(this));
};

ModulesPageController.prototype.bgColor = function(module) {
    if (module.unloaded) return 'warn-hue-3';
//    if (!module.signed) return 'warn-hue-2';
    return 'background-hue-1';
};

return {
    controller: ModulesPageController,
    templateUrl: require.toUrl('./modulesPage.html')
};

}); // define
