/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function switchImg() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
        	point: '=',
        	srcMap: '=?',
        	defaultSrc: '@'
        },
        template: '<img ng-src="{{src}}" ng-class="classes">',
        link: function ($scope, $element, attributes) {
        	$scope.classes = {};
        	
            $scope.$watch('point.value', function(newValue, oldValue) {
                if (newValue === undefined) {
                	delete $scope.src;
                } else {
                	// TODO better conversion to attr name for symbols etc
                	var attrName = typeof newValue === 'string' ? replaceAll(newValue, ' ', '-').toLowerCase() : newValue;
                	$scope.src = $element.attr('src-' + attrName);
                    if (!$scope.src && $scope.srcMap) {
                    	$scope.src = $scope.srcMap[newValue];
                    }
                }
                if (!$scope.src) {
                	$scope.src = $scope.defaultSrc || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
                }
            });

            $scope.$watch('point.enabled', function(newValue) {
            	var disabled = newValue !== undefined && !newValue;
            	$scope.classes['point-disabled'] = disabled;
            });
        }
    };
}

function replaceAll(target, search, replacement) {
    return target.replace(new RegExp(search, 'g'), replacement);
}

return switchImg;

}); // define
