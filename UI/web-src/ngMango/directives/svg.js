/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';


svg.$inject = ['$document', '$templateCache'];
function svg($document, $templateCache) {
    const SELECTOR_ATTRIBUTE = 'ma-selector';
    const EMPTY_TEMPLATE_URL = '/ngMango/circle.svg';
    const EMPTY_TEMPLATE = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="100" cy="100" r="100"/>' +
        '</svg>';

    $templateCache.put(EMPTY_TEMPLATE_URL, EMPTY_TEMPLATE);
    
    return {
        restrict: 'E',
        // needs to be lower priority than ngIncludeFillContentDirective so our link runs first
        priority: -401,
        require: ['maSvg', 'ngInclude'],
        controller: angular.noop,
        bindToController: {
            attributes: '<?'
        },
        designerInfo: {
            attributes: {
                ngInclude: {defaultValue: '\'' + EMPTY_TEMPLATE_URL + '\''}
                //attributes: {defaultValue: "{circle: {'ng-style' : '{fill: myColor}'}}"}
            },
            size: {
                width: '50px',
                height: '50px'
            },
            translation: 'ui.components.maSvg',
            icon: 'widgets'
        },
        compile: function(tElement, tAtts) {
            const attributesBySelector = {};

            // find all child elements and create a map of selectors to attributes
            tElement[0].querySelectorAll('[' + SELECTOR_ATTRIBUTE + ']').forEach(function(selectorElement) {
                const selector = selectorElement.getAttribute(SELECTOR_ATTRIBUTE);
                if (!selector) return;
                const attributes = attributesBySelector[selector] = {};
                
                Array.prototype.forEach.call(selectorElement.attributes, function(attribute) {
                    if (attribute.name !== SELECTOR_ATTRIBUTE) {
                        attributes[attribute.name] = attribute.value;
                    }
                });
            });

            // no longer need the contents, empty the element
            tElement.empty();
            
            return function ($scope, $element, $attrs, controllers) {
                const maSvgCtrl = controllers[0];
                const ngIncludeCtrl = controllers[1];

                // merge the attributes from the bindings into our object
                angular.merge(attributesBySelector, maSvgCtrl.attributes);
                
                // parse the markup and create a dom tree
                // the ngInclude directive will insert this into $element in its link function
                ngIncludeCtrl.template = angular.element(ngIncludeCtrl.template);
                
                // create a parent node for querying
                const rootElement = $document[0].createElement('div');
                Array.prototype.forEach.call(ngIncludeCtrl.template, function(node) {
                    rootElement.appendChild(node);
                });

                // iterate over our selectors, find matching elements in the dom tree and add attribtues to them
                Object.keys(attributesBySelector).forEach(function(selector) {
                    const matchingElements = angular.element(rootElement.querySelectorAll(selector));
                    if (matchingElements.length) {
                        const attributes = attributesBySelector[selector];
                        Object.keys(attributes).forEach(function(attrName) {
                            matchingElements.attr(attrName, attributes[attrName]);
                        });
                    }
                });
            };
        }
    };
}

export default svg;


