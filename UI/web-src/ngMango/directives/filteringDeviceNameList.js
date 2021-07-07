/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import filteringDeviceNameListTemplate from './filteringDeviceNameList.html';
import './filteringDeviceNameList.css';

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
            labelText: '<',
            allowClear: '<?',
            disabled: '<?ngDisabled',
            required: '<?ngRequired'
        },
        template: filteringDeviceNameListTemplate,
        replace: false,
        link: function($scope, $element, $attrs, ngModelCtrl) {
            $scope.list = {};
            $scope.ngModelCtrl = ngModelCtrl;

            if (!$scope.hasOwnProperty('allowClear')) {
                $scope.allowClear = true;
            }

            ngModelCtrl.$render = () => {
                $scope.list.selected = ngModelCtrl.$viewValue;
            };
            
            $scope.onChange = function() {
                ngModelCtrl.$setViewValue($scope.list.selected);
            };
            
            $scope.queryDeviceNames = function(filter) {
                let queryResult;
                if ($scope.dataSourceId !== undefined) {
                    queryResult = DeviceName.byDataSourceId({id: $scope.dataSourceId, contains: filter});
                } else if ($scope.dataSourceXid !== undefined) {
                    queryResult = DeviceName.byDataSourceXid({xid: $scope.dataSourceXid, contains: filter});
                } else {
                    queryResult = DeviceName.query({contains: filter});
                }

                return queryResult.$promise.then(function(deviceNames) {
                    if (!$scope.list.selected && $scope.autoInit && !$scope.autoInitDone && deviceNames.length) {
                        $scope.selected = deviceNames[0];
                        $scope.autoInitDone = true;
                    }
                    return deviceNames;
                });
            };
            
            if ($scope.autoInit && !$scope.list.selected) {
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


