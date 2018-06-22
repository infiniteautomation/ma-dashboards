/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

// TODO Mango 3.5 remove this directive (Replaced by stateParams.js in ngMango)

stateParams.$inject = ['$stateParams', '$state', '$timeout'];
function stateParams($stateParams, $state, $timeout) {

    const $inject = ['$scope'];
    class StateParamsController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return $inject; }
        
        constructor($scope) {
            this.$scope = $scope;
        }
        
        $onInit() {
            this.stateParams = $stateParams;
            this.notifyChange(true);
        }
        
        $onChanges(changes) {
            if (changes.updateParams && this.updateParams) {
                $state.go('.', this.updateParams, {location: 'replace', notify: false});
                this.stateParams = $stateParams;
                this.notifyChange();
            }
        }
        
        notifyChange(init) {
            if (!this.onChange) return;
            
            // wait for next digest cycle so $stateParams are updated
            $timeout(() => {
                this.$scope.$apply(() => {
                    this.onChange({$stateParams: $stateParams, $onInit: init});
                });
            }, 0, false);
        }
    }

    return {
        restrict: 'E',
        scope: false,
        controllerAs: '$ctrl',
        bindToController: {
            stateParams: '=?',
            updateParams: '<?',
            onChange: '&?'
        },
        controller: StateParamsController
    };
}

export default stateParams;


