/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maTileMapLayer
 * @restrict 'E'
 * @scope
 *
 * @description Adds a overlay layer to a <a ui-sref="ui.docs.ngMango.maTileMap">maTileMap</a> or another maTileMapLayer.
 * Any components which can be added to a maTileMap can be added to a maTileMapLayer.
 * 
 * @param {string} name Name of the layer, used as the label in the layer controls
 * @param {boolean=} [enabled=true] Adds or removes the layer from the map/parent layer
 * @param {object=} options Options for the Leaflet layer instance,
 * see <a href="https://leafletjs.com/reference-1.5.0.html#layer-option" target="_blank">documentation</a>
 */

class TileMapLayerController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude']; }
    
    constructor($scope, $element, $transclude) {
        this.$scope = $scope;
        this.$element = $element;
        this.$transclude = $transclude;
        
        this.enabled = true;
    }
    
    $onChanges(changes) {
        if (!this.layer) return;
        
        if (changes.enabled) {
            if (this.enabled) {
                this.layer.addTo(this.parentLayer || this.map);
            } else {
                this.layer.remove();
            }
        }
    }

    $onInit() {
        this.map = this.mapCtrl.map;
        if (this.layerCtrl) {
            this.parentLayer = this.layerCtrl.layer;
        }
        this.leaflet = this.mapCtrl.leaflet;

        this.$transclude(($clone, $scope) => {
            this.$element.append($clone);

            this.layer = this.leaflet.layerGroup([], this.options);
            if (!this.parentLayer) {
                this.mapCtrl.addLayer(this.layer, this.name);
            }
            
            if (this.enabled) {
                this.layer.addTo(this.parentLayer || this.map);
            }
        });
    }
    
    $onDestroy() {
        if (!this.parentLayer) {
            this.mapCtrl.removeLayer(this.layer);
        }
        this.layer.remove();
    }
}

function tileMapLayerDirective() {
    return {
        scope: false,
        bindToController: {
            name: '@',
            options: '<?',
            enabled: '<?'
        },
        transclude: true,
        controller: TileMapLayerController,
        require: {
            mapCtrl: '^maTileMap',
            layerCtrl: '^?maTileMapLayer'
        }
    };
}

export default tileMapLayerDirective;