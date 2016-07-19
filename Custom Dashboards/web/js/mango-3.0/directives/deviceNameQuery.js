/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function deviceNameQuery(DeviceName) {
    return {
        scope: {
            // attributes that start with data- have the prefix stripped
            dataSourceId: '=?sourceId',
            dataSourceXid: '=?sourceXid',
            contains: '=?',
            deviceNames: '=?'
        },
        link: function ($scope, $element, attrs) {
            $scope.$watchGroup(['dataSourceId', 'dataSourceXid', 'contains'], function(value) {
                var queryResult;
                if (!($element.attr('data-source-id') || $element.attr('data-source-xid') )) {
                    queryResult = DeviceName.query({contains: $scope.contains});
                } else if (!angular.isUndefined($scope.dataSourceId)) {
                    queryResult = DeviceName.byDataSourceId({id: $scope.dataSourceId, contains: $scope.contains});
                } else if (!angular.isUndefined($scope.dataSourceXid)) {
                    queryResult = DeviceName.byDataSourceXid({xid: $scope.dataSourceXid, contains: $scope.contains});
                } else {
                    return;
                }
                
                $scope.deviceNames = queryResult;
            });
        }
    };
}

deviceNameQuery.$inject = ['DeviceName'];
return deviceNameQuery;

}); // define
