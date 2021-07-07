/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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

stateParams.$inject = [];
function stateParams() {

    const $inject = ['$timeout', 'maUtil', '$injector'];
    class StateParamsController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return $inject; }
        
        constructor($timeout, maUtil, $injector) {
            this.$timeout = $timeout;
            this.maUtil = maUtil;
            
            if ($injector.has('$state')) {
                this.$state = $injector.get('$state');
            }
            if ($injector.has('$stateParams')) {
                this.$stateParams = $injector.get('$stateParams');
            }
        }
        
        $onInit() {
            this.stateParams = this.$stateParams;
            if (this.onChange && (this.notifyOnInit || this.notifyOnInit == null)) {
                this.notifyChangeNow(true);
            }
        }
        
        $onChanges(changes) {
            if (changes.updateParams && this.updateParams) {
                const encodedParams = this.maUtil.encodeStateParams(this.updateParams);
                if (this.maUtil.updateStateParams(encodedParams)) {
                    this.notifyChange();
                }
            }
        }
        
        notifyChange() {
            if (!this.onChange) return;
            
            // delay after update so that $stateParams are updated by the time onChange() is called
            this.$timeout(() => {
                this.notifyChangeNow();
            }, 0);
        }
        
        notifyChangeNow(init = false) {
            if (!this.onChange) return;
            
            // If you set this.$state.go('.', {xyz: ['abc']}) then $stateParams will be {xyz: 'abc'}, the array is lost.
            // Supply user with $arrayParams for setting value on multiple select drop downs.
            const params = this.maUtil.decodedStateParams();
            const arrayParams = this.maUtil.createArrayParams(params);
            this.onChange({$stateParams: params, $init: init, $state: this.$state, $arrayParams: arrayParams});
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

export default stateParams;


