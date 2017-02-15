/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maJsonStore
 * @restrict E
 * @description
 * `<ma-json-store xid="phoneData" item="myItem" value="myValue"></ma-json-store>`
 * - You can use this directive to store arbitrary data in Mango's JSON store.
 * - Updates to the JSON store will sync realtime over websockets with your dashboard, no refresh needed.
 * - You can set a unique `xid` and `item` to store multiple objects in the JSON store.
 * - Any data you want to store should be added to the `value` object and can be retrieved using <code ng-non-bindable>{{myItem.jsonData.myProperty}}</code>.
* - Note that if you do not set `myItem.editPermission` / `myItem.readPermission` permission of the item, only the Admin will have access to it.
You can set these permissions to 'user' to allow other users to read or edit data in the JSON store. 
The 'user' permissions group is added to created Mango users by default.
 * - <a ui-sref="dashboard.examples.utilities.jsonStore">View Demo</a>
 *
 * @param {string} xid Sets the `xid` used for each unique object in the JSON store.
 * @param {object} item Object used when accessing the stored data. You can also call the following methods:
<ul>
    <li>`myItem.$save()` - Saves the data from myItem in the model to the JSON store.</li>
    <li>`myItem.$delete()` - Deletes the jsonData stored at the given `xid`</li>
    <li>`myItem.$get()` - Reverts the data from myItem that has been modified in the local model to the the values from the JSON store.</li>
</ul>
 * @param {object} value Name of the object used in the model to hold the data to be stored.
 * @param {expression} item-loaded Expression called when item is loaded, $item variable is available for use inside the expression
 *
 * @usage
<ma-json-store xid="phoneData" item="myItem" value="myValue"></ma-json-store>
<input ng-model="myValue.phone">
<md-button class="md-raised md-primary md-hue-3" ng-click="myItem.$save()">
    <md-icon>save</md-icon> Save
</md-button>
<p>Phone # from JSON store: {{myItem.jsonData.phone}}</p>
 *
 */
function jsonStore(JsonStore, jsonStoreEventManager, $q) {
	var SUBSCRIPTION_TYPES = ['update'];

    return {
        scope: {
        	xid: '@',
            item: '=?',
            value: '=?',
            itemLoaded: '&'
        },
        link: function ($scope, $element, attr) {
            $scope.$watch('xid', function(newXid, oldXid) {
            	if (!newXid) return;
                console.log(newXid);
            	JsonStore.get({xid: newXid}).$promise.then(function(item) {
            		return item;
            	}, function() {
            		var item = new JsonStore();
            		item.xid = newXid;
            		item.name = newXid;
            		item.jsonData = $scope.value || {};
            		angular.extend(item, $scope.item);
            		return $q.when(item);
            	}).then(function(item) {
            	    $scope.itemLoaded({'$item': item});
            		return $scope.item = item;
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
                $scope.$applyAsync(function() {
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
