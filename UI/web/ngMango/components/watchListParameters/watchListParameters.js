/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
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

WatchListParametersController.$inject = ['$parse', '$interpolate', 'maUtil'];
function WatchListParametersController($parse, $interpolate, Util) {
    this.$parse = $parse;
    this.$interpolate = $interpolate;
    this.Util = Util;
    
    this.createDsQuery = this.Util.memoize(this.createDsQuery.bind(this));
}

WatchListParametersController.prototype.$onInit = function() {
    if (this.ngModelCtrl) {
        this.ngModelCtrl.$render = () => {
            this.parameters = this.ngModelCtrl.$viewValue;
            this.prevParameters = angular.copy(this.parameters);
        };
    }
};

WatchListParametersController.prototype.$onChanges = function(changes) {
    if (!this.ngModelCtrl && changes.watchList && this.watchList) {
        if (!this.parameters) {
            this.parameters = {};
        }
        
        const defaultParams = this.watchList.data && this.watchList.data.paramValues;
    	if (defaultParams) {
    	    Object.keys(defaultParams).forEach(paramName => {
    	        if (this.parameters[paramName] === undefined) {
    	            this.parameters[paramName] = defaultParams[paramName];
    	        }
    	    });
    	}
    	
        this.prevParameters = angular.copy(this.parameters);
    }
};

WatchListParametersController.prototype.inputChanged = function inputChanged() {
    if (angular.equals(this.parameters, this.prevParameters)) {
        return;
    }
    
    this.parameters = Object.assign({}, this.parameters);
    this.prevParameters = angular.copy(this.parameters);
    
	if (this.watchList && this.parametersChanged) {
		this.parametersChanged({$parameters: this.parameters});
	}
	if (this.ngModelCtrl) {
	    this.ngModelCtrl.$setViewValue(this.parameters);
	}
};

WatchListParametersController.prototype.createDsQuery = function createDsQuery(options) {
    if (!options || !(options.nameIsLike || options.xidIsLike)) {
        return;
    }
    var q = new query.Query();
    if (options.nameIsLike) {
        q.push(new query.Query({
            name: 'like',
            args: ['name', this.interpolateOption(options.nameIsLike)]
        }));
    }
    if (options.xidIsLike) {
        q.push(new query.Query({
            name: 'like',
            args: ['xid', this.interpolateOption(options.xidIsLike)]
        }));
    }
    return q;
};

WatchListParametersController.prototype.interpolateOption = function interpolateOption(option) {
    if (typeof option !== 'string' || option.indexOf('{{') < 0)
        return option;
    
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
