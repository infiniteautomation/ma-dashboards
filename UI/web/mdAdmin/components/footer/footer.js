/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'moment-timezone'], function(angular, require, moment) {
'use strict';

FooterController.$inject = ['Modules'];
function FooterController(Modules) {
    this.Modules = Modules;
    this.year = moment().year();
    this.productName = 'Mango Automation';
}

FooterController.prototype.$onChanges = function(changes) {
};

FooterController.prototype.$onInit = function() {
    this.Modules.getCore().then(function(coreModule) {
        this.coreModule = coreModule;
    }.bind(this));
};

return {
    controller: FooterController,
    templateUrl: require.toUrl('./footer.html')
};

}); // define