/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */
 /**
  * @ngdoc directive
  * @name ngMango.maFocusOn
  * @restrict A
  * @description
  * `<input ma-focus-on="whenThisIsTrue">`
  * - Restricted to usage as an attribute.
  * - When the expression is true the element with the attribute is given focus.
  *
  *
  * @usage
  * <input ng-blur="showSetInput1=false" ng-model="myValue1"
         ma-focus-on="showSetInput1" ma-enter="mySetPoint.setValue(myValue1); showSetInput1=false">
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
