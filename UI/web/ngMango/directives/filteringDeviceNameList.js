/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import filteringDeviceNameListTemplate from './filteringDeviceNameList.html';

filteringDeviceNameList.$inject = ['$injector', 'maDeviceName'];
function filteringDeviceNameList($injector, DeviceName) {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            // attributes that start with data- have the prefix stripped
            dataSourceId: '<?sourceId',
            dataSourceXid: '<?sourceXid',
            autoInit: '<?',
            labelText: '<'
        },
        template: filteringDeviceNameListTemplate,
        replace: false,
        link: function($scope, $element, $attrs, ngModelCtrl) {
            ngModelCtrl.render = () => {
                $scope.selected = ngModelCtrl.$viewValue;
            };
            
            $scope.onChange = function() {
                ngModelCtrl.$setViewValue($scope.selected);
            };
            
            $scope.queryDeviceNames = function() {
                var queryResult;
                if ($scope.dataSourceId !== undefined) {
                    queryResult = DeviceName.byDataSourceId({id: $scope.dataSourceId, contains: $scope.searchText});
                } else if ($scope.dataSourceXid !== undefined) {
                    queryResult = DeviceName.byDataSourceXid({xid: $scope.dataSourceXid, contains: $scope.searchText});
                } else {
                    queryResult = DeviceName.query({contains: $scope.searchText});
                }

                return queryResult.$promise.then(function(deviceNames) {
                    if (!$scope.selected && $scope.autoInit && !$scope.autoInitDone && deviceNames.length) {
                        $scope.selected = deviceNames[0];
                        $scope.autoInitDone = true;
                    }
                    return deviceNames;
                });
            };
            
            if ($scope.autoInit && !$scope.selected) {
                $scope.queryDeviceNames();
            }
        },
        designerInfo: {
            translation: 'ui.components.filteringDeviceNameList',
            icon: 'filter_list'
        }
    };
}
export default filteringDeviceNameList;


