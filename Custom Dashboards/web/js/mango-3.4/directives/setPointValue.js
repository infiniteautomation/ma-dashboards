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
setPointValue.$inject = ['Translate', '$q', '$injector', 'Point'];
function setPointValue(Translate, $q, $injector, Point) {
    return {
        restrict: 'E',
        designerInfo: {
            translation: 'dashboards.v3.components.setPointValue',
            icon: 'touch_app',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'dashboards.v3.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'dashboards.v3.components.dataPointXid', type: 'datapoint-xid'}
            }
        },
        scope: {
            point: '<?',
            pointXid: '@?',
            showButton: '<?',
            setOnChange: '<?'
        },
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
            
            $scope.convertRendered = function() {
                if (!$scope.point) return;
                
                var result;
                // jshint eqnull:true
                if ($scope.point.renderedValue != null) {
                    result = parseFloat($scope.point.renderedValue.trim());
                    if (isFinite(result))
                        return result;
                }
                if ($scope.point.convertedValue != null) {
                    return round($scope.point.convertedValue, 2);
                }
                if ($scope.point.value != null) {
                    return round($scope.point.value, 2);
                }
                
                function round(num, places) {
                    places = places || 1;
                    var multiplier = Math.pow(10, places);
                    return Math.round(num * multiplier) / multiplier;
                }
        	};
        	
        	var pointRequest;
            $scope.$watch('pointXid', function(newXid, oldXid) {
                if (newXid === undefined && newXid === oldXid) return;
                if ($scope.point && $scope.point.xid === newXid) return;
                
                if (pointRequest) {
                    pointRequest.$cancelRequest();
                }
                if (!newXid) {
                    pointRequest = null;
                    $scope.point = null;
                    return;
                }
                pointRequest = Point.get({xid: newXid});
                pointRequest.$promise.then(function(point) {
                    pointRequest = null;
                    $scope.point = point;
                }, function() {
                    pointRequest = null;
                    $scope.point = null;
                });
            });

        	$scope.$watch('point', function(newValue) {
        		if (newValue === undefined) return;
        		delete $scope.input.value;
        		delete $scope.result;

        		var locator = $scope.point.pointLocator;
        		var type = locator.dataType;
        		var textRenderer = $scope.point.textRenderer;
        		$scope.options = null;

        		if (type === 'MULTISTATE') {
        			var values = textRenderer.multistateValues;
                    if (values) {
                        $scope.options = [];
            			for (var i = 0; i < values.length; i++) {
            				var label = values[i].text;
            				var option = {
            					id: values[i].key,
            					label: label,
            					style: {
            					    color: values[i].color
            					}
            				};
            				$scope.options.push(option);
            			}
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

return setPointValue;

}); // define
