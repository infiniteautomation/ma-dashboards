/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

svg.$inject = [];
function svg() {
    return {
        restrict: 'E',
        priority: -401,
        require: 'ngInclude',
        compile: function(tElement, tAtts) {
            var attributesBySelector = {};
            
            tElement[0].querySelectorAll('[ma-selector]').forEach(function(selectorElement) {
                var selector = selectorElement.getAttribute('ma-selector');
                if (!selector) return;
                var attributes = attributesBySelector[selector] = [];
                
                Array.prototype.forEach.call(selectorElement.attributes, function(attribute) {
                    if (attribute.name !== 'ma-selector') {
                        attributes.push({
                            name: attribute.name,
                            value: attribute.value
                        });
                    }
                });
            });

            tElement.empty();
            
            return function ($scope, $element, $attrs, ngIncludeCtrl) {
                ngIncludeCtrl.template = angular.element(ngIncludeCtrl.template);
                
                var rootElement;
                Array.prototype.some.call(ngIncludeCtrl.template, function(node) {
                    if (node instanceof Element) {
                        rootElement = node;
                        return true;
                    }
                });
                
                if (rootElement) {
                    Object.keys(attributesBySelector).forEach(function(selector) {
                        var matchingElements = angular.element(rootElement.querySelectorAll(selector));
                        if (matchingElements.length) {
                            attributesBySelector[selector].forEach(function(attr) {
                                matchingElements.attr(attr.name, attr.value);
                            });
                        }
                    });
                }
            };
        }
    };
}

return svg;

}); // define
