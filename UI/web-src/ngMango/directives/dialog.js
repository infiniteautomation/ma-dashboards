/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maDialog
 * @restrict E
 * @description
 */

import angular from 'angular';
import dialogTemplate from './dialog.html';

dialog.$inject = ['$compile'];
function dialog($compile) {

    class DialogController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$scope', '$element', '$transclude', '$mdDialog']; }
        
        constructor($scope, $element, $transclude, $mdDialog) {
            this.$scope = $scope;
            this.$element = $element;
            this.$transclude = $transclude;
            this.$mdDialog = $mdDialog;
        }
        
        $onChanges(changes) {
        }
        
        $onInit() {
            const $transclude = this.$transclude;
            
            const toolbar = angular.element(this.$element[0].querySelector('md-toolbar'));
            const content = angular.element(this.$element[0].querySelector('md-dialog-content'));
            const actions = angular.element(this.$element[0].querySelector('md-dialog-actions'));
            
            if ($transclude.isSlotFilled('toolbar')) {
                $transclude((clone, scope) => {
                    scope.$dialog = this;
                    toolbar.append(clone);
                }, null, 'toolbar');
            }
            
            if ($transclude.isSlotFilled('actions')) {
                $transclude((clone, scope) => {
                    scope.$dialog = this;
                    actions.append(clone);
                }, null, 'actions');
            }
            
            $transclude((clone, scope) => {
                scope.$dialog = this;
                content.append(clone);
            });
        }
        
        hide(result) {
            this.$mdDialog.hide(result);
        }
        
        cancel(error) {
            this.$mdDialog.cancel(error);
        }
    }
    
    return {
        scope: {},
        restrict: 'A',
        transclude: {
            toolbar: '?mdToolbar',
            actions: '?mdDialogActions'
        },
        template: dialogTemplate,
        terminal: false,
        controller: DialogController,
        controllerAs: '$ctrl',
        bindToController: {
            padding: '<?maDialogPadding',
            title: '@?maDialogTitle',
            titleTr: '@?maDialogTitleTr',
            hideActions: '<?maDialogHideActions'
        }
    };
}

export default dialog;