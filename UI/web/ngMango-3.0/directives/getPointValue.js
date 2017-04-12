/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maGetPointValue
 *
 * @description
 * `<ma-get-point-value point="myPoint"></ma-get-point-value>`
 * - This directive pulls the live value of a data point and outputs it onto the `point` object.
 * - You can use the `point-xid` property or pass in a point from `<ma-point-list>`.
 * - Live values can be displayed as text within your HTML by using <code ng-non-bindable="">{{myPoint.value}}</code> or <code ng-non-bindable="">{{myPoint.renderedValue}}</code> expressions.
 * - Additionally, you can use the outputted value to make custom meters. [View Example](/modules/mangoUI/web/ui/#/dashboard/examples/single-value-displays/bars).
 * - <a ui-sref="dashboard.examples.basics.liveValues">View Demo</a> / <a ui-sref="dashboard.examples.basics.getPointByXid">View point-xid Demo</a>
 *
 * @param {object} point The point object that the live value will be outputted to.
 If `point-xid` is used this will be a new variable for the point object.
 If the point object is passed into this attribute from `<ma-point-list>`
 then the point object will be extended with the live updating value.
 * @param {string=} point-xid If used you can hard code in a data point's `xid` to get its live values.
 * @param {array=} points Rather then passing in a single `point` object to `point` you can pass in an
 array of point objects (from `<ma-point-query>` for example) and have the live values added to each point object in the array.
 *
 * @usage
 *
 <md-input-container class="md-block">
     <label>Choose a point</label>
     <ma-point-list ng-model="myPoint1"></ma-point-list>
 </md-input-container>
<ma-get-point-value point="myPoint1"></ma-get-point-value>
<p>Point name is "{{myPoint1.name}}" and its value is {{myPoint1.renderedValue}}.</p>

<ma-get-point-value point-xid="DP_698831" point="myPoint2"></ma-get-point-value>
<p>Point name is "{{myPoint2.name}}" and its value is {{myPoint2.renderedValue}}.</p>
 *
 */
function getPointValue(pointEventManager, Point, Util) {
    return {
        designerInfo: {
            translation: 'ui.components.getPointValue',
            icon: 'label_outline',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid'}
            }
        },
        scope: {
            point: '=?',
            pointXid: '@?',
            points: '<?',
            onValueUpdated: '&?'
        },
        link: function ($scope, $element, attrs) {

            function websocketHandler(event, payload) {
                $scope.$applyAsync(function() {
                	var points = $scope.points || [$scope.point];
                	for (var i = 0; i < points.length; i++) {
                        var point = points[i];
                        if (payload.xid === point.xid) {
                            point.websocketHandler(payload);
                            if ($scope.onValueUpdated) {
                                $scope.onValueUpdated({point: point});
                            }
                            break;
                        }
                    }
                });
            }

            var SUBSCRIPTION_TYPES = ['REGISTERED', 'UPDATE', 'TERMINATE', 'INITIALIZE'];

            $scope.$watch('pointXid', function(newXid, oldXid) {
                if (newXid === undefined && newXid === oldXid) return;
                if ($scope.point && $scope.point.xid === newXid) return;
                
                if ($scope.point && $scope.point.$cancelRequest) {
                    $scope.point.$cancelRequest();
                }
                if (!newXid) {
                    $scope.point = null;
                    return;
                }
                $scope.point = Point.get({xid: newXid});
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
                var changedPoints;
                
                // check initialization scenario
                if (newPoints === oldPoints) {
                    changedPoints = {
                        added: newPoints || [],
                        removed: []
                    };
                } else {
                    changedPoints = Util.arrayDiff(newPoints, oldPoints);
                }

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
