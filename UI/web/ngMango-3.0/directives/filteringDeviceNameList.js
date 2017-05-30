/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

filteringDeviceNameList.$inject = ['$injector', '$timeout', 'DeviceName'];
function filteringDeviceNameList($injector, $timeout, DeviceName) {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            ngChange: '&?',
            // attributes that start with data- have the prefix stripped
            dataSourceId: '<?sourceId',
            dataSourceXid: '<?sourceXid',
            autoInit: '<?',
            labelText: '<'
        },
        templateUrl: require.toUrl('./filteringDeviceNameList.html'),
        replace: false,
        link: function($scope, $element, $attrs) {
            $scope.onChange = function() {
                $timeout($scope.ngChange, 0);
            };
            
            $scope.queryDeviceNames = function() {
                var queryResult;
                if (!angular.isUndefined($scope.dataSourceId)) {
                    queryResult = DeviceName.byDataSourceId({id: $scope.dataSourceId, contains: $scope.searchText});
                } else if (!angular.isUndefined($scope.dataSourceXid)) {
                    queryResult = DeviceName.byDataSourceXid({xid: $scope.dataSourceXid, contains: $scope.searchText});
                } else {
                    queryResult = DeviceName.query({contains: $scope.searchText});
                }

                return queryResult.$promise.then(function(deviceNames) {
                    if (!$scope.ngModel && $scope.autoInit && deviceNames.length) {
                        $scope.ngModel = deviceNames[0];
                    }
                    return deviceNames;
                });
            };
            
            $scope.queryDeviceNames();
        }
    };
}
return filteringDeviceNameList;

}); // define
