/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import requirejs from 'requirejs/require';


class ImageSliderController {
    static get $$ngIsClass() { return true; }
    static get $inject() {
        return ['$interval'];
    }
    
    constructor($interval) {
        this.$interval = $interval;
        
        this.imageIndex = 0;
        this.autoLoop = true;
        this.autoLoopInterval = 1000;
    }
    
    $onInit() {
    }
    
    $onChanges(changes) {
        if (changes.pointValues) {
            if (!this.pointValues || !this.pointValues.length) {
                delete this.currentValue;
                this.cancelInterval();
            }
            if (this.pointValues && this.pointValues.length) {
                this.updateImage();
                this.resetLooping();
            }
        }
    }
    
    cancelInterval() {
        if (this.intervalPromise) {
            this.$interval.cancel(this.intervalPromise);
            delete this.intervalPromise;
        }
    }
    
    resetLooping() {
        if (this.intervalPromise) {
            this.$interval.cancel(this.intervalPromise);
            delete this.intervalPromise;
        }
        
        if (!this.autoLoop) return;
        
        this.intervalPromise = this.$interval(() => {
            this.imageIndex++;
            if (this.imageIndex >= this.pointValues.length) {
                this.imageIndex = 0;
            }
            this.updateImage();
        }, this.autoLoopInterval);
    }

    sliderChanged() {
        this.updateImage();
    }
    
    updateImage() {
        this.currentValue = this.pointValues[this.imageIndex];
    }
}

export default {
    bindings: {
        pointValues: '<'
    },
    controller: ImageSliderController,
    templateUrl: requirejs.toUrl('./imageSlider.html'),
    designerInfo: {
        translation: 'ui.components.imageSlider',
        icon: 'photo_library'
    }
};


