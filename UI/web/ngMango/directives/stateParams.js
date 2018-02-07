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
  * @param {expression=} on-change Expression is evaluated when the $stateParams change. Available scope parameters are `$stateParams`, `$state`, and `$init`.
  * @param {boolean=} [notify-on-init=true] If false the `on-change` expression will not be called on directive initialization.
  */

define(['angular', 'require'], function(angular, require) {
'use strict';

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
                this.$state.go('.', this.updateParams, {location: 'replace', notify: false});
                
                if (this.onChange) {
                    // delay so that $stateParams are updated
                    this.$timeout(() => {
                        this.notifyChange();
                    }, 0);
                }
            }
        }
        
        notifyChange(init = false) {
            if (this.onChange) {
                this.onChange({$stateParams: this.$stateParams, $init: init, $state: this.$state});
            }
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
