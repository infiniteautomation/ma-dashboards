/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

ModulesPageController.$inject = ['Modules'];
function ModulesPageController(Modules) {
    this.Modules = Modules;
}

ModulesPageController.prototype.$onInit = function() {
    this.Modules.getAll().then(function(modules) {
        this.modules = modules;
    }.bind(this));
};

return {
    controller: ModulesPageController,
    templateUrl: require.toUrl('./modulesPage.html')
};

}); // define
