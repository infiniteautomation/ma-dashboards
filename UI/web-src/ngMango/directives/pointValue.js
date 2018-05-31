/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import pointValueTemplate from './pointValue.html';
import moment from 'moment-timezone';

/**
 * @ngdoc directive 
 * @name ngMango.directive:maPointValue
 *
 * @description
 * `<ma-point-value point="myPoint"></ma-point-value>`
 * - The `<ma-point-value>` directive will render the live value or update time from a point onto the page.
 * - You can supply the `display-type` attribute to get the unit converted value or data/time of the update.
 * - You can use the `point-xid` property or pass in a point from `<ma-point-list>`.
 * - <a ui-sref="ui.examples.basics.liveValues">View Demo</a> / <a ui-sref="ui.examples.basics.getPointByXid">View point-xid Demo</a>
 *
 * @param {object=} point A data point object from a watch list, point query, point drop-down, `maPoint` service, or `<ma-get-point-value>` component.
 * @param {string=} point-xid Instead of supplying a data point object, you can supply it's XID.
 * @param {string=} display-type Changes how the data point value is rendered on the page. Options are:
 <ul>
     <li>`rendered` (Displays live value in point's text rendered format) *Default</li>
     <li>`converted` (Displays live value in point's unit converted format)</li>
     <li>`dateTime` (Displays the time the of the point's last update)</li>
 </ul>
 * @param {string=} date-time-format If `dateTime` is used with `display-type`
 then you can pass in a [momentJs](http://momentjs.com/) string to format the timestamp. (Defaults to Mango default date format set in system settings)
 * @param {string} [enable-popup="hide"] Set to one of the following values to enable shortcut icons to open stats or set point
 * dialog box for the selected point. Options are: `right`, `left`, `up`, or `down` to set the direction the icons
 * will open in. Shortcut icons will be shown on mouse over. Stats dialog will use date range from the date bar.
 *
 * @usage
 *
 <md-input-container class="md-block">
     <label>Choose a point</label>
     <ma-point-list ng-model="myPoint1"></ma-point-list>
 </md-input-container>

Value: <ma-point-value point="myPoint1"></ma-point-value>
Time: <ma-point-value point="myPoint1" display-type="dateTime" date-time-format="LTS">
</ma-point-value>
 *
 */
