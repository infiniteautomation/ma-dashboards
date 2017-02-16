/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */ 

define(['angular', 'require'], function(angular, require) {
    'use strict';

  
    mapSiteStoreController.$inject = ['$scope', '$timeout'];

    function mapSiteStoreController($scope, $timeout) {
        var $ctrl = this;
        var index;

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

            $ctrl.selectedDashboard = angular.copy($ctrl.dashboardList.dashboards[0]);
            $ctrl.storedDashboard = angular.copy($ctrl.dashboardList.dashboards[0]);
            index = 0;

            $ctrl.dashboardStoreItem.$save();
        };

        $ctrl.addDashboard = function() {
            $ctrl.dashboardList.dashboards.push({watchLists: []});
            index = $ctrl.dashboardList.dashboards.length - 1;
            console.log(index)
            
            $ctrl.selectedDashboard = angular.copy($ctrl.dashboardList.dashboards[index]);
            $ctrl.storedDashboard = angular.copy($ctrl.dashboardList.dashboards[index]);

            $timeout(function() {
                angular.element(document.querySelector('#dashboard-name-input')).focus();
            }, 500);
        };

         $ctrl.changedDashboard = function() {
            index = $ctrl.dashboardList.dashboards.indexOf($ctrl.storedDashboard);
            $ctrl.selectedDashboard = angular.copy($ctrl.dashboardList.dashboards[index]);
        };
        
        $ctrl.saveSite = function() {
            $ctrl.selectedDashboard.watchLists[0] = $ctrl.addWatchList[0].xid; 
            $ctrl.selectedDashboard.watchLists[1] = $ctrl.addWatchList[1].xid; 
            $ctrl.selectedDashboard.watchLists[2] = $ctrl.addWatchList[2].xid; 
            $ctrl.selectedDashboard.xid = $ctrl.addWatchList[0].xid; 
            $ctrl.selectedDashboard.watchlistName = $ctrl.addWatchList[0].name;

            $ctrl.storedDashboard = angular.copy($ctrl.dashboardList.dashboards[0]);
            $ctrl.dashboardList.dashboards[index] = angular.copy($ctrl.selectedDashboard);
            $ctrl.dashboardStoreItem.$save();
        };
        
        $scope.$watch('$ctrl.dashboardList.dashboards', function(newValue, oldValue) {
            if (newValue === undefined || oldValue === undefined) return;
            // console.log('watch dashboardList.dashboards', newValue, oldValue);
            if (newValue.length && !oldValue.length) {
                $ctrl.selectedDashboard = angular.copy($ctrl.dashboardList.dashboards[0]);
                $ctrl.storedDashboard = angular.copy($ctrl.dashboardList.dashboards[0]);
                index = 0;
            }
        });
    }

    return {
        bindings: {
            selectedDashboard: '=?',
            selectOnlyMode: '@'
        },
        controller: mapSiteStoreController,
        templateUrl: require.toUrl('./mapSiteStore.html')
    };
}); // define
