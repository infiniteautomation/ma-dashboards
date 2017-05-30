/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';

GoogleAnalyticsFactory.$inject = ['$rootScope', '$window', '$state'];
function GoogleAnalyticsFactory($rootScope, $window, $state) {
    function GoogleAnalytics() {
    }

    GoogleAnalytics.prototype.enable = function(propertyId) {
        if (propertyId) this.propertyId = propertyId;
        if (!this.propertyId) throw new Error('No property ID is set');

        // minified snippet from Google modified to remove jshint warnings and replace window with $window
        var ga = $window.ga = $window.ga || function() {
            (ga.q=ga.q||[]).push(arguments);
        };
        ga.l=Date.now();
        ga('create', this.propertyId, 'auto');
        
        require(['https://www.google-analytics.com/analytics.js']);

        if (!this.deregister) {
            this.deregister = $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                $window.ga('set', 'page', $state.href(toState.name, toParams));
                $window.ga('send', 'pageview');
            });
        }
    };
    
    GoogleAnalytics.prototype.disable = function() {
        this.propertyId = null;
        if ($window.ga) {
            $window.ga('create', null, 'auto');
        }
        if (this.deregister) {
            this.deregister();
            delete this.deregister;
        }
    };
    
    GoogleAnalytics.prototype.get = function() {
        return $window.ga;
    };
    
    return new GoogleAnalytics();
}

return GoogleAnalyticsFactory;

});
