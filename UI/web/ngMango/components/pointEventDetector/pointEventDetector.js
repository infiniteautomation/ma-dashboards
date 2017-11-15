/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

class PointEventDetectorController {
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
        
        this.maEventDetector.findPointDetector(options).then(detector => {
            this.detector = detector;
            if (this.onDetector) {
                this.onDetector({$detector: detector});
            }
        });
    }
}

return {
    bindings: {
        point: '<',
        detectorType: '@',
        detector: '=',
        onDetector: '@?',
        options: '<?'
    },
    controller: PointEventDetectorController
};

}); // define
