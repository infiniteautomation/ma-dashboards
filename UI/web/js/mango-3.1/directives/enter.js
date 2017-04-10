/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function enter() {
    return {
    	restrict: 'A',
    	compile: function() {
    		var name = this.name;
    		
    		return function($scope, $element, attr) {
    			$element.bind('keypress', function(event) {
    				if (event.which !== 13) return;
    				$scope.$apply(function() {
        				$scope.$eval(attr[name]);
    				});
    			});
            };
    	}
    };
}

enter.$inject = [];

return enter;

}); // define
