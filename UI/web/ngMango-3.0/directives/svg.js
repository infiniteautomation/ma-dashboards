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
            var attributesById = {};

            tElement.children('ma-svg-element[selector]').each(function() {
                var id = this.getAttribute('selector');
                if (!id) return;
                var attributes = attributesById[id] = [];
                
                Array.prototype.forEach.call(this.attributes, function(attribute) {
                    attributes.push({
                        name: attribute.name,
                        value: attribute.value
                    });
                });
            });
            
            tElement.empty();
            
            return function ($scope, $element, $attrs, ngIncludeCtrl) {
                var svgTree = angular.element(ngIncludeCtrl.template);
                Object.keys(attributesById).forEach(function(id) {
                    var svgElement = svgTree.find(id);
                    if (svgElement.length) {
                        attributesById[id].forEach(function(attr) {
                            svgElement.attr(attr.name, attr.value);
                        });
                    }
                });
                ngIncludeCtrl.template = svgTree;
            };
        }
    };
}

return svg;

}); // define
