/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maIndicator
 * @restrict E
 * @description A simple component which changes its background color based on the point value. The color
 * is taken from either an attribute or from the data point's text renderer.
 * Only for use with binary and multistate points. You can use CSS to style the outline and border radius.
 * 
 * @param {object=} point A data point object from a watch list, point query, point drop-down, `maPoint` service, or `<ma-get-point-value>` component.
 * @param {string=} point-xid Instead of supplying a data point object, you can supply it's XID.
 * @param {string=} default-color The default color when none is provided via attribute or text renderer.
 * @param {string=} color-true The color to use when the point value is `true`.
 * @param {string=} color-false The color to use when the point value is `false`.
 * @param {string=} color-0 The color to use when the point value is `0`.
 * @param {string=} color-1 The color to use when the point value is `1`.
 * @param {string=} color-2 The color to use when the point value is `2`.
 * @param {string=} color-3 The color to use when the point value is `3`.
 * @param {string=} color-4 The color to use when the point value is `4`.
 * @param {string=} color-5 The color to use when the point value is `5`.
 * @param {boolean=} [toggle-on-click=false] For binary data points only. When you click the component it will set the point
 * value to the opposite of what it is currently. e.g. if the point value is currently false it will set the point value to true.
 */
indicator.$inject = ['maPointValueController', 'maUtil'];
function indicator(PointValueController, maUtil) {
    
    class IndicatorController extends PointValueController {
        constructor() {
            super(...arguments);

            this.$element.css('background-color', this.$attrs.defaultColor || '');
        }

        $onChanges(changes) {
            super.$onChanges(...arguments);
            
            if (changes.toggleOnClick) {
                if (this.toggleOnClick) {
                    this.$element.on('click.maIndicator', this.clickHandler.bind(this));
                    this.$element.attr('role', 'button');
                } else {
                    this.$element.off('click.maIndicator');
                    this.$element.removeAttr('role');
                }
            }
        }
    
        valueChangeHandler() {
            super.valueChangeHandler(...arguments);
    
            const value = this.getValue();
            let color;
    
            if (value != null) {
                const attrName = maUtil.camelCase('color-' + value);
                color = this.$attrs[attrName];
                
                if (!color && this.point) {
                    const renderer = this.point.valueRenderer(value);
                    color = renderer.colour || renderer.color;
                }
                
                if (!color) {
                    color = this.$attrs.defaultColor;
                }
            }
            this.$element.css('background-color', color || '');
    
            if (this.point && this.point.pointLocator && !this.point.pointLocator.settable) {
                this.$element.attr('disabled', 'disabled');
            } else {
                this.$element.removeAttr('disabled');
            }
        }
    
        clickHandler() {
            if (this.point && !this.$element.attr('disabled')) {
                this.point.toggleValue();
            }
        }
    }
    
    return {
        restrict: 'E',
        scope: {},
        controller: IndicatorController,
        bindToController: {
            toggleOnClick: '<?',
            point: '<?',
            pointXid: '@?',
            value: '<?',
            renderValue: '&?'
        },
        designerInfo: {
            translation: 'ui.components.indicator',
            icon: 'flare',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid'},
                toggleOnClick: {type: 'boolean'},
                colorTrue: {
                    type: 'color'
                },
                colorFalse: {
                    type: 'color'
                },
                color0: {
                    type: 'color'
                },
                color1: {
                    type: 'color'
                },
                color2: {
                    type: 'color'
                },
                color3: {
                    type: 'color'
                },
                color4: {
                    type: 'color'
                },
                defaultColor: {
                    type: 'color'
                }
            },
            size: {
                width: '30px',
                height: '30px'
            }
        }
    };
}

export default indicator;
