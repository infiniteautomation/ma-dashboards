/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

var stateParams = function($stateParams) {
    return {
        restrict: 'E',
        scope: {
            stateParams: '='
        },
        link: function($scope, $element) {
            $element[0].style.display = 'none';
            $scope.stateParams = $stateParams;
        }
    };
};

stateParams.$inject = ['$stateParams'];

return stateParams;

}); // define
