/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maTileMap
 * @restrict 'E'
 * @scope
 *
 * @description Displays a tile map provided by <a href="https://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> or
 * <a href="https://www.mapbox.com/" target="_blank">Mapbox</a> using <a href="https://leafletjs.com/" target="_blank">Leaflet</a>.
 * Include <a ui-sref="ui.docs.ngMango.maTileMapMarker">maTileMapMarkers</a> inside the content to add markers to the map.
 * 
 * @param {number[]|string} center Coordinates (latitude/longitude) of the center of the map
 * @param {number=} [zoom=13] Zoom level (0-18)
 * @param {string[]|object[]=} tile-layers Array of tile layers. Defaults to <code>['mapbox.streets', 'mapbox.satellite']</code>
 * if a Mapbox access token is available, or <code>['openstreetmap']</code> if not.
 * Can be an array of ids such as <code>mapbox.satellite</code>, objects containing <code>id</code> and <code>url</code> properties
 * along with any other Leaflet <code>L.tileLayer</code> options, or full Leaflet <code>L.tileLayer</code> instances.
 * The <code>name</code> option is used to set the name of the layer in the controls.
 * Available locals are <code>$leaflet</code> and <code>$map</code>.
 * @param {expression=} on-move Expression is evaluated when the map has finished moving/zooming (only once, when panning/zooming has stopped).
 * Available locals are <code>$leaflet</code>, <code>$map</code>, <code>$event</code>, <code>$center</code>, and <code>$zoom</code>.
 * @param {string=} mapbox-access-token Access token for the Mapbox API, if not supplied only OpenStreetMap will be available. Can also
 * be specified on the UI settings page.
 * @param {object=} options Options for the Leaflet map instance,
 * see <a href="https://leafletjs.com/reference-1.5.0.html#map-option" target="_blank">documentation</a>
 */

