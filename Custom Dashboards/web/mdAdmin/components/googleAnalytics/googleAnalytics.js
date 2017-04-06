/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';

var googleAnalytics = {
    controller: GoogleAnalyticsController,
    bindings: {
        propertyId: '@'
    }
};

GoogleAnalyticsController.$inject = ['$rootScope', '$window', '$state'];
function GoogleAnalyticsController($rootScope, $window, $state) {
    this.$rootScope = $rootScope;
    this.$state = $state;

    require(['https://www.google-analytics.com/analytics.js'], function() {
        this.ga = $window.ga;
        if (this.propertyId) {
            this.ga('create', this.propertyId, 'auto');
            this.setPage();
        }
    }.bind(this));
}

GoogleAnalyticsController.prototype.$onChanges = function(changes) {
    if (changes.propertyId && this.propertyId && this.ga) {
        this.ga('create', this.propertyId, 'auto');
        this.setPage();
    }
};

GoogleAnalyticsController.prototype.$onInit = function() {
    this.$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        this.currentPage = this.$state.href(toState.name, toParams);
        this.setPage();
    }.bind(this));
};

GoogleAnalyticsController.prototype.setPage = function() {
    if (this.ga && this.propertyId && this.currentPage) {
        this.ga('set', 'page', this.currentPage);
        this.ga('send', 'pageview');
    }
};

return googleAnalytics;

}); // define
