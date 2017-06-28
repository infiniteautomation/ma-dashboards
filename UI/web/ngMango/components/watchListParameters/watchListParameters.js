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
        parametersChanged: '&',
        parameters: '<?'
    },
    designerInfo: {
        translation: 'ui.components.watchListParameters',
        icon: 'settings',
        category: 'watchLists',
        size: {
            width: '100%'
        },
        attributes: {
            watchList: {defaultValue: 'designer.watchList'},
            parametersChanged: {defaultValue: 'designer.parameters = $parameters'}
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

WatchListParametersController.prototype.$onChanges = function(changes) {
    if (changes.watchList && this.watchList) {
    	if (this.watchList.data && this.watchList.data.paramValues) {
    		this.parameters = this.watchList.data.paramValues;
    	} else if (!this.parameters) {
    		this.parameters = {};
    	}
    }
};

WatchListParametersController.prototype.$onInit = function() {
};

WatchListParametersController.prototype.inputChanged = function inputChanged() {
	if (this.watchList) {
		this.parametersChanged({$parameters: angular.extend({}, this.parameters)});
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
