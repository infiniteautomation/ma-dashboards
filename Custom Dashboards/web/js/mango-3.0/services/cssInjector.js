/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function cssInjectorFactory($rootElement) {
    function CssInjector() {
        this.injected = {};
    }
    
    CssInjector.prototype.isInjected = function(trackingName, set) {
        if (trackingName) {
            if (this.injected[trackingName]) {
                return true;
            }
            if (set) this.injected[trackingName] = true;
        }
        return false;
    };
    
    CssInjector.prototype.injectLink = function(href, trackingName, afterSelector) {
        if (this.isInjected(trackingName, true)) return;
        
        var linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('href', href);
        insert(linkElement, afterSelector);
    };
    
    CssInjector.prototype.injectStyle = function(content, trackingName, afterSelector) {
        if (this.isInjected(trackingName, true)) return;
        
        var styleElement = document.createElement('style');
        styleElement.appendChild(document.createTextNode(content));
        insert(styleElement, afterSelector);
    };
    
    function insert(element, afterSelector) {
        var start = $rootElement[0] === document.documentElement ?
                document.head : $rootElement[0];
        
        if (afterSelector) {
            var matches = start.querySelectorAll(afterSelector);
            if (matches.length) {
                var last = matches[matches.length - 1];
                angular.element(last).after(element);
                return;
            }
        }
        
        angular.element(start).prepend(element);
    }

	return new CssInjector();
}

cssInjectorFactory.$inject = ['$rootElement'];

return cssInjectorFactory;

}); // define
