/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular', './PointValueController'], function(require, angular, PointValueController) {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.directive:maSetPointValue
 * @restrict E
 * @description
 * `<ma-set-point-value point="myPoint"></ma-set-point-value>`
 * - `<ma-set-point-value>` will create an input element to set the value of a data point.
 * - The data point must be settable.
 * - It can handle `numeric`, `alphanumeric`, `binary`, and `multistate` point types and will display an appropriate interface element for each.
 * - Alternatively, you can set the value of a point by calling the `setValue` method on a point object.
 This function can be called from within an `ng-click` expression for example. (using this method does not require `<ma-set-point-value>`)
 * - <a ui-sref="ui.examples.settingPointValues.setPoint">View Demo</a> 
 *
 * @param {object} point Input the point object of a settable data point.
 * @param {boolean} [show-button=true] Specifies if the button is shown.
 * @param {boolean} [set-on-change=false] Specifies if the point value is set when an option is selected from the dropdown (always true if show-button is false)
 *
 * @usage
 * <ma-point-list limit="200" ng-model="myPoint"></ma-point-list>
 <ma-set-point-value point="myPoint"></ma-set-point-value>
 *
 */
setPointValue.$inject = ['$injector'];
function setPointValue($injector) {
    return {
        restrict: 'E',
        templateUrl: function() {
            if ($injector.has('$mdUtil')) {
                return require.toUrl('./setPointValue-md.html');
            }
            return require.toUrl('./setPointValue.html');
        },
        scope: {},
        controller: SetPointValueController,
        controllerAs: '$ctrl',
        bindToController: {
            point: '<?',
            pointXid: '@?',
            showButton: '<?',
            setOnChange: '<?',
            labelAttr: '@?label',
            labelExpression: '&?'
        },
        designerInfo: {
            translation: 'ui.components.setPointValue',
            icon: 'touch_app',
            category: 'pointValue',
            attributes: {
                point: {nameTr: 'ui.app.dataPoint', type: 'datapoint'},
                pointXid: {nameTr: 'ui.components.dataPointXid', type: 'datapoint-xid'},
                label: {options: ['NAME', 'DEVICE_AND_NAME']}
            }
        }
    };
}

SetPointValueController.$inject = PointValueController.$inject.concat('maTranslate', '$q');
function SetPointValueController() {
    PointValueController.apply(this, arguments);
    var firstArg = PointValueController.$inject.length;
    
    var Translate = arguments[firstArg];
    var $q = arguments[firstArg + 1];

    this.defaultBinaryOptions = [];
    var trPromise = $q.all([Translate.tr('common.false'), Translate.tr('common.true')]).then(function(trs) {
        this.defaultBinaryOptions.push({
            id: false,
            label: trs[0]
        });
        this.defaultBinaryOptions.push({
            id: true,
            label: trs[1]
        });
    }.bind (this));
}

SetPointValueController.prototype = Object.create(PointValueController.prototype);
SetPointValueController.prototype.constructor = SetPointValueController;

SetPointValueController.prototype.$onInit = function() {
    if (angular.isUndefined(this.showButton)) {
        this.showButton = true;
    }
    this.pointChanged();
};

SetPointValueController.prototype.$onChanges = function(changes) {
    PointValueController.prototype.$onChanges.apply(this, arguments);

    if (changes.labelAttr || changes.labelExpression) {
		if (this.labelExpression) {
			this.label = this.labelExpression({$point: this.point});
		} else {
			this.updateLabel();
		}
    }
};

SetPointValueController.prototype.updateLabel = function() {
	if (this.labelAttr === 'NAME') {
		this.label = this.point && (this.point.name + ':');
	} else if (this.labelAttr === 'DEVICE_AND_NAME') {
		this.label = this.point && (this.point.deviceName + ' \u2014 ' + this.point.name + ':');
	} else {
		this.label = this.labelAttr;
	}
};

SetPointValueController.prototype.valueChangeHandler = function(pointChanged) {
    PointValueController.prototype.valueChangeHandler.apply(this, arguments);

    if (pointChanged) {
        this.pointChanged();

		if (this.labelExpression) {
			this.label = this.labelExpression({$point: this.point});
		} else {
			this.updateLabel();
		}
    }

    this.updateValue();
};

SetPointValueController.prototype.updateValue = function() {
    var focus = this.$element.find('input, select, md-select').is(":focus");
    if (!focus) {
        if (this.inputType === 'numeric') {
            this.inputValue = this.convertRendered();
        } else {
            this.inputValue = this.getValue();
        }
    }
};

SetPointValueController.prototype.selectChanged = function() {
    if (this.setOnChange || !this.showButton)
        this.result = this.point.setValueResult(this.inputValue);
};


SetPointValueController.prototype.convertRendered = function() {
    if (!this.point) return;
    
    var result;
    if (this.point.renderedValue != null) {
        result = parseFloat(this.point.renderedValue.trim());
        if (isFinite(result))
            return result;
    }
    if (this.point.convertedValue != null) {
        return round(this.point.convertedValue, 2);
    }
    if (this.point.value != null) {
        return round(this.point.value, 2);
    }
    
    function round(num, places) {
        places = places || 1;
        var multiplier = Math.pow(10, places);
        return Math.round(num * multiplier) / multiplier;
    }
};

SetPointValueController.prototype.pointChanged = function() {
    delete this.inputValue;
    delete this.result;
    delete this.options;
    this.inputType = 'text';
    this.step = 'any';
    
    if (!this.point) return;
    
    var locator = this.point.pointLocator;
    var type = locator.dataType;
    var textRenderer = this.point.textRenderer;

    if (type === 'NUMERIC') {
        this.inputType = 'numeric';
    } else if (type === 'MULTISTATE') {
        if (textRenderer.type === 'textRendererMultistate') {
            this.inputType = 'select';
        } else if (textRenderer.type === 'textRendererPlain') {
            this.inputType = 'numeric';
            this.step = 1;
        }
        
        var values = textRenderer.multistateValues;
        if (values) {
            this.options = [];
            for (var i = 0; i < values.length; i++) {
                var label = values[i].text;
                var option = {
                    id: values[i].key,
                    label: label,
                    style: {
                        color: values[i].colour || values[i].color
                    }
                };
                this.options.push(option);
            }
        }
    } else if (type === 'BINARY') {
        this.inputType = 'select';
        
        if (this.point.rendererMap()) {
            var falseRenderer = this.point.valueRenderer(false);
            var trueRenderer = this.point.valueRenderer(true);
            this.options = [{
                id: false,
                label: falseRenderer.text,
                style: {
                    color: falseRenderer.colour || falseRenderer.color
                }
            }, {
                id: true,
                label: trueRenderer.text,
                style: {
                    color: trueRenderer.colour || trueRenderer.color
                }
            }];
        } else {
            this.options = this.defaultBinaryOptions;
        }
    }
};

return setPointValue;

}); // define
