/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'moment-timezone', './PointValueController'], function(require, moment, PointValueController) {
'use strict';
/**
 * @ngdoc directive 
 * @name maDashboards.maPointValue
 *
 * @description
 * `<ma-point-value point="myPoint"></ma-point-value>`
 * - The `<ma-point-value>` directive will render the live value or update time from a point onto the page.
 * - You can supply the `display-type` attribute to get the unit converted value or data/time of the update.
 * - You can use the `point-xid` property or pass in a point from `<ma-point-list>`.
 * - <a ui-sref="dashboard.examples.basics.liveValues">View Demo</a> / <a ui-sref="dashboard.examples.basics.getPointByXid">View point-xid Demo</a>
 *
 * @param {object} point The point object that the live value will be outputted to.
 If `point-xid` is used this will be a new variable for the point object.
 If the point object is passed into this attribute from `<ma-point-list>`
 then the point object will be extended with the live updating value.
 * @param {string=} point-xid If used you can hard code in a data point's `xid` to get its live values.
 * @param {string=} display-type Changes how the data point value is rendered on the page. Options are:
 <ul>
     <li>`rendered` (Displays live value in point's text rendered format) *Default</li>
     <li>`converted` (Displays live value in point's unit converted format)</li>
     <li>`dateTime` (Displays the time the of the point's last update)</li>
 </ul>
 * @param {string=} date-time-format If `dateTime` is used with `display-type`
 then you can pass in a [momentJs](http://momentjs.com/) string to format the timestamp. (Defaults to Mango default date format set in system settings)
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
function pointValue() {
    var dateOptions = ['dateTime', 'shortDateTime', 'dateTimeSeconds', 'shortDateTimeSeconds', 'date', 'shortDate', 'time', 'timeSeconds', 'monthDay', 'month', 'year', 'iso'];
    
    return {
        restrict: 'E',
        templateUrl: require.toUrl('./pointValue.html'),
        scope: {},
        controller: PointValueDirectiveController,
        controllerAs: '$ctrl',
        bindToController: {
            point: '<?',
            pointXid: '@?',
            displayType: '@?',
            dateTimeFormat: '@?',
            sameDayDateTimeFormat: '@?',
            timezone: '@?',
            flashOnChange: '<?',
            changeDuration: '<?',
            onValueUpdated: '&?'
        },
        designerInfo: {
            translation: 'dashboards.v3.components.pointValue',
            icon: 'label',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'dashboards.v3.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'dashboards.v3.components.dataPointXid', type: 'datapoint-xid'},
                displayType: {options: ['rendered', 'raw', 'converted', 'image', 'dateTime']},
                dateTimeFormat: {options: dateOptions},
                sameDayDateTimeFormat: {options: dateOptions},
                flashOnChange: {type: 'boolean'}
            }
        }
    };
}

PointValueDirectiveController.$inject = PointValueController.$inject.concat('mangoDateFormats');
function PointValueDirectiveController() {
    PointValueController.apply(this, arguments);
    var firstArg = PointValueController.$inject.length;
    
    this.mangoDateFormats = arguments[firstArg];
    this.valueStyle = {};
}

PointValueDirectiveController.prototype = Object.create(PointValueController.prototype);
PointValueDirectiveController.prototype.constructor = PointValueDirectiveController;

PointValueDirectiveController.prototype.$onChanges = function(changes) {
    PointValueController.prototype.$onChanges.apply(this, arguments);
    
    if (changes.displayType && !changes.displayType.isFirstChange() || changes.dateTimeFormat && !changes.dateTimeFormat.isFirstChange() ||
            changes.timezone && !changes.timezone.isFirstChange()) {
        this.updateText();
    }
};

PointValueDirectiveController.prototype.valueChangeHandler = function() {
    PointValueController.prototype.valueChangeHandler.apply(this, arguments);
    
    this.updateText();
};

PointValueDirectiveController.prototype.updateText = function() {
    delete this.valueStyle.color;
    // jshint eqnull:true
    if (!this.point || this.point.time == null) {
        this.displayValue = '';
        return;
    }
    
    var valueRenderer = this.point.valueRenderer(this.point.value);
    var color = valueRenderer ? valueRenderer.color : null;
    
    if (!this.displayType) {
        this.displayType = this.point.pointLocator.dataType === 'IMAGE' ? 'image' : 'rendered';
    }

    delete this.valueStyle.color;

    switch(this.displayType) {
    case 'converted':
        this.displayValue = this.point.convertedValue;
        break;
    case 'rendered':
        this.displayValue = this.point.renderedValue;
        this.valueStyle.color = color;
        break;
    case 'dateTime':
        var dateTimeFormat = this.mangoDateFormats.shortDateTimeSeconds;
        if (this.sameDayDateTimeFormat && (Date.now() - this.point.time < 86400)) {
            dateTimeFormat = this.mangoDateFormats[this.sameDayDateTimeFormat] || this.sameDayDateTimeFormat;
        } else if (this.dateTimeFormat) {
            dateTimeFormat = this.mangoDateFormats[this.dateTimeFormat] || this.dateTimeFormat;
        }
        var m = this.timezone ? moment.tz(this.point.time, this.timezone) : moment(this.point.time);
        this.displayValue = m.format(dateTimeFormat);
        break;
    default:
        this.displayValue = this.point.value;
    }
};


return pointValue;

}); // define
