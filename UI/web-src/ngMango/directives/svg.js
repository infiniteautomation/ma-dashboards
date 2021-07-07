/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';

/**
 * @ngdoc directive
 * @name ngMango.directive:maSvg
 * @restrict E
 * @description
 * Used to load a SVG into the page and apply AngularJS directives to elements inside the SVG without modifying the SVG file.
 * You should use <a href="https://docs.angularjs.org/api/ng/directive/ngInclude" target="_blank">ngInclude</a> to specify the URL of the SVG file. 
 * To apply AngularJS directives (or any other attributes) to elements inside the SVG file you must add child elements inside the <code>ma-svg</code> element.
 * We recommend using <code>div</code> elements, although it should not matter which element type you use.
 * These child elements must have a <code>ma-selector</code> attribute which is set to a
 * <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors" target="_blank">CSS selector</a> string.
 * This selector is used to locate elements inside the SVG file, any other attribute on the <code>div</code> element will be applied to the located
 * SVG elements.
 * 
 * @param {string} ng-include URL of the SVG file to load.
 * 
 * @usage
 * <ma-svg ng-include="'/path/to/my/image.svg'">
 *     <!-- Find the SVG element with id 'indicator' and add ng-style to it -->
 *     <div ma-selector="#indicator" ng-style="{fill: $ctrl.fillColor}"></div>
 *     
 *     <!-- Find every SVG rect with class 'spinner' and add ng-class to them -->
 *     <div ma-selector="rect.spinner" ng-class="{'ma-spin-counterclockwise': $ctrl.spin}"></div>
 * </ma-svg>
 */

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
                const $template = angular.element(ngIncludeCtrl.template);
                
                // create a parent node for querying
                const parent = $document[0].createElement('div');
                Array.prototype.forEach.call($template, n => parent.appendChild(n));

                // iterate over our selectors, find matching elements in the dom tree and add attributes to them
                Object.keys(attributesBySelector).forEach(selector => {
                    const matchingElements = parent.querySelectorAll(selector);
                    if (matchingElements.length) {
                        const attributes = attributesBySelector[selector];
                        Object.keys(attributes).forEach(attrName => {
                            for (const el of matchingElements) {
                                el.setAttribute(attrName, attributes[attrName]);
                            }
                        });
                    }
                });

                // ngIncludeFillContentDirective calls $element.html() with and argument of ngIncludeCtrl.template
                // This doesnt work in JQLite unless the argument is a string. Add a shim function to take care
                // of this.
                $element.html = function(content) {
                    // delete this function and restore the one from the prototype
                    delete this.html;

                    // just in case
                    if (typeof content === 'string') {
                        console.warn('Shimmed JQLite html() function was called with string content');
                        return this.html.apply(this, arguments);
                    }

                    return this.append.apply(this, arguments);
                };

                ngIncludeCtrl.template = $template.detach();
            };
        }
    };
}

export default svg;


