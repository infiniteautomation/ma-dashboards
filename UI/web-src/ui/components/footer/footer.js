/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import footerTemplate from './footer.html';
import moment from 'moment-timezone';

FooterController.$inject = ['maModules'];
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

export default {
    controller: FooterController,
    template: footerTemplate
};

