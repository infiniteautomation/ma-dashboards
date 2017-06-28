/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', './PointValueController'], function(angular, PointValueController) {
'use strict';

/**
 * @ngdoc directive
 * @name ngMango.directive:maSwitchImg
 * @restrict E
 * @description
 * `<ma-switch-img></ma-switch-img>`
 * - `<ma-switch-img>` displays an image who's image source will be switched based on a point's value.
 * - Use default-src to set the default image that will display if no match is found or the point is disabled.
 * - <a ui-sref="ui.examples.singleValueDisplays.switchImage">View Demo</a> 
 *
 * @param {object} point Input the point object whos value will be used in
 determining the image displayed. (using `<ma-get-point-value point="myPoint"></ma-point-value>`)
 * @param {string=} point-xid Alternatively to inputting a point you can input a point xid.
 * @param {string=} default-src Set the default image path that will display if no match is found or the point is disabled.
 * @param {object=} src-map Use an object to map any data point value to an image path: (`{'value1': 'img/image1.png',
 * 'value2': 'img/image2.png'}`)
 * @param {string=} src-### The part of attribute after `src-` (the `###`) is used to compare against the point value.
 For strings with spaces replace the spaces in the point value with dashes in attribute name. *Not to be used with `src-map` attribute.
 * @param {string=} value Alternatively to passing in a point you can use the `value` attribute to pass in a raw value.
 * @param {boolean=} toggle-on-click Set to true to enable click to toggle. *Only works with binary data points.
 *
 * @usage
 <ma-point-list limit="200" ng-model="myPoint"></ma-point-list>
 <ma-point-value point="myPoint"></ma-point-value>

 <ma-switch-img point="myPoint" src-false="img/ligthbulb_off.png" src-true="img/ligthbulb_on.png"
 default-src="img/close.png" toggle-on-click="true"></ma-switch-img>
 *
 */
function switchImg() {
    return {
        restrict: 'E',
        template: '<img ng-src="{{$ctrl.src}}">',
        scope: {},
        controller: SwitchImgController,
        controllerAs: '$ctrl',
        bindToController: {
            point: '<?',
            pointXid: '@?',
            srcFalse: '@?',
            srcTrue: '@?',
            defaultSrc: '@?',
            srcMap: '<?',
            src0: '@?',
            src1: '@?',
            src2: '@?',
            src3: '@?',
            value: '<?',
            toggleOnClick: '<?'
        },
        designerInfo: {
            translation: 'ui.components.switchImg',
            icon: 'image',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid'},
                toggleOnClick: {nameTr: 'ui.components.toggleOnClick', type: 'boolean'},
                srcTrue: {type: 'choosefile', optional: true},
                srcFalse: {type: 'choosefile', optional: true},
                defaultSrc: {type: 'choosefile'},
                srcMap: {type: 'string'},
                src0: {type: 'choosefile', optional: true},
                src1: {type: 'choosefile', optional: true},
                src2: {type: 'choosefile', optional: true},
                src3: {type: 'choosefile', optional: true},
                value: {type: 'string'}
            }
        }
    };
}

SwitchImgController.$inject = PointValueController.$inject.concat('maUtil');
function SwitchImgController() {
    PointValueController.apply(this, arguments);
    var firstArg = PointValueController.$inject.length;
    
    this.Util = arguments[firstArg];
}

SwitchImgController.prototype = Object.create(PointValueController.prototype);
SwitchImgController.prototype.constructor = SwitchImgController;

SwitchImgController.prototype.$onChanges = function(changes) {
    PointValueController.prototype.$onChanges.apply(this, arguments);
    
    if (changes.srcMap && !changes.srcMap.isFirstChange() || changes.defaultSrc && !changes.defaultSrc.isFirstChange()) {
        this.updateImage();
    }
    
    if (changes.toggleOnClick) {
        if (this.toggleOnClick) {
            this.$element.on('click.maIndicator', this.clickHandler.bind(this));
            this.$element.attr('role', 'button');
        } else {
            this.$element.off('click.maIndicator');
            this.$element.removeAttr('role');
        }
    }
};

SwitchImgController.prototype.valueChangeHandler = function() {
    PointValueController.prototype.valueChangeHandler.apply(this, arguments);
    
    this.updateImage();

    if (this.point && this.point.pointLocator && !this.point.pointLocator.settable) {
        this.$element.attr('disabled', 'disabled');
    } else {
        this.$element.removeAttr('disabled');
    }
};

SwitchImgController.prototype.updateImage = function() {
    var value = this.getValue();

    if (value == null) {
        delete this.src;
    } else {
        // TODO better conversion to attr name for symbols etc
        var valueString = typeof value === 'string' ? replaceAll(value, ' ', '-').toLowerCase() : value.toString();
        
        var attrName = this.Util.camelCase('src-' + valueString);
        this.src = this.$attrs[attrName];

        if (!this.src && this.srcMap) {
            this.src = this.srcMap[value];
        }
    }
    if (!this.src) {
        this.src = this.defaultSrc || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    }
};

SwitchImgController.prototype.clickHandler = function() {
    if (this.point && !this.$element.attr('disabled')) {
        this.point.toggleValue();
    }
};

function replaceAll(target, search, replacement) {
    return target.replace(new RegExp(search, 'g'), replacement);
}

return switchImg;

}); // define
