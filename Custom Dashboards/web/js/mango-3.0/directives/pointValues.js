/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'moment-timezone'], function(angular, moment) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maPointValues
 *
 * @description
 * `<ma-point-values point="point1" values="point1Values" from="from" to="to" rollup="AVERAGE" rollup-interval="1 minutes">
</ma-point-values>`
 * - The `<ma-point-values>` directive returns an array of historical values on a data point to its `values` attribute.
 * -  `<ma-point-values>` is passed a `to` & `from` value a date picker.
 * - Additionally, `rollup` & `rollup-interval` can be used to average the data
 * - You can use the `point-xid` property or pass in a point from `<ma-point-list>`.
 * - [View `to/from` Demo](/modules/dashboards/web/mdAdmin/#/dashboard/examples/basics/point-values) / [View `latest` Demo](/modules/dashboards/web/mdAdmin/#/dashboard/examples/basics/latest-point-values)
 * @param {object} point Inputs a `point` object from `<ma-point-list>`
 * @param {object=} points Alternatively you can input an array of points from `<ma-point-query>`
 * @param {string=} point-xid Alternatively you can pass in the `xid` of a point to use.
 * @param {array} values Outputs the array of historical point values.
 * @param {object} from The starting time to query the point values over a time period.
 * @param {object} to The ending time to query the point values over a time period.
 * @param {number=} latest Rather then `to/from` you can choose to use this property with the latest `X` number of values.
 * @param {boolean=} realtime Used with the `latest` attribute, if set to `true` the latest `X` number of values will update as new values are pushed to a data point.
 * @param {string=} rollup The statistical operation to apply to the values over the given `rollup-interval`. This will effect the outputted `values`. Rollup possibilities are:
<ul>
    <li>NONE (Default)</li>
    <li>AVERAGE</li>
    <li>DELTA</li>
    <li>MINIMUM</li>
    <li>MAXIMUM</li>
    <li>ACCUMULATOR</li>
    <li>SUM</li>
    <li>FIRST</li>
    <li>LAST</li>
    <li>COUNT</li>
    <li>INTEGRAL</li>
</ul>
 * @param {string=} rollup-interval The interval used with the rollup. Format the interval duration as a string starting with a number followed by one of these units:
<ul>
    <li>years</li>
    <li>months</li>
    <li>weeks</li>
    <li>days</li>
    <li>hours</li>
    <li>minutes</li>
    <li>seconds</li>
    <li>milliseconds</li>
</ul>
 * @param {boolean=} rendered If set to `true` the values will be outputted in the points text rendered value format.
 * @param {string=} date-format If you are passing in `to/from` as strings, then you must specify the moment.js format for parsing the values.
 * @param {number=} timeout If provided you can set the timeout (in milliseconds) on the querying of point values. If not supplied the Mango system default timeout will be used.
 * @usage
 *
<ma-point-values point="point1" values="point1Values" from="from" to="to" rollup="AVERAGE" rollup-interval="1 minutes">
</ma-point-values>
 *
 */
function pointValues($http, pointEventManager, Point, $q, mangoTimeout, Util) {
    return {
        scope: {
            point: '=?',
            points: '=?',
            pointXid: '@',
            values: '=?',
            from: '=?',
            to: '=?',
            latest: '=?',
            realtime: '=?',
            rollup: '@',
            rollupInterval: '@',
            rendered: '@',
            dateFormat: '@',
            timeout: '='
        },
        link: function ($scope, $element, attrs) {
            var pendingRequest = null;
            var values = {};
            var tempValues = {};
            var subscriptions = {};

            var singlePoint = !attrs.points;
            if ($scope.realtime === undefined) $scope.realtime = true;

            $scope.$on('$destroy', function() {
            	unsubscribe();
            });

            $scope.$watch('realtime', function(newValue, oldValue) {
            	if (newValue !== oldValue) {
            		if (newValue) {
            			subscribe();
            		} else {
            			unsubscribe();
            		}
            	}
            });

            $scope.$watch(function() {
            	var xids = [];
            	if ($scope.points) {
	            	for (var i = 0; i < $scope.points.length; i++) {
	            		if (!$scope.points[i]) continue;
	            		xids.push($scope.points[i].xid);
	            	}
            	}

            	return {
            		xids: xids,
            		from: moment.isMoment($scope.from) ? $scope.from.valueOf() : $scope.from,
            		to: moment.isMoment($scope.to) ? $scope.to.valueOf() : $scope.to,
            		latest: $scope.latest,
            		rollup: $scope.rollup,
            		rollupInterval: $scope.rollupInterval,
            		rendered: $scope.rendered
            	};
            }, function(newValue, oldValue) {
            	var changedXids = Util.arrayDiff(newValue.xids, oldValue.xids);
            	var i;

            	for (i = 0; i < changedXids.removed.length; i++) {
            		var removedXid = changedXids.removed[i];
                	unsubscribe(removedXid);

                	// delete values and temp values if they exist
                	delete values[removedXid];
                	delete tempValues[removedXid];

                	// remove old values
                	if (singlePoint) {
                		delete $scope.values;
                	} else if ($scope.values) {
                		// remove values for xid from combined values
                		for (var j = 0; j < $scope.values.length; j++) {
                			var item = $scope.values[j];
                			delete item['value_' + removedXid];
                			// if this was the last value for this timestamp remove
                			// the item from the combined values
                			if (Util.numKeys(item, 'value') === 0) {
                				$scope.values.splice(j--, 1);
                			}
                		}
                	}
            	}

            	for (i = 0; i < changedXids.added.length; i++) {
            		if ($scope.realtime && $scope.latest) {
            			subscribe(changedXids.added[i]);
            		}
            	}

            	if (!$scope.points || !$scope.points.length) return;
            	var points = $scope.points.slice(0);

            	var promises = [];
            	var cancels = [];

            	// cancel existing requests if there are any
            	if (pendingRequest) pendingRequest();
            	pendingRequest = Util.cancelAll.bind(null, cancels);

            	for (i = 0; i < points.length; i++) {
            		if (!points[i] || !points[i].xid) continue;

            		if (!points[i].pointLocator) {
            		    var queryPromise = Point.get({xid: points[i].xid}).$promise
            		        .then(chainedQuery);
            		    promises.push(queryPromise);
            		} else {
            		    var query = doQuery(points[i]);
                        promises.push(query.promise);
                        cancels.push(query.cancel);
            		}
            	}

            	function chainedQuery(point) {
                    var query = doQuery(point);
                    cancels.push(query.cancel);
                    return query.promise;
                }

            	$q.all(promises).then(function(results) {
            		pendingRequest = null;
                	if (!results.length) return;

            		for (var i = 0; i < results.length; i++) {
            			var point = results[i].point;
            			var pointValues = results[i].values;

            			pointValues.concat(tempValues[point.xid]);
                        delete tempValues[point.xid];

                        if ($scope.latest) {
                        	limitValues(pointValues);
                        }

                        values[point.xid] = pointValues;
            		}

            		if (singlePoint) {
            			$scope.values = values[points[0].xid];
            		} else {
            			combineValues();
            		}
            	}, function(reason) {
            		if (cancels.length) {
            			// cancel hasn't been called, single failure
            			console.log(reason);
            		} else {
            			console.log('cancelled');
            		}
            	});
            }, true);

            if (singlePoint) {
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

                $scope.$watch('point.xid', function(newValue, oldValue) {
                    if (newValue) {
                        $scope.points = [$scope.point];
                    } else {
                        $scope.points = [];
                    }
                });
            }

            function combineValues() {
            	var combined = {};

            	for (var xid in values) {
            		var seriesValues = values[xid];
            		combineInto(combined, seriesValues, 'value_' + xid);
            	}

                // convert object into array
                var output = [];
                for (var timestamp in combined) {
                    output.push(combined[timestamp]);
                }

                // sort array by timestamp
                output.sort(function(a,b) {
                    return a.timestamp - b.timestamp;
                });

                $scope.values = output;
            }

            function combineInto(output, newValues, valueField) {
                if (!newValues) return;

                for (var i = 0; i < newValues.length; i++) {
                    var value = newValues[i];
                    var timestamp = value.timestamp;

                    if (!output[timestamp]) {
                        output[timestamp] = {timestamp: timestamp};
                    }

                    output[timestamp][valueField] = value.value;
                }
            }

            function subscribe(xid) {
            	if (!xid) {
            		for (var i = 0; i < $scope.points.length; i++) {
                		if (!$scope.points[i]) continue;
            			subscribe($scope.points[i].xid);
            		}
            	} else {
            		if (subscriptions[xid]) return;
            		pointEventManager.subscribe(xid, ['UPDATE'], websocketHandler);
                    subscriptions[xid] = true;
            	}
            }

            function unsubscribe(xid) {
            	if (!xid) {
            		for (var key in subscriptions) {
            			unsubscribe(key);
            		}
            	} else if (subscriptions[xid]) {
            		pointEventManager.unsubscribe(xid, ['UPDATE'], websocketHandler);
            		delete subscriptions[xid];
            	}
            }

            function websocketHandler(event, payload) {
                var xid = payload.xid;

                $scope.$apply(function() {
                	if (!payload.value) return;

                	var value;
                    if ($scope.rendered === 'true') {
                    	value = payload.renderedValue;
                    } else if (payload.convertedValue !== null && payload.convertedValue !== undefined) {
                    	value = payload.convertedValue;
                    } else {
                    	value = payload.value.value;
                    }

                    var item = {
                        value : value,
                        timestamp : payload.value.timestamp
                    };

                    var destArray = singlePoint ? $scope.values : values[xid];

                    if (pendingRequest) {
                    	if (!tempValues[xid]) tempValues[xid] = [];
                    	tempValues[xid].push(item);
                    } else {
                    	values[xid].push(item);
                    	if ($scope.latest) {
                        	limitValues(values[xid]);
                        }
                    	// TODO limit combined values, just run combineValues() again?
                    	if (!singlePoint) {
                    		var last = $scope.values.length && $scope.values[$scope.values.length - 1];
                    		if (last && last.time === item.timestamp) {
                    			last['value_' + xid] = item.value;
                    		} else {
                    			var newVal = {time: item.timestamp};
                    			newVal['value_' + xid] = item.value;
                    			$scope.values.push(newVal);
                    		}
                    	}
                    }
                });
            }

            function limitValues(values) {
            	while (values.length > $scope.latest) {
            		values.shift();
                }
            }

            function doQuery(point) {
                if (!point || !point.xid) return $q.reject('no point');
            	var now, from, to;

            	if (!$scope.latest) {
            		now = new Date();
            		from = Util.toMoment($scope.from, now, $scope.dateFormat);
            		to = Util.toMoment($scope.to, now, $scope.dateFormat);
            	}

                var url = '/rest/v1/point-values/'  + encodeURIComponent(point.xid);
                var params = [];
                var reverseData = false;
                var dataType = point.pointLocator.dataType;
                var result = {
                	point: point
                };

                if ($scope.latest) {
                    url += '/latest';
                    params.push('limit=' + encodeURIComponent($scope.latest));
                    reverseData = true;
                } else {
                    if (from.valueOf() === to.valueOf()) {
                    	result.values = [];
                    	return {
                    		promise: $q.when(result),
                    		cancel: angular.noop
                    	};
                    }

                    params.push('from=' + encodeURIComponent(from.toISOString()));
                    params.push('to=' + encodeURIComponent(to.toISOString()));

                    if (!Util.isEmpty($scope.rollup) && $scope.rollup !== 'NONE') {
                        params.push('rollup=' + encodeURIComponent($scope.rollup));

                        var timePeriodType = 'DAYS';
                        var timePeriods = 1;

                        if (!Util.isEmpty($scope.rollupInterval)) {
                        	var parts = $scope.rollupInterval.split(' ');
                        	if (parts.length == 2 && !Util.isEmpty(parts[0]) && !Util.isEmpty(parts[1])) {
                        		var intVal = parseInt(parts[0], 10);
                        		timePeriods = intVal > 0 ? intVal : 1;
                        		timePeriodType = parts[1].toUpperCase();
                        	}
                        }

                        params.push('timePeriodType=' + encodeURIComponent(timePeriodType));
                        params.push('timePeriods=' + encodeURIComponent(timePeriods));
                    }
                }

                if (dataType === 'NUMERIC' || $scope.rendered === 'true') {
                    // TODO unit conversion not working with rollups
                    // use rendered and parse strings
                    //params.push('unitConversion=true');
                    params.push('useRendered=true');
                }

                for (var i = 0; i < params.length; i++) {
                    url += (i === 0 ? '?' : '&') + params[i];
                }

    			var cancelDefer = $q.defer();
    			var cancelFn = cancelDefer.resolve;
    			setTimeout(cancelFn, $scope.timeout || mangoTimeout);

                var promise = $http.get(url, {
                	timeout: cancelDefer.promise,
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(function(response) {
                    var values = response.data;

                    if (reverseData)
                        values.reverse();

                    // TODO remove when unit conversion fixed
                    if (dataType === 'NUMERIC' && $scope.rendered !== 'true') {
                        for (var i = 0; i < values.length; i++) {
                            if (typeof values[i].value === 'string') {
                                values[i].value = parseFloat(values[i].value);
                            }
                        }
                    }

                    result.values = values;
                    return result;
                });

                return {
                	promise: promise,
                	cancel: cancelFn
                };
            }
        }
    };
}

pointValues.$inject = ['$http', 'pointEventManager', 'Point', '$q', 'mangoTimeout', 'Util'];
return pointValues;

}); // define
