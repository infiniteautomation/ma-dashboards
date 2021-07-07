/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maGetPointValue
 *
 * @description Gets a point value for a data point. Can also retrieve a data point by it's XID.
 * The point value will be available as a property of the data point object, as `.value` or `.renderedValue`.
 *
 * - Example 1, [get point value for a data point](examples/basics/live-values)
 * - Example 2, [get a data point by it's XID](examples/basics/get-point-by-xid)
 *
 * @param {object=} point A data point object from a watch list, point query, point drop-down, or `maPoint` service. If a `point-xid` attribute
 * is provided, this attribute will be used to output the retrieved data point.
 * @param {string=} point-xid Instead of supplying a data point object, you can supply it's XID. If the expression in the `point` attribute is assignable
 * then the retrieved data point will be assigned to that expression.
 * @param {object[]=} points Rather then passing in a single data point object to `point` you can pass in an
 array of point objects (from `<ma-point-query>` for example) and have the live values added to each point object in the array.
 * @param {function=} on-value-updated Pass in a function or expression to be evaluated when the value updates. (eg.
 * `on-value-updated="$ctrl.valueUpdated(point)"`)
 *
 * @usage
 *
 <md-input-container class="md-block">
     <label>Choose a point</label>
     <ma-point-list ng-model="myPoint1"></ma-point-list>
 </md-input-container>
 
<ma-get-point-value point="myPoint1"></ma-get-point-value>
<p>Point name is "{{myPoint1.name}}" and its value is {{myPoint1.renderedValue}}.</p>

<!-- Retrieve a data point by its XID and assign to variable myPoint2 -->
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
            onValueUpdated: '&?',
            onGetPoint: '&?'
        },
        link: function ($scope, $element, attrs) {

            function websocketHandler(event) {
                const payload = event.payload;
                $scope.$applyAsync(function() {
                    const points = $scope.points || [$scope.point];
                    for (let i = 0; i < points.length; i++) {
                        const point = points[i];
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

            const SUBSCRIPTION_TYPES = ['REGISTERED', 'UPDATE', 'TERMINATE', 'INITIALIZE'];

            $scope.$watch('pointXid', function(newXid, oldXid) {
                if (newXid === undefined && newXid === oldXid) return;
                if ($scope.point && $scope.point.xid === newXid) return;
                
                if ($scope.pointResource && $scope.pointResource.$cancelRequest) {
                    $scope.pointResource.$cancelRequest();
                }
                if (!newXid) {
                    $scope.point = null;
                    return;
                }
                
                $scope.pointResource = Point.get({xid: newXid});
                $scope.pointResource.$promise.then(function(point) {
                    $scope.point = point;
                    if ($scope.onGetPoint) {
                        $scope.onGetPoint({$point: point});
                    }
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
                let changedPoints;
                
                // check initialization scenario
                if (newPoints === oldPoints) {
                    changedPoints = {
                        added: newPoints || [],
                        removed: []
                    };
                } else {
                    changedPoints = Util.arrayDiff(newPoints, oldPoints);
                }

                let i;

                for (i = 0; i < changedPoints.removed.length; i++) {
                    const removed = changedPoints.removed[i];
                    pointEventManager.unsubscribe(removed.xid, SUBSCRIPTION_TYPES, websocketHandler);
                }

                for (i = 0; i < changedPoints.added.length; i++) {
                    const added = changedPoints.added[i];
                    pointEventManager.subscribe(added.xid, SUBSCRIPTION_TYPES, websocketHandler);
                }
            });

            $scope.$on('$destroy', function() {
                if ($scope.point) {
                    pointEventManager.unsubscribe($scope.point.xid, SUBSCRIPTION_TYPES, websocketHandler);
                }
                if ($scope.points) {
                    for (let i = 0; i < $scope.points.length; i++) {
                        pointEventManager.unsubscribe($scope.points[i].xid, SUBSCRIPTION_TYPES, websocketHandler);
                    }
                }
            });
        }
    };
}

getPointValue.$inject = ['maPointEventManager', 'maPoint', 'maUtil'];
export default getPointValue;


