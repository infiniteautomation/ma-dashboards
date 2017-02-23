/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */ 

define(['angular', 'require'], function(angular, require) {
    'use strict';

  
    mapSiteStoreController.$inject = ['$scope', '$timeout', 'Util'];

    function mapSiteStoreController($scope, $timeout, Util) {
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

        var index = 0;

        $ctrl.$onInit = function() {
            $ctrl.localDashboardList = {list: []};
            $ctrl.dashboardList = {list: []};
        };

        $ctrl.deleteDashboard = function() {
            $ctrl.dashboardList.list = $ctrl.dashboardList.list.filter(function(dashboard) {
                return dashboard.uid !== $ctrl.selectedDashboard.uid;
            });

            $ctrl.localDashboardList.list = $ctrl.localDashboardList.list.filter(function(dashboard) {
                return dashboard.uid !== $ctrl.selectedDashboard.uid;
            });

            $ctrl.selectedDashboard = $ctrl.localDashboardList.list[0];
            index = 0;
            
            $ctrl.dashboardStoreItem.$save();
        };

        $ctrl.addDashboard = function() {
            $ctrl.localDashboardList.list.push({watchLists: []});
            index = $ctrl.localDashboardList.list.length-1;

            $ctrl.selectedDashboard = $ctrl.localDashboardList.list[index];
            $ctrl.selectedDashboard.uid = 'Markers-' + Util.uuid();

            $timeout(function() {
                angular.element(document.querySelector('#dashboard-name-input')).focus();
            }, 500);
        };

        $ctrl.dashboardChanged = function() {
            index = $ctrl.localDashboardList.list.indexOf($ctrl.selectedDashboard);
            delete $ctrl.selectedDashboard.markerIcon;

            $timeout(function() {
                $ctrl.selectedDashboard.markerIcon = $ctrl.selectedDashboard.myMarkerIcon;
            }, 500);
        };

        $ctrl.markerNameChanged = function() {
            delete $ctrl.selectedDashboard.markerIcon;

            $timeout(function() {
                $ctrl.selectedDashboard.markerIcon = $ctrl.selectedDashboard.myMarkerIcon;
            }, 500);
        };

        $ctrl.markerChanged = function() {
            $ctrl.selectedDashboard.markerIcon = $ctrl.selectedDashboard.myMarkerIcon;
        };

        $ctrl.save = function() {
            if ($ctrl.addWatchList1 && $ctrl.addWatchList1.xid) {
                $ctrl.selectedDashboard.watchLists[0] = $ctrl.addWatchList1.xid;
                $ctrl.selectedDashboard.xid = $ctrl.addWatchList1.xid; 
                $ctrl.selectedDashboard.watchlistName = $ctrl.addWatchList1.name;
            }
            if ($ctrl.addWatchList2 && $ctrl.addWatchList2.xid) {
                $ctrl.selectedDashboard.watchLists[1] = $ctrl.addWatchList2.xid;
            }
            if ($ctrl.addWatchList3 && $ctrl.addWatchList3.xid) {
                $ctrl.selectedDashboard.watchLists[2] = $ctrl.addWatchList3.xid;
            }
            
            $ctrl.selectedDashboard.markerIcon = $ctrl.selectedDashboard.myMarkerIcon;

            if ($ctrl.markersBinaryPoint) {
                $ctrl.selectedDashboard.markersBinaryPoint = $ctrl.markersBinaryPoint.xid;
            }

            $ctrl.dashboardList.list[index] = angular.copy($ctrl.selectedDashboard);
            $ctrl.dashboardStoreItem.$save();
        };
        
        $scope.$watch('$ctrl.dashboardList.list', function(newValue, oldValue) {
            if (newValue === undefined || oldValue === undefined) return;
            // console.log('watch dashboardList.list', newValue, oldValue);
            if (newValue.length && !oldValue.length) {
                $ctrl.localDashboardList.list = angular.copy($ctrl.dashboardList.list);
                $ctrl.selectedDashboard = $ctrl.localDashboardList.list[0];
            }
        });
    }

    return {
        bindings: {
            selectedDashboard: '=',
            selectOnlyMode: '=?',
            binaryMarkerMode: '=?',
            numWatchLists: '@'
        },
        controller: mapSiteStoreController,
        templateUrl: require.toUrl('./mapSiteStore.html')
    };
}); // define
