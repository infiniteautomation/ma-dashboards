/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */ 

define(['angular', 'require'], function(angular, require) {
    'use strict';

  
    dashboardStoreController.$inject = ['$scope', '$timeout'];

    function dashboardStoreController($scope, $timeout) {
        var $ctrl = this;

        $ctrl.deleteDashboard = function() {
            $ctrl.dashboardList.dashboards = $ctrl.dashboardList.dashboards.filter(function(dashboard) {
                return dashboard.name !== $ctrl.selectedDashboard.name;
            });

            $ctrl.selectedDashboard = $ctrl.dashboardList.dashboards[0];
        };

        $ctrl.addDashboard = function() {
            $ctrl.dashboardList.dashboards.push({});
            $ctrl.selectedDashboard = $ctrl.dashboardList.dashboards[$ctrl.dashboardList.dashboards.length-1];

            $timeout(function() {
                angular.element(document.querySelector('#dashboard-name-input')).focus();
            }, 500);
        };

        $scope.$watch('$ctrl.dashboardList.dashboards', function(newValue, oldValue) {
            // console.log('watch dashboardList.dashboards', newValue, oldValue);
            if (newValue.length && !oldValue.length) {
                $ctrl.selectedDashboard = $ctrl.dashboardList.dashboards[0];
            }
        });
    }

    return {
        bindings: {
            selectedDashboard: '=?'
        },
        controller: dashboardStoreController,
        templateUrl: require.toUrl('./dashboardStore.html')
    };
}); // define
