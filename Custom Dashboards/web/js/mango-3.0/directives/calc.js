/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */



define([], function() {
'use strict';
/**
* @ngdoc directive
* @name Calc
*
* @description
* Resize textarea automatically to the size of its text content.
*
* @example
  <example module="rfx">
    <file name="index.html">
        <textarea ng-model="text"rx-autogrow class="input-block-level"></textarea>
        <pre>{{text}}</pre>
    </file>
  </example>
*/
function calc() {
    return {
        scope: {
            output: '='
        },
        link: function($scope, $element, attr) {
        	var deregister = $scope.$parent.$watch(attr.input, function(newValue) {
            	$scope.output = newValue;
    		});
        	$scope.$on('$destroy', deregister);
        }
    };
}

calc.$inject = [];

return calc;

}); // define
