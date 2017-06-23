/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */ 

define(['angular', 'require'], function(angular, require) {
    'use strict';
 /**
  * @ngdoc directive
  * @name ngMango.directive:maSlider
  * @restrict E
  * @description
  * `<ma-slider></ma-slider>`
  * - This component will display a slider.
  * @param {number} min Sets the min
  * @usage
  * <ma-slider></ma-slider>
  *
  */
  
    MaSliderController.$inject = ['$element'];
    function MaSliderController($element) {
        var sliderElement = $element.find('md-slider');
        var sliderContainerElement = $element.find('md-slider-container');

        this.$onChanges = function(changes) {
            // if (changes.vertical) {
            //     if (changes.vertical.currentValue) {
            //         sliderElement.attr('md-vertical', true);
            //         sliderContainerElement.attr('md-vertical', true);
            //     } else {
            //         sliderElement.removeAttr('md-vertical');
            //         sliderContainerElement.removeAttr('md-vertical');
            //     }
            // }

            if (changes.discrete) {
                if (changes.discrete.currentValue) {
                    sliderElement.attr('md-discrete', true);
                } else {
                    sliderElement.removeAttr('md-discrete');
                }
            }

            // if (changes.invert) {
            //     if (changes.invert.currentValue) {
            //         sliderElement.attr('md-invert', true);
            //     } else {
            //         sliderElement.removeAttr('md-invert');
            //     }
            // }
        };
    }

    return {
        bindings: {
            point: '<?',
            pointXid: '@?',
            min: '<?',
            max: '<?',
            // vertical: '<?',
            // invert: '<?',
            discrete: '<?',
            step: '<?'
        },
        designerInfo: {
            // translation: 'ui.components.switchImg',
            icon: 'linear_scale',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid'},
                min: {type: 'string', defaultValue: 0},
                max: {type: 'string', defaultValue: 100},
                // vertical: {type: 'boolean', defaultValue: false},
                // invert: {type: 'boolean', defaultValue: false},
                discrete: {type: 'boolean', defaultValue: false},
                step: {type: 'string', defaultValue: 1}
            }
        },
        controller: MaSliderController,
        templateUrl: require.toUrl('./maSlider.html'),
        transclude: true
    };
}); // define
