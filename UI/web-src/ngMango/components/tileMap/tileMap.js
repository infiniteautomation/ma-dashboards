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
 * @param {string=} mapbox-access-token Access token for the Mapbox API, if not supplied only OpenStreetMap will be available. Can also
 * be specified on the UI settings page.
 * @param {object=} options Options for the Leaflet map instance,
 * see <a href="https://leafletjs.com/reference-1.5.0.html#map-option" target="_blank">documentation</a>
 */

class TileMapController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude', '$injector']; }
    
    constructor($scope, $element, $transclude, $injector) {
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
            return import(/* webpackMode: "lazy", webpackChunkName: "leaflet" */ 'leaflet');
        }).then(leaflet => {
            this.leaflet = leaflet;
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
        
        if ((changes.center || changes.zoom) && this.center && this.zoom != null) {
            this.map.setView(this.parseLatLong(this.center), this.zoom);
        }
    }
    
    parseLatLong(coordinates) {
        if (typeof coordinates === 'string') {
            return coordinates.split(',').map(str => {
                try {
                    return Number.parseFloat(str, 10);
                } catch (e) {
                    return null;
                }
            }).filter(v => v != null);
        }
        return coordinates;
    }
    
    renderMap() {
        const L = this.leaflet;
        const options = this.options && this.options({$leaflet: L});
        const map = this.map = L.map(this.$element[0], options).setView(this.parseLatLong(this.center), this.zoom);

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
        options: '&?'
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
            height: '400px'
        }
    }
};