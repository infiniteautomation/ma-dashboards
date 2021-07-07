/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maPointEventDetector
 * @restrict 'E'
 * @scope
 *
 * @description Retrieves data point event detectors, or creates new ones. You can then use a separate input to modify the
 *     detector properties (e.g. high/low limits) and save the event detector.
 *
 * @param {object} point The data point to get/create the event detector for
 * @param {string} detector-type Event detector type to query for or the type to create. e.g. LOW_LIMIT or HIGH_LIMIT.
 *     If the data point has multiple detectors of this type the first detector is returned.
 * @param {string=} alarm-level The alarm level for the given detector type.
 *     If the data point has multiple detectors of the given detector type and alarm level the first detector is returned.
 *     If not provided and an event detector is created it will have an alarm level of WARNING.
 * @param {expression} detector Assignable expression to output the retrieved detector.
 * @param {expression=} on-detector Expression which is evaluated when the detector is retrieved.
 *     Available scope parameters are `$detector`.
 * @param {object=} options Additional options which are passed to `maEventDetector.findPointDetector()`
 * 
 * @usage
 *     <ma-point-event-detector point="dataPoint" detector-type="LOW_LIMIT" alarm-level="CRITICAL" detector="criticalLowDetector"></ma-point-event-detector>
 *     <input type="number" ng-model-options="{debounce: 1000}" ng-model="criticalLowDetector.limit" ng-change="criticalLowDetector.saveAndNotify();">
 **/

class PointEventDetectorController {
    static get $$ngIsClass() { return true; }
    static get $inject () {
        return ['maEventDetector'];
    }
    
    constructor(maEventDetector) {
        this.maEventDetector = maEventDetector;
    }
    
    $onChanges(changes) {
        if (changes.point) {
            if (changes.point.isFirstChange() && !this.point) {
                this.detector = null;
                if (this.onDetector) {
                    this.onDetector({$detector: null});
                }
            }
            if (this.point) {
                this.findDetector();
            }
        }
    }
    
    findDetector() {
        const options = Object.assign({
            sourceId: this.point.id,
            detectorType: this.detectorType
        }, this.options);
        
        if (this.alarmLevel) {
            options.alarmLevel = this.alarmLevel;
        }
        
        this.maEventDetector.findPointDetector(options).then(detector => {
            this.detector = detector;
            if (this.onDetector) {
                this.onDetector({$detector: detector});
            }
        });
    }
}

export default {
    bindings: {
        point: '<',
        detectorType: '@',
        alarmLevel: '@?',
        detector: '=',
        onDetector: '&?',
        options: '<?'
    },
    controller: PointEventDetectorController,
    designerInfo: {
        translation: 'ui.components.maPointEventDetector',
        icon: 'warning',
        attributes: {
            alarmLevel: {options: ['NONE', 'INFORMATION', 'WARNING', 'URGENT', 'CRITICAL', 'LIFE_SAFETY']},
            detectorType: {options: ['LOW_LIMIT', 'HIGH_LIMIT']}
        }
    }
};
