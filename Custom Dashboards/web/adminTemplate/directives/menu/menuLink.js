/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

var menuLink = function($state) {
    return {
        scope: {
            page: '='
        },
        templateUrl: require.toUrl('./menuLink.html'),
        link: function($scope, $element) {
            $scope.followLink = function() {
                $state.go(this.page.state);
            }
        }
    };
};

menuLink.$inject = ['$state'];

return menuLink;

}); // define
