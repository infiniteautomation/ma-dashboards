/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

function jsonStore(JsonStore, jsonStoreEventManager, $q) {
	var SUBSCRIPTION_TYPES = ['update'];
	
    return {
        scope: {
        	xid: '@',
            item: '=?',
            value: '=?'
        },
        link: function ($scope, $element, attr) {
            $scope.$watch('xid', function(newXid, oldXid) {
            	if (!newXid) return;
            	
            	JsonStore.get({xid: newXid}).$promise.then(function(item) {
            		return item;
            	}, function() {
            		var item = new JsonStore();
            		item.xid = newXid;
            		item.name = newXid;
            		item.jsonData = $scope.value || {};
            		return $q.when(item);
            	}).then(function(item) {
            		$scope.item = item;
            	});

                jsonStoreEventManager.subscribe(newXid, SUBSCRIPTION_TYPES, websocketHandler);
                if (oldXid && oldXid !== newXid) {
                	jsonStoreEventManager.unsubscribe(oldXid, SUBSCRIPTION_TYPES, websocketHandler);
                }
            });
            
            $scope.$watch('item.jsonData', function(newData) {
            	if (newData) {
            		$scope.value = newData;
            	}
            });
            
            $scope.$on('$destroy', function() {
                if ($scope.item) {
                	jsonStoreEventManager.unsubscribe($scope.item.xid, SUBSCRIPTION_TYPES, websocketHandler);
                }
            });
            
            function websocketHandler(event, payload) {
                $scope.$apply(function() {
                	if (!angular.equals(payload.object, $scope.item)) {
                		angular.copy(payload.object, $scope.item);
                	}
                });
            }
        }
    };
}

jsonStore.$inject = ['JsonStore', 'jsonStoreEventManager', '$q'];
return jsonStore;

}); // define
