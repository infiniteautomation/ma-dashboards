/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

/**
 * @ngdoc directive
 * @name ngMango.directive:maFocusOn
 * @restrict A
 * @element input
 * @priority 0
 * @description Sets the focus on the element when the expression evaluates to a truthy value
 * 
 * @param {boolean} ma-focus-on Sets the focus on the element when a truthy value
 * 
 * @usage <input ma-focus-on="{boolean}">
 */

focusOn.$inject = ['$timeout'];
function focusOn($timeout) {
    return {
    	restrict: 'A',
    	scope: false,
    	link: function($scope, $element, $attrs) {
        	$scope.$watch($attrs.maFocusOn, function(newValue, oldValue) {
        		if (newValue !== oldValue && newValue) {
        		    $timeout(function() {
        		        $element.focus();
        		    });
        		}
        	});
        }
    };
}

return focusOn;

}); // define
