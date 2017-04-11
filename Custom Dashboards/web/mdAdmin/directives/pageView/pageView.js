/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

var pageView = function(Page, jsonStoreEventManager, User, $rootScope) {
    var SUBSCRIPTION_TYPES = ['add', 'update'];

    return {
        scope: {
            xid: '@'
        },
        templateUrl: require.toUrl('./pageView.html'),
        link: function($scope, $element) {
            $scope.user = $rootScope.user;
            
            Page.loadPage($scope.xid).then(function(page) {
                $scope.page = page;
                $scope.markup = page.jsonData.markup;
            });

            jsonStoreEventManager.smartSubscribe($scope, $scope.xid, SUBSCRIPTION_TYPES, function updateHandler(event, payload) {
                $scope.markup = payload.object.jsonData.markup;
            });
        }
    };
};

pageView.$inject = ['Page', 'jsonStoreEventManager', 'User', '$rootScope'];

return pageView;

}); // define
