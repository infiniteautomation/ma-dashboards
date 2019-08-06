/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

class TileMapMarkerController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude']; }
    
    constructor($scope, $element, $transclude) {
        this.$scope = $scope;
        this.$element = $element;
        this.$transclude = $transclude;
        
        this.mapCtrl = this.$scope.$mapCtrl;
        this.map = this.mapCtrl.map;
        this.leaflet = this.mapCtrl.leaflet;
    }
    
    $onChanges(changes) {
        if (!this.marker) return;
        
        if (changes.coordinates && this.coordinates) {
            this.setCoordinates();
        }
    }

    $onInit() {
        const L = this.leaflet;

        this.marker = L.marker(this.mapCtrl.parseLatLong(this.coordinates))
            .addTo(this.map);

        this.$transclude(($clone, $scope) => {
            if ($clone.length) {
                this.transcludedContent = $clone;
                this.$element.append($clone);

                $scope.$marker = this.marker;
                $scope.$markerCtrl = this;
                this.marker.bindPopup(this.$element[0]);
                if (this.openPopup) {
                    this.marker.openPopup();
                }
            }
        });
    }
    
    $onDestroy() {
        this.marker.remove();
    }
    
    setCoordinates() {
        this.marker.setLatLng(this.mapCtrl.parseLatLong(this.coordinates));
    }
}

function openMarkMarkerDirective() {
    return {
        scope: false,
        bindToController: {
            coordinates: '<?'
        },
        transclude: true,
        controller: TileMapMarkerController
    };
}

export default openMarkMarkerDirective;