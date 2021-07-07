/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */ 

import maSliderTemplate from './maSlider.html';

 /**
  * @ngdoc directive
  * @name ngMango.directive:maSlider
  * @restrict E
  * @description
  * `<ma-slider></ma-slider>`
  * - This component will display a slider that you can use to set a numeric data point's value.
  * - You can update the value by dragging left and right (or up and down in vertical mode).
  * @param {point} point Select the point to use with the slider by passing in a point object.
  * @param {string} point-xid Select the point to use with the slider by passing in a point's xid as a string.
  * @param {number} min Sets the min value for the slider (lower limit defaults to `0`).
  * @param {number} max Sets the max value for the slider (upper limit defaults to `100`).
  * @param {numeric} step Sets the interval each tick in the slider will move the value by. (defaults to `1`)
  * @param {string} label Set the label to display with the slider. If left off the point name will be used. Set to `none` to
  * hide the label.
  * @param {boolean} vertical Enables vertical mode display of the slider.
  * @param {boolean} invert Enables inverted mode and reverses the max / min.
  * @param {boolean} discrete Enables discrete mode and the slider will display a value on the pin as you drag. In discrete
  * mode the point's value will only be updated when you stop dragging.
  * @param {boolean} hide-input Disables displaying a numeric input next to the slider. (defaults to `false`)
  * @usage
  * <ma-slider point="myPoint" vertical="true" min="0" max="25" step="5"></ma-slider>
  *
  */
  
    MaSliderController.$inject = ['$element'];
    function MaSliderController($element) {
        const sliderContainerElement = $element.maFind('md-slider-container');

        this.$onChanges = function(changes) {
            if (changes.vertical) {
                if (changes.vertical.currentValue) {
                    // sliderElement.attr('md-vertical', true);
                    sliderContainerElement.attr('md-vertical', true);
                } else {
                    // sliderElement.removeAttr('md-vertical');
                    sliderContainerElement.removeAttr('md-vertical');
                }
            }
        };
    }

    export default {
        bindings: {
            point: '<?',
            pointXid: '@?',
            min: '<?',
            max: '<?',
            step: '<?',
            label: '@?',
            vertical: '<?',
            invert: '<?',
            discrete: '<?',
            hideInput: '<?'
        },
        designerInfo: {
            translation: 'ui.components.slider',
            icon: 'linear_scale',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid'},
                min: {type: 'string', defaultValue: 0},
                max: {type: 'string', defaultValue: 100},
                step: {type: 'string', defaultValue: 1},
                label: {options: ['Name', 'Device & Name']},
                vertical: {type: 'boolean', defaultValue: false},
                invert: {type: 'boolean', defaultValue: false},
                discrete: {type: 'boolean', defaultValue: false},
                hideInput: {type: 'boolean', defaultValue: false}
            }
        },
        controller: MaSliderController,
        template: maSliderTemplate,
        transclude: true
    };

