/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

svg.$inject = ['$document'];
function svg($document) {
    var SELECTOR_ATTRIBUTE = 'ma-selector';
    
    return {
        restrict: 'E',
        // needs to be lower priority than ngIncludeFillContentDirective so our link runs first
        priority: -401,
        require: ['maSvg', 'ngInclude'],
        controller: angular.noop,
        bindToController: {
            attributes: '<?'
        },
        compile: function(tElement, tAtts) {
            var attributesBySelector = {};

            // find all child elements and create a map of selectors to attributes
            tElement[0].querySelectorAll('[' + SELECTOR_ATTRIBUTE + ']').forEach(function(selectorElement) {
                var selector = selectorElement.getAttribute(SELECTOR_ATTRIBUTE);
                if (!selector) return;
                var attributes = attributesBySelector[selector] = [];
                
                Array.prototype.forEach.call(selectorElement.attributes, function(attribute) {
                    if (attribute.name !== SELECTOR_ATTRIBUTE) {
                        attributes.push({
                            name: attribute.name,
                            value: attribute.value
                        });
                    }
                });
            });

            // no longer need the contents, empty the element
            tElement.empty();
            
            return function ($scope, $element, $attrs, controllers) {
                var maSvgCtrl = controllers[0];
                var ngIncludeCtrl = controllers[1];

                // merge the attributes from the bindings into our object
                angular.merge(attributesBySelector, maSvgCtrl.attributes);
                
                // parse the markup and create a dom tree
                // the ngInclude directive will insert this into $element in its link function
                ngIncludeCtrl.template = angular.element(ngIncludeCtrl.template);
                
                // create a parent node for querying
                var rootElement = $document[0].createElement('div');
                Array.prototype.forEach.call(ngIncludeCtrl.template, function(node) {
                    rootElement.appendChild(node);
                });

                // iterate over our selectors, find matching elements in the dom tree and add attribtues to them
                Object.keys(attributesBySelector).forEach(function(selector) {
                    var matchingElements = angular.element(rootElement.querySelectorAll(selector));
                    if (matchingElements.length) {
                        attributesBySelector[selector].forEach(function(attr) {
                            matchingElements.attr(attr.name, attr.value);
                        });
                    }
                });
            };
        }
    };
}

return svg;

}); // define
