/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maBarDisplay
 * @restrict E
 * @description Displays a bar chart/graph for a data point value. You can use CSS to style the outline and fill.
 * 
 * @param {object=} point A data point object from a watch list, point query, point drop-down, `maPoint` service, or `<ma-get-point-value>` component.
 * @param {string=} point-xid Instead of supplying a data point object, you can supply it's XID.
 * @param {string=} [direction=left-to-right] The direction in which the fill extends. Options are
 * left-to-right, bottom-to-top, right-to-left, or top-to-bottom.
 * @param {number=} [maximum=100] The maximum value for the bar
 * @param {number=} [minimum=0] The minimum value for the bar
 * @param {number=} value Instead of displaying a point value you can pass any number to this attribute for display
 * on a bar graph.
 * @param {string} label Displays a label next to the point value. Three special options are available:
 *      NAME, DEVICE_AND_NAME, and DEVICE_AND_NAME_WITH_TAGS
 * @param {expression=} label-expression Expression that is evaluated to set the label. Gives more control for formatting the label.
 *     Takes precedence over the label attribute. Available locals are $point (Data point object).
 */

barDisplay.$inject = ['maPointValueController'];
function barDisplay(PointValueController) {

    class BarDisplayController extends PointValueController {
        constructor() {
            super(...arguments); 
            
            this.style = {};
            this.showValue = true;
        }
        
        $onChanges(changes) {
            super.$onChanges(...arguments);
            
            if (changes.maximum || changes.minimum || changes.direction || changes.barColor) {
                this.updateBar();
            }
        }

        valueChangeHandler() {
            super.valueChangeHandler(...arguments);
            
            this.updateBar();
        }

        updateBar() {
            const value = this.getValue() || 0;
            
            const maximum = this.maximum || 100;
            const minimum = this.minimum || 0;
            const range = maximum - minimum;
            const percent = Math.min(((value - minimum) / range * 100), 100) + '%';
            
            delete this.style.top;
            delete this.style.bottom;
            delete this.style.left;
            delete this.style.right;

            if (this.direction === 'bottom-to-top') {
                this.style.height = percent;
                this.style.width = '100%';
                this.style.bottom = 0;
            } else if (this.direction === 'top-to-bottom') {
                this.style.height = percent;
                this.style.width = '100%';
                this.style.top = 0;
            } else if (this.direction === 'right-to-left') {
                this.style.width = percent;
                this.style.height = '100%';
                this.style.right = 0;
            } else {
                this.style.width = percent;
                this.style.height = '100%';
            }
            
            if (this.barColor) {
                this.style.color = this.barColor;
            }
        }
    }
    
    return {
        restrict: 'E',
        template: `<div class="bar-display-fill" ng-style="$ctrl.style"></div>
<div ng-if="$ctrl.showValue" class="bar-display-text">{{$ctrl.getTextValue()}}</div>
<div ng-if="$ctrl.label" ng-bind="$ctrl.label" class="ma-point-value-label"></div>`,
        scope: {},
        controller: BarDisplayController,
        controllerAs: '$ctrl',
        bindToController: {
            point: '<?',
            pointXid: '@?',
            direction: '@?',
            maximum: '<?',
            minimum: '<?',
            value: '<?',
            renderValue: '&?',
            labelAttr: '@?label',
            labelExpression: '&?',
            barColor: '@?',
            showValue: '<?'
        },
        designerInfo: {
            translation: 'ui.components.barDisplay',
            icon: 'insert_chart',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid'},
                direction: {
                    options: ['left-to-right', 'bottom-to-top', 'right-to-left', 'top-to-bottom']
                },
                label: {options: ['NAME', 'DEVICE_AND_NAME', 'DEVICE_AND_NAME_WITH_TAGS']},
                barColor: {type: 'color'}
            },
            size: {
                width: '200px',
                height: '30px'
            }
        }
    };
}

export default barDisplay;
