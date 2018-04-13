/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import {require} from 'requirejs';

WebAnalyticsFactory.$inject = ['$rootScope', '$window', '$state'];
function WebAnalyticsFactory($rootScope, $window, $state) {
    function WebAnalytics() {
    }

    WebAnalytics.prototype.enableGoogleAnalytics = function(propertyId) {
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
    
    WebAnalytics.prototype.disableGoogleAnalytics = function() {
        this.propertyId = null;
        if ($window.ga) {
            $window.ga('create', null, 'auto');
        }
        if (this.deregister) {
            this.deregister();
            delete this.deregister;
        }
    };
    
    WebAnalytics.prototype.getGoogleAnalytics = function() {
        return $window.ga;
    };
    
    return new WebAnalytics();
}

export default WebAnalyticsFactory;


