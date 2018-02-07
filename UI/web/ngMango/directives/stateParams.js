/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

 /**
  * @ngdoc directive
  * @name ngMango.directive:maStateParams
  * @restrict E
  * @description Get and set [angular-ui-router](https://ui-router.github.io/ng1/docs/0.3.2/#/api/ui.router) state parameters.
  *
  * @param {expression} state-params Assignable expression to output $stateParams to.
  * @param {object=} update-params Every time a new object is passed to this attribute the $stateParams will be updated.
  *     You cannot modify the $stateParams directly via the object output on `state-params`.
  *     To remove the state param, the property value should be `undefined`. The property value `null` will be mapped to the string `'null'`.
  * @param {expression=} on-change Expression is evaluated when the $stateParams change.
  *     Available scope parameters are `$stateParams`, `$arrayParams` `$state`, and `$init`.
  *     `$stateParams` are the same as the angular-ui-router service but null is replaced with the string 'null'.
  *     `$arrayParams` are a normalized copy of $stateParams where every parameter value is always an array. `undefined` is mapped to an empty array. 
  * @param {boolean=} [notify-on-init=true] If false the `on-change` expression will not be called on directive initialization.
  */

define(['angular', 'require'], function(angular, require) {
'use strict';

const nullString = 'null';

stateParams.$inject = [];
function stateParams() {

    const $inject = ['$timeout', '$injector'];
    class StateParamsController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return $inject; }
        
        constructor($timeout, $injector) {
            this.$timeout = $timeout;
            if ($injector.has('$state')) {
                this.$state = $injector.get('$state');
            }
            if ($injector.has('$stateParams')) {
                this.$stateParams = $injector.get('$stateParams');
            }
        }
        
        $onInit() {
            this.stateParams = this.$stateParams;
            if (this.notifyOnInit || this.notifyOnInit == null) {
                this.notifyChange(true);
            }
        }
        
        $onChanges(changes) {
            if (changes.updateParams && this.updateParams) {
                const encodedParams = this.encodeParams(this.updateParams);
                
                const changed = Object.keys(encodedParams).some(key => {
                    const paramValue = encodedParams[key];
                    return this.$stateParams.hasOwnProperty(key) && !angular.equals(paramValue, this.$stateParams[key]);
                });
                
                if (changed) {
                    this.$state.go('.', encodedParams, {location: 'replace', notify: false});
    
                    if (this.onChange) {
                        // delay so that $stateParams are updated
                        this.$timeout(() => {
                            this.notifyChange();
                        }, 0);
                    }
                }
            }
        }
        
        notifyChange(init = false) {
            if (this.onChange) {
                const params = this.decodeParams(this.$stateParams);
                
                // generate a separate object which is always an array
                // if you set this.$state.go('.', {xyz: ['abc']}) then $stateParams will be {xyz: 'abc'}, the array is lost
                const arrayParams = {};
                Object.keys(params).forEach(key => {
                    const paramValue = params[key];
                    if (paramValue === undefined) {
                        arrayParams[key] = [];
                    } else if (!Array.isArray(paramValue)) {
                        arrayParams[key] = [paramValue];
                    } else {
                        arrayParams[key] = paramValue;
                    }
                });
                
                this.onChange({$stateParams: params, $init: init, $state: this.$state, $arrayParams: arrayParams});
            }
        }
        
        /**
         * Encodes null into 'null', and empty array into undefined, unwraps single element arrays e.g. [a] => a
         */
        encodeParams(inputParameters) {
            const params = Object.assign({}, inputParameters);

            Object.keys(params).forEach(key => {
                const paramValue = params[key];
                if (Array.isArray(paramValue)) {
                    if (!paramValue.length) {
                        params[key] = undefined;
                    } else if (paramValue.length === 1) {
                        params[key] = paramValue[0] === null ? nullString : paramValue[0];
                    } else {
                        params[key] = paramValue.map(value => {
                            return value === null ? nullString : value;
                        });
                    }
                } else if (paramValue === null) {
                    params[key] = nullString;
                }
            });
            
            return params;
        }
        
        /**
         * Decodes 'null' into null
         */
        decodeParams(inputParameters) {
            const params = Object.assign({}, inputParameters);

            Object.keys(params).forEach(key => {
                const paramValue = params[key];
                if (Array.isArray(paramValue)) {
                    params[key] = paramValue.map(value => {
                        return value === nullString ? null : value;
                    });
                } else if (paramValue === nullString) {
                    params[key] = null;
                }
            });
            
            return params;
        }
    }

    return {
        restrict: 'E',
        scope: false,
        bindToController: {
            stateParams: '=?',
            updateParams: '<?',
            onChange: '&?',
            notifyOnInit: '<?'
        },
        controller: StateParamsController
    };
}

return stateParams;

}); // define
