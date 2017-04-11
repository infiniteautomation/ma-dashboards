/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function focusOn($timeout) {
    return {
    	restrict: 'A',
    	compile: function(cElem, cAttrs, transclude) {
    		var name = this.name;
    		
    		return function($scope, $element, attr) {
            	$scope.$watch(attr[name], function(newValue, oldValue) {
            		if (newValue !== oldValue && newValue) {
            		    $timeout(function() {
            		        $element.focus();
            		    });
            		}
            	});
            };
    	}
    };
}

focusOn.$inject = ['$timeout'];

return focusOn;

}); // define
