/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

ImageSliderController.$inject = ['$interval'];
function ImageSliderController($interval) {
    this.imageIndex = 0;
    
    $interval(function() {
        this.imageIndex++;
        if (this.imageIndex >= this.pointValues.length) {
            this.imageIndex = 0;
        }
        this.updateImage();
    }.bind(this), 1000);
    
    this.$onChanges = function(changes) {
        if (changes.pointValues && this.pointValues && this.pointValues.length)
            this.updateImage();
    };
    
    this.sliderChanged = function sliderChanged() {
        this.updateImage();
    };
    
    this.updateImage = function updateImage() {
        this.currentValue = this.pointValues[this.imageIndex];
    };
}

return {
    bindings: {
        pointValues: '<'
    },
    controller: ImageSliderController,
    templateUrl: require.toUrl('./imageSlider.html'),
    designerInfo: {
        translation: 'ui.components.imageSlider',
        icon: 'photo_library'
    }
};

}); // define
