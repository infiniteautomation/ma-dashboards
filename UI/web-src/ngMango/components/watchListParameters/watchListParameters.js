/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
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
  */

import watchListParametersTemplate from './watchListParameters.html';
import query from 'rql/query';


class WatchListParametersController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$parse', '$interpolate', '$filter']; }
    
    constructor($parse, $interpolate, $filter) {
        this.$parse = $parse;
        this.$interpolate = $interpolate;
        this.maFilter = $filter('maFilter');
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => {
            this.parameters = Object.assign({}, this.ngModelCtrl.$viewValue);
            this.updateOptionValues();
        };
    }

    $onChanges(changes) {
        if (changes.watchList && !changes.watchList.isFirstChange()) {
            this.updateOptionValues();
        }
    }

    inputChanged() {
        // TODO remove selected tag values that are no longer valid
        this.updateOptionValues();

        this.ngModelCtrl.$setViewValue(Object.assign({}, this.parameters));
    }

    /**
     * Interpolates all the options with the parameter values and stores them
     */
    updateOptionValues() {
        this.optionValues = {};

        if (!this.watchList || !Array.isArray(this.watchList.params)) {
            return;
        }

        this.watchList.params.filter(p => !!p.options)
        .forEach(p => {
            this.optionValues[p.name] = {};
            Object.keys(p.options).forEach(optionName => {
                const value = p.options[optionName];
                if (value != null && typeof value === 'object') {
                    this.optionValues[p.name][optionName] = this.interpolateObjectValues(value);
                } else {
                    this.optionValues[p.name][optionName] = this.interpolateOption(value);
                }
            });

            // Creates a virtual option called dsQuery that combines the nameIsLike and xidIsLike options
            if (p.type === 'dataSource' && (p.options.nameIsLike || p.options.xidIsLike)) {
                const dsQuery = new query.Query();
                if (p.options.nameIsLike) {
                    dsQuery.push(new query.Query({
                        name: 'match',
                        args: ['name', this.optionValues[p.name].nameIsLike]
                    }));
                }
                if (p.options.xidIsLike) {
                    dsQuery.push(new query.Query({
                        name: 'match',
                        args: ['xid', this.optionValues[p.name].xidIsLike]
                    }));
                }
                this.optionValues[p.name].dsQuery = dsQuery;
            }
        });
    }
    
    interpolateObjectValues(option) {
        if (option == null) return option;
        
        const result = {};
        
        Object.keys(option).forEach(key => {
            result[key] = this.interpolateOption(option[key]);
        });
        
        return result;
    }
    
    interpolateOption(option) {
        if (typeof option !== 'string' || option.indexOf('{{') < 0)
            return option;
    
        // if the whole string is contained within {{}} extract the expression and parse it into a
        // number etc instead of interpolating it into a string
        const matches = /{{(.*?)}}/.exec(option);
        if (matches && matches[0] === matches.input) {
            option = this.$parse(matches[1])(this.parameters);
        } else {
            option = this.$interpolate(option)(this.parameters);
        }
        return option;
    }
    
    filterOptions(param, filter) {
        const options = param.options.options;
        if (!param.options.filtering || !filter) {
            return options;
        }
        return this.maFilter(options, filter, ['value', 'label']);
    }
    
    optionLabel(param) {
        const value = this.parameters[param.name];
        const multiple = param.options.multiple && Array.isArray(value);
        const options = param.options.options.filter(o => {
            if (multiple) {
                return value.includes(o.value);
            }
            return o.value === value;
        });
        return options.map(o => o.label || o.value).join(', ');
    }
}

export default {
    controller: WatchListParametersController,
    template: watchListParametersTemplate,
    bindings: {
        watchList: '<',
        parametersChanged: '&?',
        parameters: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
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
