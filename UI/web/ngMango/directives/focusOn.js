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
 * @description Sets the focus on the element when the expression changes from a falsy value to a truthy value
 * or is truthy on initialization
 * 
 * @param {boolean} ma-focus-on Sets the focus on the element when this value becomes truthy
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
        		if (newValue) {
        		    $timeout(() => {
                        $element.focus();
        		    });
        		}
        	});
        }
    };
}

return focusOn;

}); // define
