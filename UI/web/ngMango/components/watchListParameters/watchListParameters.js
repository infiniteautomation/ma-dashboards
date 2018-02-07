/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

 /**
  * @ngdoc directive
  * @name ngMango.directive:maWatchListParameters
  * @restrict E
  * @description Displays a list of inputs to change the parameter values for a watch list. Applies to point query or tag watch list types.
  *
  * @param {expression} ng-model Assignable expression to output the parameter values to.
  * @param {object} watch-list The watch list object to display the parameter inputs for.
  * @param {object=} parameters Deprecated. Use `ng-model`.
  * @param {expression=} parameters-changed Deprecated. Use `ng-change`.
  */

define(['angular', 'require', 'rql/query'], function(angular, require, query) {
'use strict';

var watchListParameters = {
    controller: WatchListParametersController,
    templateUrl: require.toUrl('./watchListParameters.html'),
    bindings: {
        watchList: '<',
        parametersChanged: '&?',
        parameters: '<?'
    },
    require: {
        ngModelCtrl: '?ngModel'
    },
    designerInfo: {
        translation: 'ui.components.watchListParameters',
        icon: 'remove_red_eye',
        category: 'watchLists',
        size: {
            width: '100%'
        },
        attributes: {
            watchList: {defaultValue: 'designer.watchList'},
            ngModel: {defaultValue: 'designer.parameters'}
        }
    }
};

WatchListParametersController.$inject = ['$parse', '$interpolate'];
function WatchListParametersController($parse, $interpolate) {
    this.$parse = $parse;
    this.$interpolate = $interpolate;
}

WatchListParametersController.prototype.$onInit = function() {
    if (this.ngModelCtrl) {
        this.ngModelCtrl.$render = () => {
            this.parameters = this.ngModelCtrl.$viewValue;
            this.paramOptions = {};
        };
    }
};

WatchListParametersController.prototype.$onChanges = function(changes) {
    if (!this.ngModelCtrl && changes.watchList && this.watchList) {
        if (!this.parameters) {
            this.parameters = {};
        }
        this.watchList.defaultParamValues(this.parameters);
        this.paramOptions = {};
    }
};

WatchListParametersController.prototype.inputChanged = function inputChanged() {
    this.parameters = Object.assign({}, this.parameters);
    this.paramOptions = {};
    
	if (this.watchList && this.parametersChanged) {
		this.parametersChanged({$parameters: this.parameters});
	}
	if (this.ngModelCtrl) {
	    this.ngModelCtrl.$setViewValue(this.parameters);
	}
};

WatchListParametersController.prototype.getParamOption = function getParamOption(param, optionName) {
    if (!param || !param.options || !optionName) return;
    
    let storedOptions = this.paramOptions[param.name];
    if (!storedOptions) {
        storedOptions = this.paramOptions[param.name] = {};
    }

    const rawValue = param.options[optionName];
    const cachedValue = storedOptions[optionName];

    if (cachedValue && cachedValue.input === rawValue) {
        return cachedValue.output;
    }
    
    let interpolatedValue;
    if (rawValue != null && typeof rawValue === 'object') {
        interpolatedValue = this.interpolateObjectValues(rawValue);
    } else {
        interpolatedValue = this.interpolateOption(rawValue);
    }
    
    storedOptions[optionName] = {
        input: rawValue,
        output: interpolatedValue
    };
    
    return interpolatedValue;
};

WatchListParametersController.prototype.getDsQuery = function getDsQuery(param) {
    if (!param || !param.options) return;
    
    let storedOptions = this.paramOptions[param.name];
    if (!storedOptions) {
        storedOptions = this.paramOptions[param.name] = {};
    }

    const rawValue = '' + param.options.nameIsLike + param.options.xidIsLike;
    const cachedValue = storedOptions.dsQuery;

    if (cachedValue && cachedValue.input === rawValue) {
        return cachedValue.output;
    }

    const interpolatedValue = new query.Query();
    if (param.options.nameIsLike) {
        interpolatedValue.push(new query.Query({
            name: 'like',
            args: ['name', this.getParamOption(param, 'nameIsLike')]
        }));
    }
    if (param.options.xidIsLike) {
        interpolatedValue.push(new query.Query({
            name: 'like',
            args: ['xid', this.getParamOption(param, 'xidIsLike')]
        }));
    }
    
    storedOptions.dsQuery = {
        input: rawValue,
        output: interpolatedValue
    };
    
    return interpolatedValue;
};

WatchListParametersController.prototype.interpolateObjectValues = function interpolateObjectValues(option) {
    if (option == null) return option;
    
    const result = {};
    
    Object.keys(option).forEach(key => {
        result[key] = this.interpolateOption(option[key]);
    });
    
    return result;
};

WatchListParametersController.prototype.interpolateOption = function interpolateOption(option) {
    if (typeof option !== 'string' || option.indexOf('{{') < 0)
        return option;

    // if the whole string is contained within {{}} extract the expression and parse it into a
    // number etc instead of interpolating it into a string
    var matches = /{{(.*?)}}/.exec(option);
    if (matches && matches[0] === matches.input) {
        option = this.$parse(matches[1])(this.parameters);
    } else {
        option = this.$interpolate(option)(this.parameters);
    }
    return option;
};

return watchListParameters;

}); // define
