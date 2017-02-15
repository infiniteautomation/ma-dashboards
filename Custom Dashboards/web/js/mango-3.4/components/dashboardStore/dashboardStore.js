/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */ 

define(['angular', 'require'], function(angular, require) {
    'use strict';

  
    dashboardStoreController.$inject = ['$scope', '$timeout'];

    function dashboardStoreController($scope, $timeout) {
        var $ctrl = this;

        $ctrl.markerIcons = [
            {
                name: 'Red Dot',
                image: 'img/map-markers/red-dot.png'
            },
            {
                name: 'Red Small',
                image: 'img/map-markers/mm_20_red.png'
            },
            {
                name: 'Blue Dot',
                image: 'img/map-markers/blue-dot.png'
            },
            {
                name: 'Blue Small',
                image: 'img/map-markers/mm_20_blue.png'
            },
            {
                name: 'Green Dot',
                image: 'img/map-markers/green-dot.png'
            },
            {
                name: 'Green Small',
                image: 'img/map-markers/mm_20_green.png'
            },
            {
                name: 'Yellow Dot',
                image: 'img/map-markers/yellow-dot.png'
            },
            {
                name: 'Yellow Small',
                image: 'img/map-markers/mm_20_yellow.png'
            },
            {
                name: 'Purple Dot',
                image: 'img/map-markers/purple-dot.png'
            },
            {
                name: 'Purple Small',
                image: 'img/map-markers/mm_20_purple.png'
            },
            {
                name: 'Orange Dot',
                image: 'img/map-markers/orange-dot.png'
            },
            {
                name: 'Orange Small',
                image: 'img/map-markers/mm_20_orange.png'
            },
            {
                name: 'Brown Small',
                image: 'img/map-markers/mm_20_brown.png'
            },
            {
                name: 'Gray Small',
                image: 'img/map-markers/mm_20_gray.png'
            },
            {
                name: 'White Small',
                image: 'img/map-markers/mm_20_white.png'
            }
        ];

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