pointValue.$inject = ['maPointValueController', 'MA_DATE_FORMATS', 'maEvents', '$injector'];
function pointValue(PointValueController, MA_DATE_FORMATS, maEvents, $injector) {

    class PointValueDirectiveController extends PointValueController {
        constructor() {
            super(...arguments);

            if ($injector.has('$state')) {
                this.$state = $injector.get('$state');
            }
            
            this.valueStyle = {};
        }

        $onInit() {
            this.$element.on('mouseenter', event => {
                this.$scope.$apply(() => {
                    this.isOpen = true;
                });
            });
            
            this.$element.on('mouseleave', event => {
                this.$scope.$apply(() => {
                    this.isOpen = false;
                });
            });
        }
    
        $onChanges(changes) {
            super.$onChanges(...arguments);
            
            if (changes.displayType && !changes.displayType.isFirstChange() || changes.dateTimeFormat && !changes.dateTimeFormat.isFirstChange() ||
                    changes.timezone && !changes.timezone.isFirstChange()) {
                this.updateText();
            }
            
            if (changes.labelAttr || changes.labelExpression) {
                if (this.labelExpression) {
                    this.label = this.labelExpression({$point: this.point});
                } else {
                    this.updateLabel();
                }
            }
        }
    
        updateLabel() {
            if (this.labelAttr === 'NAME') {
                this.label = this.point && (this.point.name + ':');
            } else if (this.labelAttr === 'DEVICE_AND_NAME') {
                this.label = this.point && (this.point.deviceName + ' \u2014 ' + this.point.name + ':');
            } else {
                this.label = this.labelAttr;
            }
        }
    
        valueChangeHandler(isPointChange) {
            super.valueChangeHandler(...arguments);
            
            if (isPointChange) {
                this.updateLabel();
                if (this.labelExpression) {
                    this.label = this.labelExpression({$point: this.point});
                } else {
                    this.updateLabel();
                }
            }
            
            this.updateText();
            
            if (isPointChange) {
                this.activeEvents = 0;
                if (!this.hideEventIndicator && this.point) {
                    this.getActiveEvents();
                }
            }
        }
    
        getActiveEvents() {
            maEvents.buildQuery()
                .eq('dataPointId', this.point.id)
                .eq('active', true)
                .limit(0)
                .query().then(result => {
                    this.activeEvents += result.$total;
                });
            
            if (!this.deregisterWebsocket) {
                this.deregisterWebsocket = maEvents.notificationManager.subscribe((event, mangoEvent) => {
                    if (!this.point || mangoEvent.eventType.dataPointId !== this.point.id) return;
                    
                    if (event.name === 'RAISED' && mangoEvent.active) {
                        this.activeEvents += 1;
                    } else if (event.name === 'RETURN_TO_NORMAL') { // what does DEACTIVATED mean?
                        this.activeEvents -= 1;
                    }
                    
                }, this.$scope, ['RAISED', 'RETURN_TO_NORMAL']);
            }
        }
    
        updateText() {
            delete this.valueStyle.color;
            
            if (!this.point || this.point.time == null) {
                this.displayValue = '';
                this.resolvedDisplayType = this.displayType || 'rendered';
                return;
            }
            
            const valueRenderer = this.point.valueRenderer(this.point.value, this.point.renderedValue);
            const color = valueRenderer ? valueRenderer.color : null;
    
            this.resolvedDisplayType = this.displayType || (this.point.pointLocator && this.point.pointLocator.dataType === 'IMAGE' ? 'image' : 'rendered');
            delete this.valueStyle.color;
    
            switch(this.resolvedDisplayType) {
            case 'converted':
                this.displayValue = this.point.convertedValue;
                break;
            case 'rendered':
                this.displayValue = this.point.renderedValue;
                this.valueStyle.color = color;
                break;
            case 'dateTime':
                let dateTimeFormat = MA_DATE_FORMATS.shortDateTimeSeconds;
                if (this.sameDayDateTimeFormat && (Date.now() - this.point.time < 86400)) {
                    dateTimeFormat = MA_DATE_FORMATS[this.sameDayDateTimeFormat] || this.sameDayDateTimeFormat;
                } else if (this.dateTimeFormat) {
                    dateTimeFormat = MA_DATE_FORMATS[this.dateTimeFormat] || this.dateTimeFormat;
                }
                const m = this.timezone ? moment.tz(this.point.time, this.timezone) : moment(this.point.time);
                this.displayValue = m.format(dateTimeFormat);
                break;
            default:
                this.displayValue = this.point.value;
            }
        }
    }

    const dateOptions = ['dateTime', 'shortDateTime', 'dateTimeSeconds', 'shortDateTimeSeconds', 'date', 'shortDate', 'time',
        'timeSeconds', 'monthDay', 'month', 'year', 'iso'];
    
    return {
        restrict: 'E',
        template: pointValueTemplate,
        scope: {},
        controller: PointValueDirectiveController,
        controllerAs: '$ctrl',
        bindToController: {
            point: '<?',
            pointXid: '@?',
            displayType: '@?',
            labelAttr: '@?label',
            dateTimeFormat: '@?',
            sameDayDateTimeFormat: '@?',
            timezone: '@?',
            flashOnChange: '<?',
            changeDuration: '<?',
            onValueUpdated: '&?',
            labelExpression: '&?',
            enablePopup: '@?',
            hideEventIndicator: '<?',
            quickInfo: '<?',
            dataPointDetails: '<?',
            disableEventPopup: '<?'
        },
        designerInfo: {
            translation: 'ui.components.pointValue',
            icon: 'label',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid'},
                displayType: {options: ['rendered', 'raw', 'converted', 'image', 'dateTime']},
                flashOnChange: {type: 'boolean'},
                dateTimeFormat: {options: dateOptions},
                sameDayDateTimeFormat: {options: dateOptions},
                label: {options: ['NAME', 'DEVICE_AND_NAME']},
                enablePopup: {type: 'string', defaultValue: 'hide', options: ['hide', 'right', 'left', 'up', 'down']},
                hideEventIndicator: {type: 'boolean', default: false},
                quickInfo: {type: 'boolean', default: true},
                dataPointDetails: {type: 'boolean', default: true}
            }
        }
    };
}

export default pointValue;

