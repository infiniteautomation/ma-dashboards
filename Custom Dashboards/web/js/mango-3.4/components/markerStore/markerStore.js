/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
    'use strict';


    markerStoreController.$inject = ['$scope', '$timeout', 'Util'];

    function markerStoreController($scope, $timeout, Util) {
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
            $ctrl.localMarkerList = {markers: []};
            $ctrl.markerList = {markers: []};
        };

        $ctrl.deleteMarker = function() {
            $ctrl.markerList.markers = $ctrl.markerList.markers.filter(function(marker) {
                return marker.uid !== $ctrl.selectedMarker.uid;
            });

            $ctrl.localMarkerList.markers = $ctrl.localMarkerList.markers.filter(function(marker) {
                return marker.uid !== $ctrl.selectedMarker.uid;
            });

            $ctrl.selectedMarker = $ctrl.localMarkerList.markers[0];
            index = 0;

            $ctrl.markerStoreItem.$save();
        };

        $ctrl.addMarker = function() {
            $ctrl.localMarkerList.markers.push({});
            index = $ctrl.localMarkerList.markers.length-1;

            $ctrl.selectedMarker = $ctrl.localMarkerList.markers[index];
            $ctrl.selectedMarker.uid = 'Marker-' + Util.uuid();

            $timeout(function() {
                angular.element(document.querySelector('#marker-name-input')).focus();
            }, 500);
        };

        $ctrl.markerChanged = function() {
            index = $ctrl.localMarkerList.markers.indexOf($ctrl.selectedMarker);
        };

        $ctrl.save = function() {
            $ctrl.selectedMarker.xid = $ctrl.addWatchList.xid;
            $ctrl.selectedMarker.watchlistName = $ctrl.addWatchList.name;

            if ($ctrl.markersBinaryPoint) {
                $ctrl.selectedMarker.markersBinaryPoint = $ctrl.markersBinaryPoint.xid;
            }

            $ctrl.markerList.markers[index] = angular.copy($ctrl.selectedMarker);

            $ctrl.markerStoreItem.readPermission = 'user';
            $ctrl.markerStoreItem.$save();
        };

        $scope.$watch('$ctrl.markerList.markers', function(newValue, oldValue) {
            if (!newValue.length || newValue === undefined || oldValue === undefined) return;
            // console.log('watch markerList.markers', newValue, oldValue);

            $ctrl.localMarkerList = angular.copy($ctrl.markerList);

            if (newValue.length && !oldValue.length) {
                $ctrl.selectedMarker = $ctrl.localMarkerList.markers[0];
            }
        });

        $scope.$watch('$ctrl.dashboardId', function(newValue, oldValue) {
            if (newValue === undefined || newValue === oldValue) return;
            // console.log('DashboardId changed', newValue, oldValue);
            delete $ctrl.markerStoreItem;

            $ctrl.markerList.markers=[];
            $ctrl.localMarkerList.markers=[];
            $ctrl.selectedMarker = {};


        });
    }

    return {
        bindings: {
            dashboardId: '@',
            binaryMarkerMode: '=?',
            markerList: '=?'
        },
        controller: markerStoreController,
        templateUrl: require.toUrl('./markerStore.html')
    };
}); // define