class TileMapController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude', '$injector']; }
    
    constructor($scope, $element, $transclude, $injector) {
        this.$scope = $scope;
        this.$element = $element;
        this.$transclude = $transclude;
        
        if ($injector.has('maUiSettings')) {
            this.uiSettings = $injector.get('maUiSettings');
        }
        
        this.center = [0, 0];
        this.zoom = 13;
        
        this.loadLeaflet();
    }
    
    loadLeaflet() {
        this.leafletPromise = import(/* webpackMode: "lazy", webpackChunkName: "leaflet" */ 'leaflet/dist/leaflet.css').then(() => {
            const leaflet = import(/* webpackMode: "lazy", webpackChunkName: "leaflet" */ 'leaflet');
            const marker = import(/* webpackMode: "lazy", webpackChunkName: "leaflet" */ 'leaflet/dist/images/marker-icon.png');
            const marker2x = import(/* webpackMode: "lazy", webpackChunkName: "leaflet" */ 'leaflet/dist/images/marker-icon-2x.png');
            const markerShadow = import(/* webpackMode: "lazy", webpackChunkName: "leaflet" */ 'leaflet/dist/images/marker-shadow.png');
            return Promise.all([leaflet, marker, marker2x, markerShadow]);
        }).then(([leaflet, marker, marker2x, markerShadow]) => {
            this.leaflet = leaflet;

            // workaround https://github.com/Leaflet/Leaflet/issues/4849
            delete this.leaflet.Icon.Default.prototype._getIconUrl;

            this.leaflet.Icon.Default.mergeOptions({
                //imagePath: '/modules/mangoUI/web/img/',
                iconRetinaUrl: marker2x.default,
                iconUrl: marker.default,
                shadowUrl: markerShadow.default
            });
            
            this.renderMap();
        });
    }
    
    $onDestroy() {
        this.leafletPromise.finally(() => {
            if (this.map) {
                this.map.remove();
            }
        });
    }
    
    $onChanges(changes) {
        if (!this.map) return;

        if (changes.center || changes.zoom) {
            const center = this.parseLatLong(this.center) || this.map.getCenter();
            const zoom = this.zoom != null ? this.zoom : this.map.getZoom();

            this.map.setView(center, zoom);
        }
        
        if (changes.showLocation) {
            if (this.showLocation) {
                this.locate();
            } else if (this.locationCircle) {
                this.locationCircle.remove();
                delete this.locationCircle;
            }
        }
    }

    parseLatLong(coordinates) {
        try {
            if (typeof coordinates === 'string') {
                coordinates = coordinates.split(',').map(str => {
                    try {
                        return Number.parseFloat(str, 10);
                    } catch (e) {
                        return null;
                    }
                }).filter(v => v != null);
            }
            return this.leaflet.latLng(coordinates);
        } catch (e) {
            return null;
        }
    }
    
    renderMap() {
        const L = this.leaflet;
        const options = this.options && this.options({$leaflet: L});
        const map = this.map = L.map(this.$element[0], options);

        this.map.on('moveend', event => {
            // calls to setView() in $onChanges cause this event to fire, resulting in a $rootScope:inprog error
            // dont want these events anyway
            if (this.$scope.$root.$$phase != null) return;

            // worth noting that there is some sort of rounding / math going on with the coordinates
            // e.g. if you call setView() with latitude 40.05 it fires the moveend event telling us we have moved to 40.0499567754414
            // if you then use feed this back through to the center attribute you can get multiple moveend events fired
            
            const currentCenter = this.map.getCenter();
            const currentZoom = this.map.getZoom();
            const center = this.parseLatLong(this.center) || currentCenter;
            const zoom = this.zoom != null ? this.zoom : currentZoom;
            if (!center.equals(currentCenter) || zoom !== currentZoom) {
                const locals = {$leaflet: L, $map: this.map, $event: event, $center: currentCenter, $zoom: currentZoom};
                this.$scope.$apply(() => {
                    if (event.type === 'moveend' && this.onMove) {
                        this.onMove(locals);
                    }
                });
            }
        });
        
        map.on('locationfound', event => {
            if (!this.locationCircle) {
                this.locationCircle = L.circle(event.latlng, event.accuracy);
                this.locationCircle.addTo(map);
            } else {
                this.locationCircle.setLatLng(event.latlng);
                this.locationCircle.setRadius(event.accuracy);
            }
        });

        const center = this.parseLatLong(this.center);
        if (center) {
            map.setView(this.parseLatLong(this.center), this.zoom);
        }
        if (this.showLocation) {
            this.locate();
        }

        if (this.$element.hasClass('ma-designer-element')) {
            this.map._handlers.forEach(h => h.disable());
        }

        let tileLayers;
        if (typeof this.tileLayers === 'function') {
            tileLayers = this.tileLayers({$leaflet: L, $map: this.map}) || [];
        } else if (this.mapboxAccessToken || this.uiSettings && this.uiSettings.mapboxAccessToken) {
            tileLayers = ['mapbox.streets', 'mapbox.satellite'];
        } else {
            tileLayers = ['openstreetmap'];
        }
        
        tileLayers = tileLayers.map(layer => {
            if (layer instanceof L.TileLayer) {
                return layer;
            }
            return this.createTileLayer(layer);
        });

        if (tileLayers.length) {
            tileLayers[0].addTo(map);
        }
        
        if (tileLayers.length > 1) {
            const layerMap = tileLayers.reduce((map, layer) => (map[layer.options.name] = layer, map), {});
            L.control.layers(layerMap).addTo(map);
        }

        this.$transclude(($clone, $scope) => {
            $scope.$map = this.map;
            $scope.$mapCtrl = this;
            $scope.$leaflet = this.leaflet;
            
            this.transcludedContent = $clone;
        });
    }
    
    locate(options = this.showLocation) {
        if (typeof options !== 'object') {
            options = {setView: true, maxZoom: 16};
        }
        this.map.locate(options);
    }

    createTileLayer(options) {
        if (typeof options === 'string') {
            options = {id: options};
        }

        if (options.id && options.id.startsWith('mapbox.')) {
            let name = options.id.slice('mapbox.'.length).split(/[-.]/).join(' ');
            name = name.charAt(0).toUpperCase() + name.slice(1);
            
            options = Object.assign({
                url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
                attribution: `Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors,
                    <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>`,
                name,
                accessToken: this.mapboxAccessToken || this.uiSettings && this.uiSettings.mapboxAccessToken || ''
            }, options);
        } else {
            options = Object.assign({
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                name: 'OpenStreetMap'
            }, options);
        }

        return this.leaflet.tileLayer(options.url, options);
    }
}

export default {
    controller: TileMapController,
    bindings: {
        center: '<?',
        zoom: '<?zoom',
        tileLayers: '&?',
        mapboxAccessToken: '@?',
        options: '&?',
        onMove: '&?',
        showLocation: '<?'
    },
    transclude: true,
    designerInfo: {
        translation: 'ui.components.maTileMap',
        icon: 'map',
        category: 'basic',
        attributes: {
        },
        size: {
            width: '600px',
            height: '400px',
            zIndex: 1
        }
    }
};