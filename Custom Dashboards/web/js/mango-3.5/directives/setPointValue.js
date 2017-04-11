/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maSetPointValue
 * @restrict E
 * @description
 * `<ma-set-point-value point="myPoint"></ma-set-point-value>`
 * - `<ma-set-point-value>` will create an input element to set the value of a data point.
 * - The data point must be settable.
 * - It can handle `numeric`, `alphanumeric`, `binary`, and `multistate` point types and will display an appropriate interface element for each.
 * - Alternatively, you can set the value of a point by calling the `setValue` method on a point object.
 This function can be called from within an `ng-click` expression for example. (using this method does not require `<ma-set-point-value>`)
 * - <a ui-sref="dashboard.examples.settingPointValues.setPoint">View Demo</a> 
 *
 * @param {object} point Input the point object of a settable data point.
 * @param {boolean} [show-button=true] Specifies if the button is shown.
 * @param {boolean} [set-on-change=false] Specifies if the point value is set when an option is selected from the dropdown (always true if show-button is false)
 *
 * @usage
 * <ma-point-list limit="200" ng-model="myPoint"></ma-point-list>
 <ma-set-point-value point="myPoint"></ma-set-point-value>
 *
 */
function setPointValue(Translate, $q, $injector) {
    return {
        restrict: 'E',
        scope: {
            point: '=',
            showButton: '=?',
            setOnChange: '='
        },
        replace: true,
        templateUrl: function() {
            if ($injector.has('$mdUtil')) {
                return require.toUrl('./setPointValue-md.html');
            }
            return require.toUrl('./setPointValue.html');
        },
        link: function($scope) {
            if (angular.isUndefined($scope.showButton)) {
                $scope.showButton = true;
            }
        	$scope.input = {};

        	$scope.defaultBinaryOptions = [];
        	var trPromise = $q.all([Translate.tr('common.false'), Translate.tr('common.true')]).then(function(trs) {
        		$scope.defaultBinaryOptions.push({
					id: false,
					label: trs[0]
				});
        		$scope.defaultBinaryOptions.push({
        			id: true,
					label: trs[1]
				});
			});
        	
        	$scope.selectChanged = function() {
        	    if ($scope.setOnChange || !$scope.showButton)
        	        $scope.result = $scope.point.setValueResult($scope.input.value);
        	};

        	$scope.$watch('point', function(newValue) {
        		if (newValue === undefined) return;
        		delete $scope.input.value;
        		delete $scope.result;

        		var locator = $scope.point.pointLocator;
        		var type = locator.dataType;
        		var textRenderer = $scope.point.textRenderer;
        		$scope.options = null;

        		if (type === 'MULTISTATE') {
        			var values = locator.values;
        			var i;

        			$scope.options = [];
        			for (i = 0; i < values.length; i++) {
        				var renderer = $scope.point.valueRenderer(values[i]);
        				var label = renderer ? renderer.text : values[i];
        				var option = {
        					id: values[i],
        					label: label,
        					style: {}
        				};
        				if (renderer && renderer.color) option.style.color = renderer.colour;
        				$scope.options.push(option);
        			}
        		} else if (type === 'BINARY') {
        			if ($scope.point.rendererMap()) {
        				var falseRenderer = $scope.point.valueRenderer(false);
        				var trueRenderer = $scope.point.valueRenderer(true);
        				$scope.options = [{
        					id: false,
        					label: falseRenderer.text,
        					style: {
        					    color: falseRenderer.color
        					}
        				}, {
        					id: true,
        					label: trueRenderer.text,
        					style: {
                                color: trueRenderer.color
        					}
        				}];
        			} else {
        				$scope.options = $scope.defaultBinaryOptions;
        			}
        		}
        	});
        }
    };
}

setPointValue.$inject = ['Translate', '$q', '$injector'];

return setPointValue;

}); // define
