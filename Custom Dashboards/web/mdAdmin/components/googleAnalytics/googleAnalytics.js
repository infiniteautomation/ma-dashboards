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
    this.$window = $window;
    this.$state = $state;
    
    $window.ga=$window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
    require(['https://www.google-analytics.com/analytics.js']);
}

GoogleAnalyticsController.prototype.$onChanges = function(changes) {
    if (changes.propertyId && this.propertyId) {
        this.$window.ga('create', this.propertyId, 'auto');
        if (this.currentPage) {
            this.$window.ga('set', 'page', this.currentPage);
            this.$window.ga('send', 'pageview');
        }
    }
};

GoogleAnalyticsController.prototype.$onInit = function() {
    this.$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        this.currentPage = this.$state.href(toState.name, toParams);
        if (this.propertyId) {
            this.$window.ga('set', 'page', this.currentPage);
            this.$window.ga('send', 'pageview');
        }
    }.bind(this));
};

return googleAnalytics;

}); // define
