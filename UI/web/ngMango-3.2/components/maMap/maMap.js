/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */ 

define(['angular', 'require'], function(angular, require) {
    'use strict';
 /**
  * @ngdoc directive
  * @name ngMango.directive:maMap
  * @restrict E
  * @description
  * `<ma-map zoom="10" map-type="roadmap" center="-12.95, -38.45" desktop-height="950px" mobile-height="450px"></ma-map>`
  * - This component will display a Google Map that can be used within your custom dashboard pages.
  * - Note, you will need to set your Google Map Api Key on the <a ui-sref="ui.settings.uiSettings">Dashboard Settings</a> page.
  * - A Google Map Api Key can be aquired <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank">here</a>.
  * - `<ma-map>` utilizes the <a href="https://ngmap.github.io/#/!infowindow_ng_click.html" target="_blank">ng-map</a> library and therefore can use nested `<marker>` and `<info window>` components.
  * - <a ui-sref="ui.examples.utilities.googleMaps">View Demo</a>
  *
  * @param {number} zoom Sets the zoom level of the map.
  * @param {number} lat Sets the latitude coordinate of the center of the map. Eg. `-12.95`.
  * @param {number} long Sets the longitude coordinate of the center of the map. Eg. `38.42`.
  * @param {string=} map-type Sets the map type. Possible options are:
<ul>
    <li>`roadmap` displays the default road map view</li>
    <li>`satellite` displays Google Earth satellite images</li>
    <li>`hybrid` displays a mixture of normal and satellite views</li>
    <li>`terrain` displays a physical map based on terrain information</li>
</ul>
  * @param {string=} info-window-theme Can optionally be set to `dark` to use a dark theme on all `<info-window>` components. Defaults to a white background theme.
  * @param {string=} desktop-height Sets the height of the map at a desktop width (>1280px). Set with px. Eg `800px`. Defaults to `500px`.
  * @param {string=} mobile-height Sets the height of the map at a mobile/tablet width (<1280px). Set with px. Eg `400px`.
  * @param {object=} styles Optionally add a google map styles object to change colors and features of map details.
  * @param {string=} output-data Defines the name of a variable used to hold output data to be passed to other components on the page. From a marker you should the following syntax to set output-data: `on-click="$parent.$ctrl.setOutputData('newValue')"`.
  * @param {string=} map-id If you have multiple `<ma-map>` components on a single page give each a unique `map-id`.
  *
  * @usage
  * <ma-map zoom="11" map-type="roadmap" flex="100" output-data="pointXID" desktop-height="400px" mobile-height="250px">
        <marker centered="true" position="-12.95, -38.45" on-click="$parent.$ctrl.setOutputData('Demo 01-outsidetemp')"></marker>
        <marker position="-12.99, -38.49" on-click="$parent.$ctrl.setOutputData('Demo 01-amps')"></marker>
    </ma-map>
  *
  */
  
    MaMapController.$inject = ['$scope', '$mdMedia', 'NgMap', 'maUiSettings', '$injector'];
    function MaMapController($scope, $mdMedia, NgMap, uiSettings, $injector) {
        var $state;
        if ($injector.has('$state')) {
            $state = $injector.get('$state');
        }
        
        var $ctrl = this;
        $ctrl.render = false;
        $ctrl.apiKeySet = false;
        $ctrl.infoWindowCache = {};

        if (uiSettings.googleMapsApiKey) {
            $ctrl.apiKeySet = true;
            require(['https://maps.google.com/maps/api/js?key=' + uiSettings.googleMapsApiKey], function() {
                $scope.$applyAsync(function() {
                    $ctrl.render = true;
                });
            });
        }
        
        $ctrl.setOutputData = function(e, data) {
            $ctrl.outputData = data;
            // console.log('setData called', e, data);
        };

        $ctrl.goToRoute = function(e, state, params) {
            // console.log('goToRoute called', e, state, params);
            if ($state) {
                $state.go(state);
            }
        };

        $ctrl.toggleInfoWindow = function(e, windowId, markerId) {
            // console.log('toggle called',e, windowId, markerId);
            if (!$ctrl.infoWindowCache[windowId]) {
                $ctrl.map.showInfoWindow(windowId, markerId);
                $ctrl.infoWindowCache[windowId] = true;
            }
            else {
                $ctrl.map.hideInfoWindow(windowId);
                $ctrl.infoWindowCache[windowId] = false;
            }
        };

        $ctrl.onMapLoaded = function() {
            NgMap.getMap($ctrl.mapId).then(function(map) {
                $ctrl.map = map;

                google.maps.event.trigger($ctrl.map, 'resize');
                $ctrl.map.setCenter(new google.maps.LatLng($ctrl.lat, $ctrl.long));

                google.maps.event.addListener($ctrl.map, "idle", function() {
                    google.maps.event.trigger($ctrl.map, 'resize');
                    // $ctrl.map.setCenter(new google.maps.LatLng($ctrl.lat, $ctrl.long)); 
                });
            });
        };


        $ctrl.$onChanges = function(changes) {
            // console.log(changes);
            if (!$ctrl.desktopHeight) {
                $ctrl.height = "500px";
            }
            if (!$mdMedia('gt-md') && $ctrl.mobileHeight) {
                $ctrl.height = $ctrl.mobileHeight;
            }
        };

        $scope.$watch(function() { return $mdMedia('gt-md'); }, function(gtMd) {
            // console.log(gtMd);
            $ctrl.height = gtMd ? $ctrl.desktopHeight : $ctrl.mobileHeight;
        });
    }

    return {
        bindings: {
            zoom: '<',
            lat: '<',
            long: '<',
            mapType: '@',
            styles: '<',
            infoWindowTheme: '@',
            desktopHeight: '@',
            mobileHeight: '@',
            outputData: '=',
            mapId: '@'
        },
        controller: MaMapController,
        templateUrl: require.toUrl('./maMap.html'),
        transclude: true
    };
}); // define
