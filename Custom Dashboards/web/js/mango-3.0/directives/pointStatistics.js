/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

function pointValues($http, Point, Util, $q, mangoTimeout) {
    return {
        restrict: 'E',
        scope: {
            point: '=?',
            points: '=?',
            pointXid: '@',
            statistics: '=',
            from: '=?',
            to: '=?',
            dateFormat: '@',
            firstLast: '@',
            timeout: '='
        },
        link: function ($scope, $element, attrs) {
            var pendingRequest = null;
        	var stats = {};
            var singlePoint = !attrs.points;
        	
            $scope.$watch('pointXid', function() {
                if (!$scope.pointXid || $scope.point) return;
                $scope.point = Point.get({xid: $scope.pointXid});
            });

            $scope.$watch('point.xid', function(newValue, oldValue) {
            	$scope.points = [$scope.point];
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
            		from: $scope.from,
            		to: $scope.to
            	};
            }, function(newValue, oldValue) {
            	var changedXids = Util.arrayDiff(newValue.xids, oldValue.xids);
            	var i;

            	for (i = 0; i < changedXids.removed.length; i++) {
            		var removedXid = changedXids.removed[i];
            		
                	// delete stats for removed xid from stats object
                	delete stats[removedXid];
                	
                	// remove old values
                	if (singlePoint) {
                		delete $scope.statistics;
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
            		var query = doQuery(points[i]);
            		promises.push(query.promise);
            		cancels.push(query.cancel);
            	}
            	
            	$q.all(promises).then(function(results) {
            		pendingRequest = null;
                	if (!results.length) return;
            		var i;
            		
            		for (i = 0; i < results.length; i++) {
            			var point = results[i].point;
            			var pointStats = results[i].stats;
                        stats[point.xid] = pointStats;
            		}
            		
            		if (singlePoint) {
            			$scope.statistics = stats[points[0].xid];
            		} else {
            			var outputStats = [];
            			for (i = 0; i < points.length; i++) {
            				outputStats.push(stats[points[i].xid]);
            			}
            			$scope.statistics = outputStats;
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

        	// TODO use service to get statistics
            function doQuery(point) {
                if (!point || !point.xid) return $q.reject('no point');
                
                var url;
                if ($scope.firstLast === 'true') {
                	url = '/rest/v1/point-values/' + encodeURIComponent(point.xid) +
                    '/first-last';
                } else {
                	url = '/rest/v1/point-values/' + encodeURIComponent(point.xid) +
                    '/statistics';
                }
                var params = [];
                
                var now = new Date();
                var from = Util.toMoment($scope.from, now, $scope.dateFormat);
                var to = Util.toMoment($scope.to, now, $scope.dateFormat);
                
                var result = {
                	point: point
                };
                
                if (from.valueOf() === to.valueOf()) {
                	return {
                		promise: $q.when(result),
                		cancel: angular.noop
                	};
                }
                
                params.push('from=' + encodeURIComponent(from.toISOString()));
                params.push('to=' + encodeURIComponent(to.toISOString()));
                params.push('useRendered=true');
                
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
                	var data = response.data;
                	
                	if (data.startsAndRuntimes) {
                		for (i = 0; i < data.startsAndRuntimes.length; i++) {
                			var statsObj = data.startsAndRuntimes[i];
                			var valueRenderer = point.valueRenderer(statsObj.value);
                			if (!valueRenderer) continue;
                			statsObj.renderedValue = valueRenderer.text;
                			statsObj.renderedColor = valueRenderer.colour;
                		}
                	}
                	
                	result.stats = data;
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

pointValues.$inject = ['$http', 'Point', 'Util', '$q', 'mangoTimeout'];
return pointValues;

}); // define
