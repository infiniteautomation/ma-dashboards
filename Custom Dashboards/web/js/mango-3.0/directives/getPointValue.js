/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function getPointValue(pointEventManager, Point, Util) {
    return {
        scope: {
        	points: '=?',
            point: '=?',
            pointXid: '@'
        },
        link: function ($scope, $element, attrs) {

            function websocketHandler(event, payload) {
                $scope.$apply(function() {
                	if ($scope.point && payload.xid !== $scope.point.xid) return;
                	
                	var point;
                	
                	if ($scope.points) {
	                	for (var i = 0; i < $scope.points.length; i++) {
	                		var tmpPoint = $scope.points[i];
	                		if (payload.xid === tmpPoint.xid) {
	                			point = tmpPoint;
	                			break;
	                		}
	                	}
                	} else {
                		point = $scope.point;
                	}
                	
                	if (!point) return;
                	
	                point.enabled = !!payload.enabled;
	                if (payload.value) {
	                	var valueRenderer = point.valueRenderer(payload.value.value);
	                    var color = valueRenderer ? valueRenderer.color : null;
	                    
	                    point.value = payload.value.value;
	                    point.time = payload.value.timestamp;
	                    point.convertedValue = payload.convertedValue;
	                	point.renderedValue = payload.renderedValue;
	                	point.renderedColor = color;
	                }
                });
            }
            
            var SUBSCRIPTION_TYPES = ['REGISTERED', 'UPDATE', 'TERMINATE', 'INITIALIZE'];
            
            var pointPromise;
            $scope.$watch('pointXid', function(newXid) {
                delete $scope.point;
                if (pointPromise) {
                    pointPromise.reject();
                    pointPromise = null;
                }
                
                if (!newXid) return;
                pointPromise = Point.get({xid: newXid}).$promise;
                pointPromise.then(function(point) {
                    pointPromise = null;
                    $scope.point = point;
                });
            });
            
            $scope.$watch('point.xid', function(newXid, oldXid) {
                if (oldXid && oldXid !== newXid) {
                    pointEventManager.unsubscribe(oldXid, SUBSCRIPTION_TYPES, websocketHandler);
                }
                if (newXid) {
                	pointEventManager.subscribe(newXid, SUBSCRIPTION_TYPES, websocketHandler);
                }
            });
            
            $scope.$watchCollection('points', function(newPoints, oldPoints) {
            	var changedPoints = Util.arrayDiff(newPoints, oldPoints);
            	var i;
            	
            	for (i = 0; i < changedPoints.removed.length; i++) {
            		var removed = changedPoints.removed[i];
            		pointEventManager.unsubscribe(removed.xid, SUBSCRIPTION_TYPES, websocketHandler);
            	}
            	
            	for (i = 0; i < changedPoints.added.length; i++) {
            		var added = changedPoints.added[i];
            		pointEventManager.subscribe(added.xid, SUBSCRIPTION_TYPES, websocketHandler);
            	}
            });
            
            $scope.$on('$destroy', function() {
                if ($scope.point) {
                    pointEventManager.unsubscribe($scope.point.xid, SUBSCRIPTION_TYPES, websocketHandler);
                }
                if ($scope.points) {
                	for (var i = 0; i < $scope.points.length; i++) {
                		pointEventManager.unsubscribe($scope.points[i].xid, SUBSCRIPTION_TYPES, websocketHandler);
                	}
                }
            });
        }
    };
}

getPointValue.$inject = ['pointEventManager', 'Point', 'Util'];
return getPointValue;

}); // define
